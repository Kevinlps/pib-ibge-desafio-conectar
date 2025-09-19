import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PibChart from "../PibChart";

const mockUsePib = vi.fn();
vi.mock("../../../context/usePib", () => ({
  usePib: () => mockUsePib(),
}));
vi.mock("../ChartInfo/ChartInfo", () => ({
  default: () => <div data-testid="chart-info">Chart Info Component</div>,
}));

vi.mock("react-chartjs-2", () => ({
  Line: ({ data, options }) => (
    <div
      data-testid="line-chart"
      data-chart-data={JSON.stringify(data)}
      data-chart-options={JSON.stringify(options)}
    >
      Mocked Chart
    </div>
  ),
}));

describe("PibChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Estados de carregamento e erro", () => {
    it("deve exibir estado de carregamento", () => {
      mockUsePib.mockReturnValue({
        labels: [],
        pibTotal: [],
        pibPerCapita: [],
        isLoading: true,
        isError: false,
      });
      render(<PibChart />);
      expect(
        screen.getByText("Carregando dados do PIB brasileiro...")
      ).toBeInTheDocument();
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("deve exibir estado de erro", () => {
      mockUsePib.mockReturnValue({
        labels: [],
        pibTotal: [],
        pibPerCapita: [],
        isLoading: false,
        isError: true,
      });
      render(<PibChart />);
      expect(
        screen.getByText(
          "Erro ao carregar os dados. Por favor, tente novamente mais tarde."
        )
      ).toBeInTheDocument();
      const retryButton = screen.getByText("Tentar Novamente");
      expect(retryButton).toBeInTheDocument();
    });

    it('deve recarregar página quando clicar em "Tentar Novamente"', () => {
      const reloadMock = vi.fn();
      Object.defineProperty(window, "location", {
        writable: true,
        value: { reload: reloadMock },
      });

      mockUsePib.mockReturnValue({
        labels: [],
        pibTotal: [],
        pibPerCapita: [],
        isLoading: false,
        isError: true,
      });
      render(<PibChart />);
      const retryButton = screen.getByText("Tentar Novamente");
      fireEvent.click(retryButton);
      expect(reloadMock).toHaveBeenCalled();

      vi.restoreAllMocks();
    });
    it("deve exibir mensagem quando não há dados", () => {
      mockUsePib.mockReturnValue({
        labels: [],
        pibTotal: [],
        pibPerCapita: [],
        isLoading: false,
        isError: false,
      });
      render(<PibChart />);
      expect(
        screen.getByText("Nenhum dado encontrado para exibir no gráfico.")
      ).toBeInTheDocument();
    });
  });

  describe("Renderização com dados", () => {
    const mockData = {
      labels: ["2019", "2020", "2021"],
      pibTotal: [2000000000000, 2100000000000, 2200000000000],
      pibPerCapita: [9500, 10000, 10500],
      isLoading: false,
      isError: false,
    };

    it("deve renderizar o gráfico quando há dados", () => {
      mockUsePib.mockReturnValue(mockData);
      render(<PibChart />);
      expect(
        screen.getByText("Evolução do PIB Brasileiro")
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Produto Interno Bruto Total e per Capita ao longo dos anos (valores em dólares americanos)"
        )
      ).toBeInTheDocument();
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
      expect(screen.getByTestId("chart-info")).toBeInTheDocument();
    });

    it("deve configurar os dados do gráfico corretamente", () => {
      mockUsePib.mockReturnValue(mockData);
      render(<PibChart />);
      const chart = screen.getByTestId("line-chart");
      const chartData = JSON.parse(chart.getAttribute("data-chart-data"));
      expect(chartData.labels).toEqual(["2019", "2020", "2021"]);
      expect(chartData.datasets).toHaveLength(2);
      const pibTotalDataset = chartData.datasets[0];
      expect(pibTotalDataset.label).toBe("PIB Total (US$)");
      expect(pibTotalDataset.data).toEqual([
        2000000000000, 2100000000000, 2200000000000,
      ]);
      expect(pibTotalDataset.borderColor).toBe("#2563eb");
      expect(pibTotalDataset.yAxisID).toBe("y");
      const pibPerCapitaDataset = chartData.datasets[1];
      expect(pibPerCapitaDataset.label).toBe("PIB per Capita (US$)");
      expect(pibPerCapitaDataset.data).toEqual([9500, 10000, 10500]);
      expect(pibPerCapitaDataset.borderColor).toBe("#16a34a");
      expect(pibPerCapitaDataset.yAxisID).toBe("y1");
    });

    it("deve configurar as opções do gráfico corretamente", () => {
      mockUsePib.mockReturnValue(mockData);
      render(<PibChart />);
      const chart = screen.getByTestId("line-chart");
      const chartOptions = JSON.parse(chart.getAttribute("data-chart-options"));
      expect(chartOptions.responsive).toBe(true);
      expect(chartOptions.maintainAspectRatio).toBe(false);
      expect(chartOptions.plugins.legend.position).toBe("top");
      expect(chartOptions.scales.x.title.text).toBe("Ano");
      expect(chartOptions.scales.y.title.text).toBe("PIB Total (US$)");
      expect(chartOptions.scales.y1.title.text).toBe("PIB per Capita (US$)");
    });

    it("deve ter configurações de interação corretas", () => {
      mockUsePib.mockReturnValue(mockData);
      render(<PibChart />);
      const chart = screen.getByTestId("line-chart");
      const chartOptions = JSON.parse(chart.getAttribute("data-chart-options"));
      expect(chartOptions.interaction.intersect).toBe(false);
      expect(chartOptions.interaction.mode).toBe("index");
    });

    it("deve ter configurações de tooltip personalizadas", () => {
      mockUsePib.mockReturnValue(mockData);
      render(<PibChart />);
      const chart = screen.getByTestId("line-chart");
      const chartOptions = JSON.parse(chart.getAttribute("data-chart-options"));
      expect(chartOptions.plugins.tooltip.backgroundColor).toBe(
        "rgba(0, 0, 0, 0.8)"
      );
      expect(chartOptions.plugins.tooltip.titleColor).toBe("#ffffff");
      expect(chartOptions.plugins.tooltip.bodyColor).toBe("#ffffff");
      expect(chartOptions.plugins.tooltip.borderColor).toBe("#e5e7eb");
      expect(chartOptions.plugins.tooltip.cornerRadius).toBe(6);
      expect(chartOptions.plugins.tooltip.displayColors).toBe(true);
    });

    it("deve ter escalas com cores diferentes para os eixos Y", () => {
      mockUsePib.mockReturnValue(mockData);
      render(<PibChart />);
      const chart = screen.getByTestId("line-chart");
      const chartOptions = JSON.parse(chart.getAttribute("data-chart-options"));
      expect(chartOptions.scales.y.title.color).toBe("#2563eb");
      expect(chartOptions.scales.y.ticks.color).toBe("#2563eb");
      expect(chartOptions.scales.y.position).toBe("left");
      expect(chartOptions.scales.y1.title.color).toBe("#16a34a");
      expect(chartOptions.scales.y1.ticks.color).toBe("#16a34a");
      expect(chartOptions.scales.y1.position).toBe("right");
    });

    it("deve configurar elementos de ponto corretamente", () => {
      mockUsePib.mockReturnValue(mockData);
      render(<PibChart />);
      const chart = screen.getByTestId("line-chart");
      const chartData = JSON.parse(chart.getAttribute("data-chart-data"));
      chartData.datasets.forEach((dataset) => {
        expect(dataset.pointStyle).toBe("circle");
        expect(dataset.pointRadius).toBe(5);
        expect(dataset.pointHoverRadius).toBe(8);
        expect(dataset.pointBorderColor).toBe("#ffffff");
        expect(dataset.pointBorderWidth).toBe(2);
        expect(dataset.borderWidth).toBe(3);
        expect(dataset.tension).toBe(0.4);
      });
    });
  });

  describe("Responsividade", () => {
    it("deve ter classes CSS adequadas para responsividade", () => {
      mockUsePib.mockReturnValue({
        labels: ["2019", "2020"],
        pibTotal: [2000000000000, 2100000000000],
        pibPerCapita: [9500, 10000],
        isLoading: false,
        isError: false,
      });
      const { container } = render(<PibChart />);
      expect(container.querySelector(".chart-page")).toBeInTheDocument();
      expect(container.querySelector(".chart-header")).toBeInTheDocument();
      expect(container.querySelector(".chart-container")).toBeInTheDocument();
      expect(container.querySelector(".chart-wrapper")).toBeInTheDocument();
    });
  });

  describe("Integração com contexto", () => {
    it("deve usar dados do contexto usePib", () => {
      const customData = {
        labels: ["2018", "2019"],
        pibTotal: [1800000000000, 1900000000000],
        pibPerCapita: [8500, 9000],
        isLoading: false,
        isError: false,
      };
      mockUsePib.mockReturnValue(customData);
      render(<PibChart />);
      const chart = screen.getByTestId("line-chart");
      const chartData = JSON.parse(chart.getAttribute("data-chart-data"));
      expect(chartData.labels).toEqual(["2018", "2019"]);
      expect(chartData.datasets[0].data).toEqual([
        1800000000000, 1900000000000,
      ]);
      expect(chartData.datasets[1].data).toEqual([8500, 9000]);
    });
  });
});
