export default class ExchangeService {
  constructor({
    baseURL = "https://economia.awesomeapi.com.br",
    cacheEnabled = true
  } = {}) {
    this.baseURL = baseURL;
    this.cacheEnabled = cacheEnabled;
    this._cache = new Map();
  }
  async fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Resposta não é JSON: ${contentType}`);
    }
    
    return await response.json();
  }
  async getAnnualAverageRate(currencyPair = 'USD-BRL', year) {
    const cacheKey = `${currencyPair}-${year}`;
    
    if (this.cacheEnabled && this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey);
    }
    try {
      const url = `${this.baseURL}/json/daily/${currencyPair}/?start_date=${year}0101&end_date=${year}1231`;
      const data = await this.fetchJson(url);

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error(`Nenhuma cotação encontrada para ${year}`);
      }
      const rates = data
        .map(item => parseFloat(item.bid))
        .filter(rate => !isNaN(rate) && rate > 0);

      if (rates.length === 0) {
        throw new Error(`Cotações inválidas para ${year}`);
      }
      const averageRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
      if (this.cacheEnabled) {
        this._cache.set(cacheKey, averageRate);
      }
      return averageRate;
    } catch (error) {
      console.error(`Erro ao buscar taxa para ${year}:`, error.message);
      throw error;
    }
  }
  async getRatesForYears(currencyPair, years) {
  const rates = [];
  for (const year of years) {
    try {
      const rate = await this.getAnnualAverageRate(currencyPair, year);
      rates.push(rate);
    } catch (error) {
      console.warn(`⚠️ Sem taxa para ${year}, removendo este ano.`, error.message);
    }
  }
  return rates;
}
  convertToUSD(value, exchangeRate) {
    if (!exchangeRate || exchangeRate <= 0) {
      throw new Error('Taxa de câmbio inválida');
    }
    return value / exchangeRate;
  }
  clearCache() {
    this._cache.clear();
  }
  getCacheInfo() {
    return {
      size: this._cache.size,
      keys: Array.from(this._cache.keys())
    };
  }
}