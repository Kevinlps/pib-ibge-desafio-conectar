class PibService {
  constructor() {
    // URLs para as variáveis específicas do IBGE
    this.urlPibTotal = "https://servicodados.ibge.gov.br/api/v3/agregados/5938/variaveis/37?localidades=N1[all]";
    this.urlPibPerCapita = "https://servicodados.ibge.gov.br/api/v3/agregados/5938/variaveis/513?localidades=N1[all]";
    
    // Taxa de câmbio aproximada (BRL para USD) por ano
    this.taxasCambio = {
      2010: 1.76,
      2011: 1.67,
      2012: 1.95,
      2013: 2.16,
      2014: 2.35,
      2015: 3.33,
      2016: 3.49,
      2017: 3.19,
      2018: 3.65,
      2019: 3.94,
      2020: 5.16,
      2021: 5.4,
      2022: 5.17,
      2023: 4.99,
    };

    // Estimativas de população do Brasil por ano (em milhões)
    this.populacaoEstimada = {
      2010: 194.9,
      2011: 196.9,
      2012: 198.7,
      2013: 200.4,
      2014: 202.0,
      2015: 204.5,
      2016: 206.1,
      2017: 207.7,
      2018: 208.5,
      2019: 210.1,
      2020: 211.8,
      2021: 213.3,
      2022: 215.3,
      2023: 216.4,
    };

    // Dados de fallback em dólares
    this.fallbackData = {
      anos: ['2016', '2017', '2018', '2019', '2020', '2021', '2022'],
      pibTotalUSD: [1798000000000, 2063000000000, 1917000000000, 1877000000000, 1474000000000, 1669000000000, 1915000000000],
      pibPerCapitaUSD: [8720, 9928, 9194, 8927, 6962, 7831, 8917]
    };
  }

  async fetchPibTotal() {
    const response = await fetch(this.urlPibTotal);
    if (!response.ok) {
      throw new Error(`Erro ao buscar PIB Total: ${response.status}`);
    }
    return response.json();
  }

  async fetchPibPerCapita() {
    try {
      const response = await fetch(this.urlPibPerCapita);
      if (response.ok) {
        const data = await response.json();
        console.log("PIB per Capita obtido com sucesso da API");
        return { data, success: true };
      } else {
        console.warn("PIB per Capita não disponível, usando cálculo estimado");
        return { data: null, success: false };
      }
    } catch (error) {
      console.warn("Erro ao buscar PIB per Capita, usando estimativa:", error.message);
      return { data: null, success: false };
    }
  }

  convertToUSD(valorMilReais, ano, isPerCapita = false) {
    const valor = isPerCapita ? valorMilReais : valorMilReais * 1000;
    const taxa = this.taxasCambio[ano] || 4.0;
    return valor / taxa;
  }

  calculatePerCapitaFromTotal(valoresPibTotalUSD, anos) {
    console.log("Calculando PIB per capita com base na população estimada...");
    
    return anos.map((ano, index) => {
      const pibTotalUSD = valoresPibTotalUSD[index];
      const populacao = this.populacaoEstimada[ano];

      if (pibTotalUSD && populacao) {
        return pibTotalUSD / (populacao * 1000000);
      }
      return 0;
    });
  }

  processData(dataPibTotal, dataPibPerCapita, temPibPerCapita) {
    // Processa dados do PIB Total
    const seriePibTotal = dataPibTotal[0]?.resultados?.[0]?.series?.[0]?.serie || {};
    const anos = Object.keys(seriePibTotal).sort();

    if (anos.length === 0) {
      throw new Error("Nenhum dado de PIB encontrado na API");
    }

    // Converte PIB Total de mil reais para dólares
    const valoresPibTotalUSD = anos.map((ano) => {
      const valorMilReais = parseFloat(seriePibTotal[ano]) || 0;
      return this.convertToUSD(valorMilReais, ano, false);
    });

    let valoresPibPerCapitaUSD;

    if (temPibPerCapita && dataPibPerCapita) {
      // Se temos dados de PIB per capita da API
      const seriePibPerCapita = dataPibPerCapita[0]?.resultados?.[0]?.series?.[0]?.serie || {};
      valoresPibPerCapitaUSD = anos.map((ano) => {
        const valorReais = parseFloat(seriePibPerCapita[ano]) || 0;
        return this.convertToUSD(valorReais, ano, true);
      });
    } else {
      // Calcula PIB per capita usando estimativas populacionais
      valoresPibPerCapitaUSD = this.calculatePerCapitaFromTotal(valoresPibTotalUSD, anos);
    }

    // Filtra apenas anos com dados válidos
    const dadosValidos = anos
      .map((ano, index) => ({
        ano,
        totalUSD: valoresPibTotalUSD[index],
        perCapitaUSD: valoresPibPerCapitaUSD[index],
      }))
      .filter((item) => item.totalUSD > 0);

    // Ordena por ano (do mais antigo para o mais recente)
    dadosValidos.sort((a, b) => parseInt(a.ano) - parseInt(b.ano));

    const result = {
      labels: dadosValidos.map((item) => item.ano),
      pibTotal: dadosValidos.map((item) => item.totalUSD),
      pibPerCapita: dadosValidos.map((item) => item.perCapitaUSD),
      fonte: temPibPerCapita ? "IBGE API direta" : "IBGE + estimativa populacional"
    };

    this.logProcessedData(result);
    return result;
  }

  logProcessedData(result) {
    console.log("Dados processados com sucesso:", {
      totalAnos: result.labels.length,
      primeiroAno: result.labels[0],
      ultimoAno: result.labels[result.labels.length - 1],
      exemploTotal2021: result.pibTotal[
        result.labels.indexOf("2021")
      ]?.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
      }),
      exemploPerCapita2021: result.pibPerCapita[
        result.labels.indexOf("2021")
      ]?.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
      fonte: result.fonte
    });
  }

  getFallbackData() {
    console.log("Usando dados de fallback...");
    return {
      labels: this.fallbackData.anos,
      pibTotal: this.fallbackData.pibTotalUSD,
      pibPerCapita: this.fallbackData.pibPerCapitaUSD
    };
  }

  async fetchPibData() {
    try {
      console.log("Iniciando busca dos dados do PIB...");

      // Busca PIB Total
      const dataPibTotal = await this.fetchPibTotal();

      // Busca PIB per Capita
      const { data: dataPibPerCapita, success: temPibPerCapita } = await this.fetchPibPerCapita();

      // Processa os dados
      return this.processData(dataPibTotal, dataPibPerCapita, temPibPerCapita);

    } catch (error) {
      console.error("Erro ao processar dados do IBGE:", error);
      throw error;
    }
  }
}

// Exporta uma instância singleton do service
export const pibService = new PibService();

// Também exporta a classe para casos onde precise criar múltiplas instâncias
export default PibService;