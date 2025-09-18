// PibService.js - Versão Refatorada e Robusta
export default class PibService {
  constructor({
    urlPibTotal = "https://servicodados.ibge.gov.br/api/v3/agregados/5938/variaveis/37?localidades=N1[all]",
    urlPibPerCapita = "https://servicodados.ibge.gov.br/api/v3/agregados/5938/variaveis/513?localidades=N1[all]",
    exchangeApiBase = "/api/json",
  } = {}) {
    this.urlPibTotal = urlPibTotal;
    this.urlPibPerCapita = urlPibPerCapita;
    this.exchangeApiBase = exchangeApiBase;
    this._cacheTaxaAnual = new Map();
  }

  async fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  }

  async fetchTaxaMediaAnual(ano) {
    const cacheKey = String(ano);
    if (this._cacheTaxaAnual.has(cacheKey)) {
      return this._cacheTaxaAnual.get(cacheKey);
    }

    const startDate = `${ano}0101`;
    const endDate = `${ano}1231`;
    const url = `${this.exchangeApiBase}/daily/USD-BRL?start_date=${startDate}&end_date=${endDate}&limit=365`;

    const data = await this.fetchJson(url);

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn(`Nenhuma cotação encontrada para o ano ${ano}`);
      return null;
    }

    const cotacoes = data
      .map(item => parseFloat(item.bid))
      .filter(v => !isNaN(v) && v > 0);

    if (cotacoes.length === 0) {
      console.warn(`Cotações inválidas para o ano ${ano}`);
      return null;
    }

    const taxaMedia = cotacoes.reduce((acc, val) => acc + val, 0) / cotacoes.length;
    this._cacheTaxaAnual.set(cacheKey, taxaMedia);
    return taxaMedia;
  }

  convertToUSD(valorReais, taxaCambio) {
    if (!taxaCambio || taxaCambio <= 0) return null;
    return valorReais / taxaCambio;
  }

  async processData(dataPibTotal, dataPibPerCapita) {
    const serieTotal = dataPibTotal?.[0]?.resultados?.[0]?.series?.[0]?.serie;
    const seriePerCapita = dataPibPerCapita?.[0]?.resultados?.[0]?.series?.[0]?.serie;

    if (!serieTotal || !seriePerCapita) {
      throw new Error("Dados do IBGE incompletos ou inválidos");
    }

    const anos = Object.keys(serieTotal).sort((a, b) => parseInt(a) - parseInt(b));

    // Busca TODAS as taxas de câmbio em paralelo
    const taxas = await Promise.all(
      anos.map(a => this.fetchTaxaMediaAnual(parseInt(a)).catch(() => null))
    );

    const resultados = anos.map((ano, index) => {
      const rawTotal = parseFloat(serieTotal[ano]);
      const rawPerCapita = parseFloat(seriePerCapita[ano]);
      const taxaCambio = taxas[index];

      if (isNaN(rawTotal) || isNaN(rawPerCapita) || rawTotal <= 0 || rawPerCapita <= 0) {
        console.warn(`Dados inválidos para o ano ${ano}, ignorando.`);
        return null;
      }

      // Converte para USD somente se houver taxa
      const totalUSD = this.convertToUSD(rawTotal * 1000, taxaCambio);
      const perCapitaUSD = this.convertToUSD(rawPerCapita, taxaCambio);

      return {
        ano: parseInt(ano),
        totalUSD: totalUSD ?? rawTotal * 1000, // fallback para BRL se sem câmbio
        perCapitaUSD: perCapitaUSD ?? rawPerCapita,
        taxaCambio,
        emUSD: !!taxaCambio
      };
    }).filter(r => r !== null);

    if (resultados.length === 0) {
      throw new Error("Nenhum dado de PIB válido foi processado");
    }

    const todosEmUSD = resultados.every(r => r.emUSD);

    return {
      labels: resultados.map(r => r.ano.toString()),
      pibTotal: resultados.map(r => r.totalUSD),
      pibPerCapita: resultados.map(r => r.perCapitaUSD),
      meta: {
        primeiroAno: resultados[0].ano,
        ultimoAno: resultados[resultados.length - 1].ano,
        totalAnos: resultados.length,
        fontePib: "IBGE",
        fonteCambio: "AwesomeAPI",
        fonteCambioUrl: this.exchangeApiBase,
        moeda: todosEmUSD ? "USD" : "BRL (parcial)",
        anosSemCambio: resultados.filter(r => !r.emUSD).map(r => r.ano)
      }
    };
  }

  async fetchPibData() {
    const [dataPibTotal, dataPibPerCapita] = await Promise.all([
      this.fetchJson(this.urlPibTotal),
      this.fetchJson(this.urlPibPerCapita)
    ]);
    return this.processData(dataPibTotal, dataPibPerCapita);
  }

  clearCache() {
    this._cacheTaxaAnual.clear();
  }

  getCacheInfo() {
    return { size: this._cacheTaxaAnual.size, keys: Array.from(this._cacheTaxaAnual.keys()) };
  }
}
