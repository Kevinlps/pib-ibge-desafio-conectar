// PibContext.js - Versão com useReducer e useMemo

import { createContext, useContext, useEffect, useCallback, useReducer, useMemo } from "react";
import PibService from "../services/PibService";

// Instância única do serviço (Singleton)
const pibService = new PibService();

const PibContext = createContext(null);

// ✨ MELHORIA: Estado inicial centralizado
const initialState = {
  status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
  error: null,
  data: {
    labels: [],
    pibTotal: [],
    pibPerCapita: [],
    meta: null,
  }
};

// ✨ MELHORIA: Reducer para gerenciar as transições de estado
function pibReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, status: 'loading', error: null };
    case 'FETCH_SUCCESS':
      return { ...state, status: 'success', data: action.payload };
    case 'FETCH_ERROR':
      return { ...state, status: 'error', error: action.payload, data: initialState.data };
    default:
      throw new Error(`Ação desconhecida: ${action.type}`);
  }
}

export function PibProvider({ children }) {
  const [state, dispatch] = useReducer(pibReducer, initialState);

  const loadPibData = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await pibService.fetchPibData();
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      console.error("Erro ao carregar dados PIB:", err);
      dispatch({ type: 'FETCH_ERROR', payload: err });
    }
  }, []);

  const clearCacheAndReload = useCallback(() => {
    pibService.clearCache();
    loadPibData();
  }, [loadPibData]);

  useEffect(() => {
    loadPibData();
  }, [loadPibData]);

  // ✨ MELHORIA: Usar useMemo para calcular dados derivados e evitar recriação do objeto de contexto
  const contextValue = useMemo(() => {
    const { labels, pibTotal, pibPerCapita } = state.data;
    const hasData = labels.length > 0;

    const formattedData = hasData ? labels.map((year, index) => {
      const total = pibTotal[index];
      const perCapita = pibPerCapita[index];
      return {
        ano: year,
        pibTotalFormatted: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(total),
        pibPerCapitaFormatted: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(perCapita),
      };
    }) : [];

    const stats = hasData ? {
      crescimentoMedioAnual: pibTotal.length > 1 ? (((pibTotal.at(-1) / pibTotal[0]) ** (1 / (pibTotal.length - 1))) - 1) * 100 : 0,
      maiorPib: Math.max(...pibTotal),
      menorPib: Math.min(...pibTotal),
      maiorPibPerCapita: Math.max(...pibPerCapita),
      menorPibPerCapita: Math.min(...pibPerCapita),
    } : null;

    return {
      // Estado
      status: state.status,
      isLoading: state.status === 'loading',
      error: state.error,
      
      // Dados Brutos
      ...state.data,

      // Dados Derivados e Formatados (Memorizados)
      formattedData,
      stats,
      hasData,

      // Funções
      reload: loadPibData,
      clearCacheAndReload,
      getCacheInfo: () => pibService.getCacheInfo(),
    };
  }, [state, loadPibData, clearCacheAndReload]);

  return (
    <PibContext.Provider value={contextValue}>
      {children}
    </PibContext.Provider>
  );
}

// ✨ MELHORIA: Hook único e simplificado para consumir o contexto
export function usePib() {
  const context = useContext(PibContext);
  if (!context) {
    throw new Error("usePib deve ser usado dentro de um PibProvider");
  }
  return context;
}