import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PibService from '../PibService';

describe('PibService', () => {
  let pibService;
  let mockFetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
    pibService = new PibService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const setupMockFetch = (ok, data, status = 200, statusText = 'OK') => {
    mockFetch.mockResolvedValueOnce({
      ok,
      status,
      statusText,
      json: () => Promise.resolve(data)
    });
  };

  describe('fetchJson', () => {
    it('deve retornar dados JSON e chamar o fetch com a URL correta', async () => {
      const mockData = { data: 'test' };
      setupMockFetch(true, mockData);

      const result = await pibService.fetchJson('http://test.com');
      
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith('http://test.com');
    });

    it('deve lançar erro quando a resposta não for ok', async () => {
      setupMockFetch(false, null, 404, 'Not Found');

      await expect(pibService.fetchJson('http://test.com'))
        .rejects
        .toThrow('HTTP 404: Not Found');
    });

    it('deve lançar erro quando o fetch falhar na rede', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(pibService.fetchJson('http://test.com'))
        .rejects
        .toThrow('Network error');
    });
  });

  describe('parseNumber', () => {
    it('deve converter string com vírgula para número', () => {
      expect(pibService.parseNumber('1.234,56')).toBe(1234.56);
    });

    it('deve retornar 0 para valores inválidos', () => {
      const invalidValues = [null, undefined, 123, ''];
      invalidValues.forEach(value => {
        expect(pibService.parseNumber(value)).toBe(0);
      });
    });
  });

  describe('extractSeries', () => {
    it('deve extrair e ordenar os anos e valores da série', () => {
      const mockData = [{
        resultados: [{
          series: [{
            serie: {
              '2020': '1000,50',
              '2019': '900,25',
              '2021': '1100,75'
            }
          }]
        }]
      }];

      const result = pibService.extractSeries(mockData);
      
      expect(result.anos).toEqual(['2019', '2020', '2021']);
      expect(result.valores).toEqual([900.25, 1000.50, 1100.75]);
    });

    it('deve lançar erro quando a série for inválida ou ausente', () => {
      const invalidData = [{}, null, undefined, [{ resultados: [{ series: [{}] }] }]];
      invalidData.forEach(data => {
        expect(() => pibService.extractSeries(data))
          .toThrow('Série de dados inválida ou ausente');
      });
    });
  });

  describe('fetchPibData', () => {
    it('deve retornar dados do PIB Total e Per Capita formatados corretamente', async () => {
      const mockPibTotalData = [{
        resultados: [{
          series: [{
            serie: { '2020': '2000,00', '2019': '1900,00' }
          }]
        }]
      }];

      const mockPibPerCapitaData = [{
        resultados: [{
          series: [{
            serie: { '2020': '100,00', '2019': '95,00' }
          }]
        }]
      }];

      setupMockFetch(true, mockPibTotalData);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPibPerCapitaData)
      });

      const result = await pibService.fetchPibData();

      expect(result.anos).toEqual([2019, 2020]);
      expect(result.pibTotal).toEqual([1900, 2000]);
      expect(result.pibPerCapita).toEqual([95, 100]);
      expect(result.meta.fonte).toBe('IBGE - Contas Nacionais');
      expect(mockFetch).toHaveBeenCalledWith(pibService.urlPibTotal);
      expect(mockFetch).toHaveBeenCalledWith(pibService.urlPibPerCapita);
    });

    it('deve filtrar para incluir apenas anos comuns entre as duas séries', async () => {
      const mockPibTotalData = [{
        resultados: [{
          series: [{
            serie: { '2020': '2000,00', '2019': '1900,00', '2018': '1800,00' }
          }]
        }]
      }];

      const mockPibPerCapitaData = [{
        resultados: [{
          series: [{
            serie: { '2020': '100,00', '2019': '95,00' }
          }]
        }]
      }];

      setupMockFetch(true, mockPibTotalData);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPibPerCapitaData)
      });

      const result = await pibService.fetchPibData();
      
      expect(result.anos).toEqual([2019, 2020]);
    });

    it('deve lançar erro quando uma das chamadas Promise.all falhar', async () => {
      setupMockFetch(true, [{ resultados: [{ series: [{ serie: {} }] }] }]);
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      await expect(pibService.fetchPibData())
        .rejects
        .toThrow('Network error');
    });
  });
});