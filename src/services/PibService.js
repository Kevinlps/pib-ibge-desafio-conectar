export default class PibService {
  constructor({
    urlPibTotal = "https://servicodados.ibge.gov.br/api/v3/agregados/6784/variaveis/9808?localidades=N1[all]",
    urlPibPerCapita = "https://servicodados.ibge.gov.br/api/v3/agregados/6784/variaveis/9812?localidades=N1[all]"
  } = {}) {
    this.urlPibTotal = urlPibTotal;
    this.urlPibPerCapita = urlPibPerCapita;
  }

  async fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  }

  parseNumber(value) {
    if (!value || typeof value !== "string") return 0;
    return parseFloat(value.replace(/[^\d,-]/g, "").replace(",", "."));
  }

  extractSeries(data) {
    const serie = data?.[0]?.resultados?.[0]?.series?.[0]?.serie;
    if (!serie) throw new Error("Série de dados inválida ou ausente");

    const anos = Object.keys(serie)
      .sort((a, b) => parseInt(a) - parseInt(b));

    const valores = anos.map(ano => {
      return this.parseNumber(serie[ano]);
    });

    return { anos, valores };
  }

  async fetchPibData() {
    try {
      const [dataPibTotal, dataPibPerCapita] = await Promise.all([
        this.fetchJson(this.urlPibTotal),
        this.fetchJson(this.urlPibPerCapita)
      ]);

      // PIB Total está em MILHÕES de R$ - manter assim
      const { anos: anosTotal, valores: pibTotal } = this.extractSeries(dataPibTotal);
      
      // PIB per capita já está em R$ absolutos
      const { anos: anosPerCapita, valores: pibPerCapita } = this.extractSeries(dataPibPerCapita);

      const anosComuns = anosTotal.filter(ano => anosPerCapita.includes(ano));

      console.log("PIB Total (milhões R$):", pibTotal);
      console.log("PIB Per Capita (R$):", pibPerCapita);

      return {
        anos: anosComuns.map(a => parseInt(a)),
        pibTotal: anosComuns.map(ano => pibTotal[anosTotal.indexOf(ano)]),
        pibPerCapita: anosComuns.map(ano => pibPerCapita[anosPerCapita.indexOf(ano)]),
        meta: {
          fonte: "IBGE - Contas Nacionais",
          agregado: 6784,
          variaveis: { total: 9808, perCapita: 9812 },
          unidade: "PIB Total em milhões de R$, PIB per capita em R$",
          observacao: "Valores em reais correntes"
        }
      };
    } catch (error) {
      console.error("Erro ao buscar dados de PIB:", error);
      throw error;
    }
  }
}