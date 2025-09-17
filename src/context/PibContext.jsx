import { createContext, useContext, useEffect, useState } from "react";

const PibContext = createContext();

export function PibProvider({ children }) {
  const [labels, setLabels] = useState([]);
  const [pibTotal, setPibTotal] = useState([]);
  const [pibPerCapita, setPibPerCapita] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setIsError(false);

        // URLs para as variáveis específicas do IBGE
        const urlPibTotal =
          "https://servicodados.ibge.gov.br/api/v3/agregados/5938/variaveis/37?localidades=N1[all]";
        const urlPibPerCapita =
          "https://servicodados.ibge.gov.br/api/v3/agregados/5938/variaveis/513?localidades=N1[all]";

        console.log("Iniciando busca dos dados do PIB...");

        // Busca PIB Total
        const resPibTotal = await fetch(urlPibTotal);
        if (!resPibTotal.ok) {
          throw new Error(`Erro ao buscar PIB Total: ${resPibTotal.status}`);
        }
        const dataPibTotal = await resPibTotal.json();

        // Busca PIB per Capita
        let dataPibPerCapita = null;
        let temPibPerCapita = false;

        try {
          const resPibPerCapita = await fetch(urlPibPerCapita);
          if (resPibPerCapita.ok) {
            dataPibPerCapita = await resPibPerCapita.json();
            temPibPerCapita = true;
            console.log("PIB per Capita obtido com sucesso da API");
          } else {
            console.warn(
              "PIB per Capita não disponível, usando cálculo estimado"
            );
          }
        } catch (error) {
          console.warn(
            "Erro ao buscar PIB per Capita, usando estimativa:",
            error.message
          );
        }

        // Processa dados do PIB Total
        const seriePibTotal =
          dataPibTotal[0]?.resultados?.[0]?.series?.[0]?.serie || {};
        const anos = Object.keys(seriePibTotal).sort();

        if (anos.length === 0) {
          throw new Error("Nenhum dado de PIB encontrado na API");
        }

        // Taxa de câmbio aproximada (BRL para USD) por ano
        // Valores históricos aproximados para conversão
        const taxasCambio = {
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

        // Converte PIB Total de mil reais para dólares
        const valoresPibTotalUSD = anos.map((ano) => {
          const valorMilReais = parseFloat(seriePibTotal[ano]) || 0;
          const valorReais = valorMilReais * 1000; // Converte de mil reais para reais
          const taxa = taxasCambio[ano] || 4.0; // Taxa padrão se não encontrada
          return valorReais / taxa; // Converte para USD
        });

        let valoresPibPerCapitaUSD;

        if (temPibPerCapita && dataPibPerCapita) {
          // Se temos dados de PIB per capita da API
          const seriePibPerCapita =
            dataPibPerCapita[0]?.resultados?.[0]?.series?.[0]?.serie || {};
          valoresPibPerCapitaUSD = anos.map((ano) => {
            const valorReais = parseFloat(seriePibPerCapita[ano]) || 0;
            const taxa = taxasCambio[ano] || 4.0;
            return valorReais / taxa; // Converte para USD
          });
        } else {
          // Calcula PIB per capita usando estimativas populacionais
          console.log(
            "Calculando PIB per capita com base na população estimada..."
          );

          // Estimativas de população do Brasil por ano (em milhões)
          const populacaoEstimada = {
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

          valoresPibPerCapitaUSD = anos.map((ano) => {
            const pibTotalUSD = valoresPibTotalUSD[anos.indexOf(ano)];
            const populacao = populacaoEstimada[ano];

            if (pibTotalUSD && populacao) {
              return pibTotalUSD / (populacao * 1000000); // Converte população para unidades
            }
            return 0;
          });
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

        const anosFinais = dadosValidos.map((item) => item.ano);
        const pibTotalFinal = dadosValidos.map((item) => item.totalUSD);
        const pibPerCapitaFinal = dadosValidos.map((item) => item.perCapitaUSD);

        setLabels(anosFinais);
        setPibTotal(pibTotalFinal);
        setPibPerCapita(pibPerCapitaFinal);

        console.log("Dados processados com sucesso:", {
          totalAnos: anosFinais.length,
          primeiroAno: anosFinais[0],
          ultimoAno: anosFinais[anosFinais.length - 1],
          exemploTotal2021: pibTotalFinal[
            anosFinais.indexOf("2021")
          ]?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            notation: "compact",
          }),
          exemploPerCapita2021: pibPerCapitaFinal[
            anosFinais.indexOf("2021")
          ]?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          }),
          fonte: temPibPerCapita
            ? "IBGE API direta"
            : "IBGE + estimativa populacional",
        });
      } catch (error) {
        console.error("Erro ao processar dados do IBGE:", error);
        setIsError(true);
        
        // Dados de fallback em dólares (baseados em valores históricos aproximados)
        console.log("Usando dados de fallback...");
        
        const fallbackData = {
          anos: ['2016', '2017', '2018', '2019', '2020', '2021', '2022'],
          // PIB Total em bilhões de USD (valores aproximados históricos)
          pibTotalUSD: [1798000000000, 2063000000000, 1917000000000, 1877000000000, 1474000000000, 1669000000000, 1915000000000],
          // PIB per Capita em USD (valores aproximados históricos)
          pibPerCapitaUSD: [8720, 9928, 9194, 8927, 6962, 7831, 8917]
        };
        
        setLabels(fallbackData.anos);
        setPibTotal(fallbackData.pibTotalUSD);
        setPibPerCapita(fallbackData.pibPerCapitaUSD);
        
        // Reset do erro para não bloquear a interface
        setTimeout(() => setIsError(false), 1000);
        
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <PibContext.Provider value={{ labels, pibTotal, pibPerCapita, isLoading, isError }}>
      {children}
    </PibContext.Provider>
  );
}

export function usePib() {
  const context = useContext(PibContext);
  if (!context) {
    throw new Error('usePib deve ser usado dentro de um PibProvider');
  }
  return context;
}