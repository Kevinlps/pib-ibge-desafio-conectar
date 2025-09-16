import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";
import { usePib } from "../context/PibContext";

// Registra os componentes necessários do Chart.js
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);

export default function PibChart() {
  const { labels, pibTotal, pibPerCapita, isLoading, isError } = usePib();

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Carregando dados do PIB brasileiro...</p>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="error-container">
        <p>Erro ao carregar os dados. Por favor, tente novamente mais tarde.</p>
        <button onClick={() => window.location.reload()}>Tentar Novamente</button>
      </div>
    );
  }

  if (labels.length === 0) {
    return (
      <div className="no-data-container">
        <p>Nenhum dado encontrado para exibir no gráfico.</p>
      </div>
    );
  }

  // Configuração dos dados do gráfico
  const data = {
    labels,
    datasets: [
      {
        label: "PIB Total (US$)",
        data: pibTotal,
        borderColor: "#2563eb", // Azul
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        tension: 0.4,
        pointStyle: 'circle',
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: "#2563eb",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        borderWidth: 3,
        yAxisID: 'y',
      },
      {
        label: "PIB per Capita (US$)",
        data: pibPerCapita,
        borderColor: "#16a34a", // Verde
        backgroundColor: "rgba(22, 163, 74, 0.1)",
        tension: 0.4,
        pointStyle: 'circle',
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: "#16a34a",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        borderWidth: 3,
        yAxisID: 'y1',
      },
    ],
  };

  // Configuração das opções do gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 14,
            weight: '500',
          },
          padding: 20,
          color: '#374151',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return `Ano: ${context[0].label}`;
          },
          label: function(context) {
            const label = context.dataset.label;
            const value = context.parsed.y;
            
            if (label.includes('Total')) {
              return `${label}: ${new Intl.NumberFormat("en-US", { 
                style: "currency", 
                currency: "USD",
                notation: "compact",
                maximumFractionDigits: 2
              }).format(value)}`;
            } else {
              return `${label}: ${new Intl.NumberFormat("en-US", { 
                style: "currency", 
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(value)}`;
            }
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Ano',
          font: {
            size: 14,
            weight: 'bold',
          },
          color: '#374151',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'PIB Total (US$)',
          font: {
            size: 14,
            weight: 'bold',
          },
          color: '#2563eb',
        },
        grid: {
          color: 'rgba(37, 99, 235, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#2563eb',
          font: {
            size: 11,
          },
          callback: function(value) {
            return new Intl.NumberFormat("en-US", { 
              style: "currency", 
              currency: "USD",
              notation: "compact",
              maximumFractionDigits: 1
            }).format(value);
          }
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'PIB per Capita (US$)',
          font: {
            size: 14,
            weight: 'bold',
          },
          color: '#16a34a',
        },
        grid: {
          drawOnChartArea: false,
          color: 'rgba(22, 163, 74, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#16a34a',
          font: {
            size: 11,
          },
          callback: function(value) {
            return new Intl.NumberFormat("en-US", { 
              style: "currency", 
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value);
          }
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  };

  return (
    <div className="chart-page">
      <div className="chart-header">
        <h1>Evolução do PIB Brasileiro</h1>
        <p>Produto Interno Bruto Total e per Capita ao longo dos anos (valores em dólares americanos)</p>
      </div>
      
      <div className="chart-container">
        <div className="chart-wrapper">
          <Line data={data} options={options} />
        </div>
      </div>
      
      <div className="chart-info">
        <div className="info-grid">
          <div className="info-card">
            <h3>📈 PIB Total</h3>
            <p>Representa o valor total de todos os bens e serviços produzidos no país durante um ano.</p>
          </div>
          <div className="info-card">
            <h3>👥 PIB per Capita</h3>
            <p>Indica a renda média por habitante, calculada dividindo o PIB total pela população.</p>
          </div>
          <div className="info-card">
            <h3>📊 Fonte dos Dados</h3>
            <p>Instituto Brasileiro de Geografia e Estatística (IBGE) - API de Agregados.</p>
          </div>
        </div>
      </div>
    </div>
  );
}