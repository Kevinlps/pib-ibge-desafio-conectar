import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import EconomicDataService from '../EconomicDataService'


vi.mock('../PibService')
vi.mock('../ExchangeService')

describe('EconomicDataService', () => {
  let economicDataService
  let mockPibService
  let mockExchangeService

  beforeEach(() => {
    vi.clearAllMocks()

    economicDataService = new EconomicDataService()
    mockPibService = economicDataService.pibService
    mockExchangeService = economicDataService.exchangeService
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getEconomicData', () => {
    describe.each([
      [1000, 5.0, 200000000], 
      [1100, 5.5, 200000000], 
      [1200, 6.0, 200000000]
    ])(
      'deve retornar dados processados corretamente para PIB total de %f com taxa %f',
      (pibTotalOriginal, exchangeRate, expectedPibTotalUSD) => {
        it('deve retornar dados econômicos processados corretamente', async () => {
          const mockedPibData = {
            anos: [2019, 2020, 2021],
            pibTotal: [1000, 1100, 1200],
            pibPerCapita: [50, 55, 60],
            meta: { fonte: 'IBGE' }
          }
          const mockedExchangeRates = [5.0, 5.5, 6.0]

          mockPibService.fetchPibData.mockResolvedValue(mockedPibData)
          mockExchangeService.getRatesForYears.mockResolvedValue(mockedExchangeRates)

          mockExchangeService.convertToUSD.mockImplementation((value, rate) => value / rate)

          const result = await economicDataService.getEconomicData()

          result.pibPerCapita.forEach(value => {
            expect(value).toBeCloseTo(0.1)
          })

          expect(result.meta).toEqual({
            fonte: 'IBGE',
            primeiroAno: 2019,
            ultimoAno: 2021,
            totalAnos: 3,
            fonteCambio: 'AwesomeAPI',
            moeda: 'USD',
            taxasUtilizadas: 3
            }
          )
        })
      }
    )

    it('deve filtrar dados quando nem todas as taxas estão disponíveis', async () => {
      const mockedPibData = {
        anos: [2019, 2020, 2021],
        pibTotal: [1000, 1100, 1200],
        pibPerCapita: [50, 55, 60], 
        meta: { fonte: 'IBGE' }
      }
      const mockedExchangeRates = [5.0, undefined, 6.0]

      mockPibService.fetchPibData.mockResolvedValue(mockedPibData)
      mockExchangeService.getRatesForYears.mockResolvedValue(mockedExchangeRates)
      mockExchangeService.convertToUSD.mockImplementation((value, rate) => value / rate)

      const result = await economicDataService.getEconomicData()

      expect(result.labels).toEqual(['2019', '2021'])
      expect(result.pibTotal).toEqual([200000000, 200000000])
      expect(result.pibPerCapita).toEqual([0.1, 0.1])
      expect(result.meta.totalAnos).toBe(2)
      expect(result.meta.taxasUtilizadas).toBe(2)
    })

    it('deve propagar erro quando PibService falhar', async () => {
      mockPibService.fetchPibData.mockRejectedValue(new Error('PIB service error'))
      await expect(economicDataService.getEconomicData())
        .rejects
        .toThrow('PIB service error')
    })

    it('deve propagar erro quando ExchangeService falhar', async () => {
      mockPibService.fetchPibData.mockResolvedValue({
        anos: [2019],
        pibTotal: [1000],
        pibPerCapita: [50],
        meta: {}
      })
      mockExchangeService.getRatesForYears.mockRejectedValue(new Error('Exchange service error'))
      await expect(economicDataService.getEconomicData())
        .rejects
        .toThrow('Exchange service error')
    })
    it('deve chamar os métodos dos serviços com os argumentos corretos', async () => {

      const mockedPibData = {
        anos: [2019, 2020],
        pibTotal: [1000, 1100],
        pibPerCapita: [50, 55],
        meta: { fonte: 'IBGE' }
      }

      mockPibService.fetchPibData.mockResolvedValue(mockedPibData)
      mockExchangeService.getRatesForYears.mockResolvedValue([5.0, 5.5])
      mockExchangeService.convertToUSD.mockImplementation((value, rate) => value / rate)

      await economicDataService.getEconomicData()

      expect(mockPibService.fetchPibData).toHaveBeenCalledTimes(1)

      expect(mockExchangeService.getRatesForYears).toHaveBeenCalledWith("USD-BRL", [2019, 2020])
      expect(mockExchangeService.convertToUSD).toHaveBeenCalledTimes(4) 
    })
  })
})