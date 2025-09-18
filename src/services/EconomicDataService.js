import PibService from "./PibService";
import ExchangeService from "./ExchangeService";

export default class EconomicDataService {
  constructor() {
    this.pibService = new PibService();
    this.exchangeService = new ExchangeService();
  }

  async getEconomicData() {
    try {
      // Busca dados do PIB
      const { anos, pibTotal, pibPerCapita, meta } = await this.pibService.fetchPibData();

      console.log("Anos:", anos);
      console.log("PIB Total (milhões R$):", pibTotal);
      console.log("PIB Per Capita (R$):", pibPerCapita);

      // Busca taxas de câmbio para todos os anos
      const taxasCambio = await this.exchangeService.getRatesForYears(
        "USD-BRL",
        anos
      );
      console.log("Taxas de câmbio:", taxasCambio);

      // Filtra anos com taxas de câmbio disponíveis
      const anosFiltrados = anos.filter((_, i) => taxasCambio[i] !== undefined);
      const taxasFiltradas = taxasCambio.filter((rate) => rate !== undefined);

      const pibTotalFiltrado = pibTotal.filter(
        (_, i) => taxasCambio[i] !== undefined
      );
      const pibPerCapitaFiltrado = pibPerCapita.filter(
        (_, i) => taxasCambio[i] !== undefined
      );

      // 🔍 INVESTIGAÇÃO DETALHADA DOS DADOS BRUTOS - AGORA NA POSIÇÃO CORRETA
      console.log("🔍 INVESTIGAÇÃO DETALHADA:");
      console.log("PIB Total filtrado:", pibTotalFiltrado);
      console.log("PIB Per Capita filtrado:", pibPerCapitaFiltrado);
      console.log("Taxas filtradas:", taxasFiltradas);
      
      // Teste com primeiro ano para verificar escalas
      if (pibTotalFiltrado.length > 0) {
        const primeiroAno = anosFiltrados[0];
        const valorBruto = pibTotalFiltrado[0];
        const taxa = taxasFiltradas[0];
        
        console.log(`${primeiroAno} - PIB Total bruto: ${valorBruto} milhões R$`);
        console.log(`Convertido para R$: R$ ${(valorBruto * 1000000).toLocaleString('pt-BR')}`);
        console.log(`Taxa USD-BRL: ${taxa}`);
        console.log(`Convertido para USD: USD ${((valorBruto * 1000000) / taxa).toLocaleString('en-US')}`);
        console.log(`PIB real 2017 era: R$ 6.592.743.000.000 (6,592 trilhões)`);
      }

      // CONVERSÃO PARA USD
      const pibTotalUSD = pibTotalFiltrado.map((valor, i) =>
        this.exchangeService.convertToUSD(valor * 1000000, taxasFiltradas[i])
      );

      // PIB per capita vem em centavos → dividir por 100 antes de converter
      const pibPerCapitaUSD = pibPerCapitaFiltrado.map((valor, i) =>
        this.exchangeService.convertToUSD(valor / 100, taxasFiltradas[i])
      );

      console.log("PIB Total (USD):", pibTotalUSD);
      console.log("PIB Per Capita (USD):", pibPerCapitaUSD);

      // 🔍 VALIDAÇÃO DOS RESULTADOS FINAIS
      console.log("🔍 VALIDAÇÃO DOS RESULTADOS:");
      anosFiltrados.forEach((ano, i) => {
        const pibTotalReais = pibTotalFiltrado[i] * 1000000;
        const pibPerCapitaReais = pibPerCapitaFiltrado[i] / 100;
        
        console.log(`${ano}:`);
        console.log(`  PIB Total: R$ ${pibTotalReais.toLocaleString('pt-BR')} → ${pibTotalUSD[i].toLocaleString('en-US', { 
          style: 'currency', 
          currency: 'USD',
          maximumFractionDigits: 0
        })}`);
        console.log(`  PIB Per Capita: R$ ${pibPerCapitaReais.toLocaleString('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        })} → ${pibPerCapitaUSD[i].toLocaleString('en-US', { 
          style: 'currency', 
          currency: 'USD' 
        })}`);
        console.log(`  Taxa USD-BRL: ${taxasFiltradas[i].toFixed(4)}`);
        
        // Verificação se os valores fazem sentido
        if (ano === 2017) {
          const pibEsperado = 6592743000000; // R$ 6,592 trilhões
          const diferencaPercent = Math.abs(pibTotalReais - pibEsperado) / pibEsperado * 100;
          console.log(`  ✅ Verificação 2017: Diferença do valor real: ${diferencaPercent.toFixed(2)}%`);
        }
        console.log('---');
      });

      return {
        labels: anosFiltrados.map((a) => a.toString()),
        pibTotal: pibTotalUSD,
        pibPerCapita: pibPerCapitaUSD,
        meta: {
          ...meta,
          primeiroAno: anosFiltrados[0],
          ultimoAno: anosFiltrados[anosFiltrados.length - 1],
          totalAnos: anosFiltrados.length,
          fonteCambio: "AwesomeAPI",
          moeda: "USD",
        },
      };
    } catch (error) {
      console.error("Erro ao processar dados econômicos:", error);
      throw error;
    }
  }

  clearCache() {
    this.exchangeService.clearCache();
  }

  getCacheInfo() {
    return this.exchangeService.getCacheInfo();
  }
}