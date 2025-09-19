import { useReducer, useEffect, useCallback, useMemo } from "react";
import { PibContext } from "./PibContext";
import EconomicDataService from "../services/EconomicDataService";

const economicDataService = new EconomicDataService();

const initialState = {
  status: "idle",
  error: null,
  data: {
    labels: [],
    pibTotal: [],
    pibPerCapita: [],
    meta: null,
  },
};

function pibReducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, status: "loading", error: null };
    case "FETCH_SUCCESS":
      return { ...state, status: "success", data: action.payload };
    case "FETCH_ERROR":
      return { ...state, status: "error", error: action.payload, data: initialState.data };
    default:
      throw new Error(`Ação desconhecida: ${action.type}`);
  }
}

export function PibProvider({ children }) {
  const [state, dispatch] = useReducer(pibReducer, initialState);

  const loadEconomicData = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await economicDataService.getEconomicData();
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (err) {
      console.error("Erro ao carregar dados econômicos:", err);
      dispatch({ type: "FETCH_ERROR", payload: err });
    }
  }, []);

  const clearCacheAndReload = useCallback(() => {
    economicDataService.clearCache();
    loadEconomicData();
  }, [loadEconomicData]);

  useEffect(() => {
    loadEconomicData();
  }, [loadEconomicData]);

  const contextValue = useMemo(() => {
    const { labels, pibTotal, pibPerCapita, meta } = state.data;
    const hasData = labels.length > 0;

    const formattedData = hasData
      ? labels.map((year, index) => ({
          ano: year,
          pibTotalFormatted: new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "USD",
            notation: "compact",
            maximumFractionDigits: 2,
          }).format(pibTotal[index]),
          pibPerCapitaFormatted: new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(pibPerCapita[index]),
          pibTotalValue: pibTotal[index],
          pibPerCapitaValue: pibPerCapita[index],
        }))
      : [];

    const stats = hasData
      ? {
          crescimentoMedioAnual:
            pibTotal.length > 1
              ? ((pibTotal[pibTotal.length - 1] / pibTotal[0]) ** (1 / (pibTotal.length - 1)) - 1) * 100
              : 0,
          crescimentoUltimoAno:
            pibTotal.length > 1
              ? (pibTotal[pibTotal.length - 1] / pibTotal[pibTotal.length - 2] - 1) * 100
              : 0,
          maiorPib: Math.max(...pibTotal),
          menorPib: Math.min(...pibTotal),
          maiorPibPerCapita: Math.max(...pibPerCapita),
          menorPibPerCapita: Math.min(...pibPerCapita),
          pibTotalAtual: pibTotal[pibTotal.length - 1],
          pibPerCapitaAtual: pibPerCapita[pibPerCapita.length - 1],
        }
      : null;

    return {
      status: state.status,
      isLoading: state.status === "loading",
      error: state.error,
      labels,
      pibTotal,
      pibPerCapita,
      meta,
      formattedData,
      stats,
      hasData,
      reload: loadEconomicData,
      clearCacheAndReload,
      getCacheInfo: () => economicDataService.getCacheInfo(),
    };
  }, [state, loadEconomicData, clearCacheAndReload]);

  return <PibContext.Provider value={contextValue}>{children}</PibContext.Provider>;
}
