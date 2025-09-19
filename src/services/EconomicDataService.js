import PibService from "./PibService";
import ExchangeService from "./ExchangeService";

export default class EconomicDataService {
  constructor() {
    this.pibService = new PibService();
    this.exchangeService = new ExchangeService();
  }
  async getEconomicData() {
    try {
      const pibData = await this._fetchPibData();
      const exchangeRates = await this._fetchExchangeRates(pibData.anos);
      const filteredData = this._filterDataByAvailableRates(pibData, exchangeRates);
      const convertedData = this._convertToUSD(filteredData);
      
      return this._buildResponse(convertedData);
    } catch (error) {
      console.error("Erro ao processar dados econômicos:", error);
      throw error;
    }
  }
  async _fetchPibData() {
    const { anos, pibTotal, pibPerCapita, meta } = await this.pibService.fetchPibData();
    return { anos, pibTotal, pibPerCapita, meta };
  }

  async _fetchExchangeRates(anos) {
    const taxasCambio = await this.exchangeService.getRatesForYears("USD-BRL", anos);
    return taxasCambio;
  }

  _filterDataByAvailableRates(pibData, exchangeRates) {
    const { anos, pibTotal, pibPerCapita, meta } = pibData;
    
    const validIndices = exchangeRates
      .map((rate, index) => rate !== undefined ? index : -1)
      .filter(index => index !== -1);

    return {
      anos: validIndices.map(i => anos[i]),
      pibTotal: validIndices.map(i => pibTotal[i]),
      pibPerCapita: validIndices.map(i => pibPerCapita[i]),
      exchangeRates: validIndices.map(i => exchangeRates[i]),
      meta
    };
  }

  _convertToUSD(filteredData) {
    const { anos, pibTotal, pibPerCapita, exchangeRates, meta } = filteredData;
    const pibTotalUSD = pibTotal.map((valor, i) =>
      this.exchangeService.convertToUSD(valor * 1_000_000, exchangeRates[i])
    );
    const pibPerCapitaUSD = pibPerCapita.map((valor, i) =>
      this.exchangeService.convertToUSD(valor / 100, exchangeRates[i])
    );
    this._validateResults(anos, pibTotal, exchangeRates, pibTotalUSD);

    return {
      anos,
      pibTotalUSD,
      pibPerCapitaUSD,
      meta,
      exchangeRates
    };
  }
_validateResults(anos, pibTotalOriginal) {
  const index2017 = anos.findIndex(ano => ano === 2017);
  
  if (index2017 !== -1) {
    const pibReais = pibTotalOriginal[index2017] * 1_000_000;
    const pibEsperado = 6_592_743_000_000;
    Math.abs(pibReais - pibEsperado) / pibEsperado * 100;
  }
}
  _buildResponse(convertedData) {
    const { anos, pibTotalUSD, pibPerCapitaUSD, meta, exchangeRates } = convertedData;
    
    return {
      labels: anos.map(ano => ano.toString()),
      pibTotal: pibTotalUSD,
      pibPerCapita: pibPerCapitaUSD,
      meta: {
        ...meta,
        primeiroAno: anos[0],
        ultimoAno: anos[anos.length - 1],
        totalAnos: anos.length,
        fonteCambio: "AwesomeAPI",
        moeda: "USD",
        taxasUtilizadas: exchangeRates.length
      }
    };
  }
  clearCache() {
    this.exchangeService.clearCache();
  }
  getCacheInfo() {
    return this.exchangeService.getCacheInfo();
  }
}