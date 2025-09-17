import { useState, useMemo } from "react";
import { usePib } from "../context/PibContext";

const ITEMS_PER_PAGE = 8;

export default function PibTable() {
  const { labels, pibTotal, pibPerCapita, isLoading, isError } = usePib();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' = mais antigo primeiro

  // Combina os dados em um array de objetos
  const tableData = useMemo(() => {
    if (!labels.length) return [];

    const data = labels.map((ano, index) => ({
      ano: parseInt(ano),
      anoStr: ano,
      total: pibTotal[index],
      perCapita: pibPerCapita[index],
    }));

    // Ordena os dados por ano conforme requisito (mais antigo para mais recente)
    return data.sort((a, b) => {
      return sortOrder === 'asc' ? a.ano - b.ano : b.ano - a.ano;
    });
  }, [labels, pibTotal, pibPerCapita, sortOrder]);

  // Cálculos de paginação
  const totalPages = Math.ceil(tableData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = tableData.slice(startIndex, endIndex);

  // Handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSortToggle = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1); // Reset para primeira página ao ordenar
  };

  // Formatação monetária
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyDetailed = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Estados de carregamento e erro
  if (isLoading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner"></div>
        <p>Carregando dados da tabela...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="table-error">
        <p>Erro ao carregar os dados da tabela.</p>
        <button onClick={() => window.location.reload()}>
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!tableData.length) {
    return (
      <div className="table-no-data">
        <p>Nenhum dado disponível para exibir na tabela.</p>
      </div>
    );
  }

  return (
    <div className="table-page">
      <div className="table-header">
        <h1>Tabela de PIB por Ano</h1>
        <p>
          Produto Interno Bruto brasileiro ordenado por período (valores em
          dólares americanos)
        </p>
      </div>

      <div className="table-container">
        <div className="table-controls">
          <div className="table-info">
            <span>
              Mostrando {startIndex + 1} a{" "}
              {Math.min(endIndex, tableData.length)} de {tableData.length}{" "}
              registros
            </span>
          </div>

          <button
            className="sort-button"
            onClick={handleSortToggle}
            title={`Ordenar por ano ${
              sortOrder === "asc" ? "decrescente" : "crescente"
            }`}
          >
            <span>Ano</span>
            <span className={`sort-icon ${sortOrder}`}>
              {sortOrder === "asc" ? "↑" : "↓"}
            </span>
          </button>
        </div>

        <div className="table-wrapper">
          <table className="pib-table">
            <thead>
              <tr>
                <th className="year-column">
                  <button
                    className="header-sort-button"
                    onClick={handleSortToggle}
                  >
                    Ano
                    <span className={`sort-indicator ${sortOrder}`}>
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  </button>
                </th>
                <th className="total-column">PIB Total</th>
                <th className="percapita-column">PIB per Capita</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((row) => (
                <tr key={row.anoStr} className="table-row">
                  <td className="year-cell">
                    <strong>{row.anoStr}</strong>
                  </td>
                  <td className="total-cell">
                    <span className="currency-value">
                      {formatCurrency(row.total)}
                    </span>
                    <span className="currency-label">USD</span>
                  </td>
                  <td className="percapita-cell">
                    <span className="currency-value">
                      {formatCurrencyDetailed(row.perCapita)}
                    </span>
                    <span className="currency-label">USD</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-button"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              title="Primeira página"
            >
              ««
            </button>

            <button
              className="pagination-button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Página anterior"
            >
              «
            </button>

            <div className="pagination-info">
              <span className="current-page">
                Página {currentPage} de {totalPages}
              </span>
            </div>

            <button
              className="pagination-button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Próxima página"
            >
              »
            </button>

            <button
              className="pagination-button"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              title="Última página"
            >
              »»
            </button>
          </div>
        )}
      </div>

      <div className="table-summary">
        <div className="summary-grid">
          <div className="summary-card">
            <h3>📊 Total de Registros</h3>
            <p className="summary-value">{tableData.length} anos</p>
          </div>
          <div className="summary-card">
            <h3>📈 Período</h3>
            <p className="summary-value">
              {Math.min(...tableData.map((d) => d.ano))} -{" "}
              {Math.max(...tableData.map((d) => d.ano))}
            </p>
          </div>
          <div className="summary-card">
            <h3>💰 Valores</h3>
            <p className="summary-value">Em dólares americanos (USD)</p>
          </div>
        </div>
      </div>
    </div>
  );
}