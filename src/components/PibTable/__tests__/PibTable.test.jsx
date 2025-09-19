import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PibTable from '../PibTable';

const mockUsePib = vi.fn();
vi.mock('../../../context/usePib', () => ({
  usePib: () => mockUsePib(),
}));

describe('PibTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Estados de carregamento e erro', () => {
    it('deve exibir estado de carregamento', () => {
      mockUsePib.mockReturnValue({
        labels: [],
        pibTotal: [],
        pibPerCapita: [],
        isLoading: true,
        isError: false,
      });
      render(<PibTable />);
      expect(screen.getByText('Carregando dados da tabela...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('deve exibir estado de erro', () => {
      mockUsePib.mockReturnValue({
        labels: [],
        pibTotal: [],
        pibPerCapita: [],
        isLoading: false,
        isError: true,
      });
      render(<PibTable />);
      expect(screen.getByText('Erro ao carregar os dados da tabela.')).toBeInTheDocument();
      const retryButton = screen.getByText('Tentar Novamente');
      expect(retryButton).toBeInTheDocument();
    });

    it('deve recarregar página quando clicar em "Tentar Novamente"', () => {
  const reloadMock = vi.fn();
  Object.defineProperty(window, 'location', {
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
  render(<PibTable />);
  const retryButton = screen.getByText('Tentar Novamente');
  fireEvent.click(retryButton);
  expect(reloadMock).toHaveBeenCalled();
  vi.restoreAllMocks();
});

    it('deve exibir mensagem quando não há dados', () => {
      mockUsePib.mockReturnValue({
        labels: [],
        pibTotal: [],
        pibPerCapita: [],
        isLoading: false,
        isError: false,
      });
      render(<PibTable />);
      expect(screen.getByText('Nenhum dado disponível para exibir na tabela.')).toBeInTheDocument();
    });
  });

  describe('Renderização com dados', () => {
    const mockData = {
      labels: ['2019', '2020', '2021', '2022'],
      pibTotal: [2000000000000, 2100000000000, 2200000000000, 2300000000000],
      pibPerCapita: [9500.50, 10000.75, 10500.25, 11000.80],
      isLoading: false,
      isError: false,
    };

    it('deve renderizar a tabela quando há dados', () => {
      mockUsePib.mockReturnValue(mockData);
      render(<PibTable />);
      expect(screen.getByText('Tabela de PIB por Ano')).toBeInTheDocument();
      expect(screen.getByText('Produto Interno Bruto brasileiro ordenado por período (valores em dólares americanos)')).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('deve exibir cabeçalhos da tabela corretamente', () => {
      mockUsePib.mockReturnValue(mockData);
      render(<PibTable />);
      expect(screen.getByRole('columnheader', { name: /ano/i })).toBeInTheDocument();
      expect(screen.getByText('PIB Total')).toBeInTheDocument();
      expect(screen.getByText('PIB per Capita')).toBeInTheDocument();
    });

    it('deve exibir dados na tabela corretamente', () => {
      mockUsePib.mockReturnValue(mockData);
      render(<PibTable />);
      expect(screen.getByText('2019')).toBeInTheDocument();
      expect(screen.getByText('2020')).toBeInTheDocument();
      expect(screen.getByText('2021')).toBeInTheDocument();
      expect(screen.getByText('2022')).toBeInTheDocument();
      expect(screen.getByText('$2.00T')).toBeInTheDocument();
      expect(screen.getByText('$9.5K')).toBeInTheDocument();
    });
  });

  describe('Funcionalidade de ordenação', () => {
    const mockData = {
      labels: ['2021', '2019', '2020'],
      pibTotal: [2200000000000, 2000000000000, 2100000000000],
      pibPerCapita: [10500, 9500, 10000],
      isLoading: false,
      isError: false,
    };

    it('deve ordenar dados por ano crescente por padrão', () => {
      mockUsePib.mockReturnValue(mockData);
      render(<PibTable />);
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('2019');
      expect(rows[2]).toHaveTextContent('2020');
      expect(rows[3]).toHaveTextContent('2021');
    });

    it('deve ter botão de ordenação separado nos controles', () => {
      mockUsePib.mockReturnValue(mockData)

      render(<PibTable />)

      const controlSortButton = screen.getByTitle(/Ordenar por ano/i)
      expect(controlSortButton).toBeInTheDocument()

      fireEvent.click(controlSortButton)

      expect(controlSortButton).toHaveTextContent('↓')
    })
  })

  describe('Paginação', () => {
    const mockData = {
      labels: Array.from({ length: 10 }, (_, i) => `${2015 + i}`),
      pibTotal: Array.from({ length: 10 }, (_, i) => 1000 + i),
      pibPerCapita: Array.from({ length: 10 }, (_, i) => 100 + i),
      isLoading: false,
      isError: false,
    };

    it('deve exibir apenas a quantidade correta de itens por página', () => {
      mockUsePib.mockReturnValue(mockData);
      render(<PibTable />);
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(9); 
      expect(screen.getByText('Mostrando 1 a 8 de 10 registros')).toBeInTheDocument();
    });

    it('deve navegar para a próxima página ao clicar no botão', () => {
      mockUsePib.mockReturnValue(mockData);
      render(<PibTable />);
      const nextPageButton = screen.getByTitle('Próxima página');
      fireEvent.click(nextPageButton);
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(3); 
      expect(screen.getByText('2023')).toBeInTheDocument();
      expect(screen.getByText('Página 2 de 2')).toBeInTheDocument();
    });

    it('deve navegar para a página anterior ao clicar no botão', () => {
      mockUsePib.mockReturnValue(mockData);
      render(<PibTable />);
      const nextPageButton = screen.getByTitle('Próxima página');
      const prevPageButton = screen.getByTitle('Página anterior');

      fireEvent.click(nextPageButton);
      expect(screen.getByText('Página 2 de 2')).toBeInTheDocument();

      fireEvent.click(prevPageButton);
      expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(9); 
    });
  });
});
