import { renderHook, waitFor } from '@testing-library/react';
import { PibProvider, usePib } from '../context/PibContext';

// Mocka a função fetch para simular a resposta da API
const mockData = [
  {
    "id": "37",
    "resultados": [
      {
        "series": [
          {
            "localidade": { "id": "BR" },
            "serie": { "2020": "1843388000", "2021": "1940939000" }
          }
        ]
      }
    ]
  },
  {
    "id": "38",
    "resultados": [
      {
        "series": [
          {
            "localidade": { "id": "BR" },
            "serie": { "2020": "8668", "2021": "9091" }
          }
        ]
      }
    ]
  }
];

describe('PibContext', () => {
  let originalFetch;

  beforeAll(() => {
    originalFetch = global.fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  test('should fetch and provide PIB data correctly', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    );

    const { result } = renderHook(() => usePib(), {
      wrapper: PibProvider,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(false);
    expect(result.current.labels).toEqual(["2020", "2021"]);
    expect(result.current.pibTotal).toEqual([1843388000, 1940939000]);
    expect(result.current.pibPerCapita).toEqual([8668, 9091]);
  });

  test('should handle API fetch error', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })
    );

    const { result } = renderHook(() => usePib(), {
      wrapper: PibProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(result.current.labels).toEqual([]);
    expect(result.current.pibTotal).toEqual([]);
  });
});