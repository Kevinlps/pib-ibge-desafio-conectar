import { createContext, useContext, useEffect, useState } from "react";
import { pibService } from "../services/PibService";

const PibContext = createContext();

export function PibProvider({ children }) {
  const [labels, setLabels] = useState([]);
  const [pibTotal, setPibTotal] = useState([]);
  const [pibPerCapita, setPibPerCapita] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function loadPibData() {
      try {
        setIsLoading(true);
        setIsError(false);

        const data = await pibService.fetchPibData();
        
        setLabels(data.labels);
        setPibTotal(data.pibTotal);
        setPibPerCapita(data.pibPerCapita);

      } catch (error) {
        console.error("Erro ao carregar dados do PIB:", error);
        setIsError(true);
        
        // Usa dados de fallback
        const fallbackData = pibService.getFallbackData();
        setLabels(fallbackData.labels);
        setPibTotal(fallbackData.pibTotal);
        setPibPerCapita(fallbackData.pibPerCapita);
        
        // Reset do erro para não bloquear a interface
        setTimeout(() => setIsError(false), 1000);
        
      } finally {
        setIsLoading(false);
      }
    }

    loadPibData();
  }, []);

  const contextValue = {
    labels,
    pibTotal,
    pibPerCapita,
    isLoading,
    isError,
    // Método para recarregar os dados se necessário
    reload: async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await pibService.fetchPibData();
        setLabels(data.labels);
        setPibTotal(data.pibTotal);
        setPibPerCapita(data.pibPerCapita);
      } catch (error) {
        console.error("Erro ao recarregar dados:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <PibContext.Provider value={contextValue}>
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