import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ExchangeService from '../ExchangeService';

describe('ExchangeService', () => {
  let exchangeService;
  let mockFetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
    exchangeService = new ExchangeService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const setupMockFetch = (ok, data, contentType = 'application/json', status = 200, statusText = 'OK') => {
    mockFetch.mockResolvedValueOnce({
      ok,
      status,
      statusText,
      headers: { get: () => contentType },
      json: () => Promise.resolve(data)
    });
  };

  describe('fetchJson', () => {
    it('deve retornar dados JSON quando a resposta for bem-sucedida', async () => {
      
      const mockData = [{ bid: '5.20' }];
      setupMockFetch(true, mockData);

      const result = await exchangeService.fetchJson('http://test.com');
      
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith('http://test.com');
    });

    it('deve lançar erro quando o Content-Type não for JSON', async () => {
      setupMockFetch(true, null, 'text/html');

      await expect(exchangeService.fetchJson('http://test.com'))
        .rejects
        .toThrow('Resposta não é JSON: text/html');
    });

    it('deve lançar erro quando a resposta HTTP não for ok', async () => {
      setupMockFetch(false, null, 'application/json', 500, 'Internal Server Error');

      await expect(exchangeService.fetchJson('http://test.com'))
        .rejects
        .toThrow('HTTP 500: Internal Server Error');
    });
  });

  describe('getAnnualAverageRate', () => {
    it('deve calcular a média anual corretamente e usar o fetch com a URL correta', async () => {
      const mockExchangeData = [
        { bid: '5.00' },
        { bid: '5.10' },
        { bid: '5.20' }
      ];
      setupMockFetch(true, mockExchangeData);

      const result = await exchangeService.getAnnualAverageRate('USD-BRL', 2020);
      
      expect(result).toBeCloseTo(5.1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://economia.awesomeapi.com.br/json/daily/USD-BRL/?start_date=20200101&end_date=20201231'
      );
    });

    it('deve usar cache para chamadas subsequentes', async () => {
      const mockExchangeData = [{ bid: '5.00' }];
      setupMockFetch(true, mockExchangeData);

      const result1 = await exchangeService.getAnnualAverageRate('USD-BRL', 2020);
      
      const result2 = await exchangeService.getAnnualAverageRate('USD-BRL', 2020);

      expect(result1).toBe(5.0);
      expect(result2).toBe(5.0);
      expect(mockFetch).toHaveBeenCalledTimes(1); 
    });

    it('deve filtrar cotações inválidas e calcular a média corretamente', async () => {
      const mockExchangeData = [
        { bid: '5.00' },
        { bid: 'invalid' }, 
        { bid: '0' },      
        { bid: '5.20' }
      ];
      setupMockFetch(true, mockExchangeData);

      const result = await exchangeService.getAnnualAverageRate('USD-BRL', 2020);
      
      expect(result).toBeCloseTo(5.1); 
    });

    it('deve lançar erro quando a API retornar um array vazio', async () => {
      setupMockFetch(true, []);
      
      await expect(exchangeService.getAnnualAverageRate('USD-BRL', 2020))
        .rejects
        .toThrow('Nenhuma cotação encontrada para 2020');
    });

    it('deve lançar erro quando todas as cotações forem inválidas', async () => {
      const mockExchangeData = [
        { bid: 'invalid' },
        { bid: '0' }
      ];
      setupMockFetch(true, mockExchangeData);

      await expect(exchangeService.getAnnualAverageRate('USD-BRL', 2020))
        .rejects
        .toThrow('Cotações inválidas para 2020');
    });
  });

  describe('getRatesForYears', () => {
    it('deve retornar um array com as taxas de câmbio para os anos fornecidos', async () => {
      setupMockFetch(true, [{ bid: '5.00' }]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve([{ bid: '5.50' }])
      });
      
      const result = await exchangeService.getRatesForYears('USD-BRL', [2020, 2021]);

      expect(result).toEqual([5.0, 5.5]);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('deve continuar e filtrar o ano se a busca falhar', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      setupMockFetch(true, [{ bid: '5.00' }]);
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve([{ bid: '5.50' }])
      });

      const result = await exchangeService.getRatesForYears('USD-BRL', [2020, 2021, 2022]);

      expect(result).toEqual([5.0, 5.5]); 
      expect(consoleSpy).toHaveBeenCalledWith(
        '⚠️ Sem taxa para 2021, removendo este ano.',
        'Network error'
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('convertToUSD', () => {
    it('deve converter valor para USD corretamente', () => {
      const result = exchangeService.convertToUSD(100, 5.0);
      expect(result).toBe(20);
    });

    it('deve lançar erro para taxa de câmbio inválida', () => {
      const testInvalidRates = [0, -1, null, undefined];
      testInvalidRates.forEach(rate => {
        expect(() => exchangeService.convertToUSD(100, rate))
          .toThrow('Taxa de câmbio inválida');
      });
    });
  });
});