import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGearOptimizer } from '../useGearOptimizer';

const mockConfig = {
  datasets: [
    { id: 'slashing100', displayName: '100% Slashing', filePath: '/darkfall-gear-optimizer-web/results-slashing.json' },
    { id: 'fire-slash', displayName: '50/50 Fire Slashing', filePath: '/darkfall-gear-optimizer-web/results-fire-slash.json' },
  ],
  armorTypes: ['NoArmor', 'Cloth', 'Bone', 'Leather', 'Plate'],
};

const mockDataset = {
  metadata: { dataset: 'minimal', protectionWeights: { Slashing: 1.0 } },
  results: [
    {
      rank: 1,
      totalProtection: 5.44,
      encumbrance: 19.15,
      gear: {
        piece1: { description: 'Head - Bone', count: 1 },
        piece2: { description: 'Chest - Leather', count: 1 },
        piece3: { description: 'Legs - Cloth', count: 1 },
        piece4: { description: '(interchangeable) - Bone', count: 5 },
      },
    },
    {
      rank: 2,
      totalProtection: 7.20,
      encumbrance: 25.30,
      gear: {
        piece1: { description: 'Head - Leather', count: 1 },
        piece2: { description: 'Chest - Chain', count: 1 },
        piece3: { description: 'Legs - Leather', count: 1 },
        piece4: { description: '(interchangeable) - Chain', count: 5 },
      },
    },
    {
      rank: 3,
      totalProtection: 9.10,
      encumbrance: 30.00,
      gear: {
        piece1: { description: 'Head - Plate', count: 1 },
        piece2: { description: 'Chest - Plate', count: 1 },
        piece3: { description: 'Legs - Plate', count: 1 },
        piece4: { description: '(interchangeable) - Plate', count: 5 },
      },
    },
  ],
};

describe('useGearOptimizer', () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mockFetchResponses() {
    fetchMock.mockImplementation((url) => {
      if (url.includes('config.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockConfig),
        });
      }
      if (url.includes('results-')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDataset),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  }

  it('should load config on mount', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config).toEqual(mockConfig);
    expect(result.current.error).toBeNull();
  });

  it('should set error when config fetch fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
    });

    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load configuration');
    expect(result.current.config).toBeNull();
  });

  it('should start with no dataset selected', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.selectedDataset).toBeNull();
    expect(result.current.datasetResults).toBeNull();
    expect(result.current.optimalGear).toBeNull();
  });

  it('should load dataset results when a dataset is selected', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedDataset(mockConfig.datasets[0]);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.datasetResults).toEqual(mockDataset.results);
  });

  it('should set encumbrance to dataset min when dataset loads', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedDataset(mockConfig.datasets[0]);
    });

    await waitFor(() => {
      expect(result.current.datasetResults).not.toBeNull();
    });

    expect(result.current.targetEncumbrance).toBe(19.15);
  });

  it('should calculate optimal gear after dataset loads', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedDataset(mockConfig.datasets[0]);
    });

    await waitFor(() => {
      expect(result.current.datasetResults).not.toBeNull();
    });

    expect(result.current.optimalGear).not.toBeNull();
    expect(result.current.optimalGear.encumbrance).toBe(19.15);
  });

  it('should update optimal gear when target encumbrance changes', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedDataset(mockConfig.datasets[0]);
    });

    await waitFor(() => {
      expect(result.current.datasetResults).not.toBeNull();
    });

    act(() => {
      result.current.setTargetEncumbrance(30);
    });

    expect(result.current.optimalGear).not.toBeNull();
    expect(result.current.optimalGear.encumbrance).toBe(30.00);
    expect(result.current.optimalGear.totalProtection).toBe(9.10);
  });

  it('should compute encumbrance range from dataset', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedDataset(mockConfig.datasets[0]);
    });

    await waitFor(() => {
      expect(result.current.datasetResults).not.toBeNull();
    });

    expect(result.current.encumbranceRange.min).toBe(19.15);
    expect(result.current.encumbranceRange.max).toBe(30.00);
  });

  it('should return default encumbrance range when no dataset is loaded', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    expect(result.current.encumbranceRange).toEqual({ min: 0, max: 200 });
  });

  it('should clear dataset results when selection is set to null', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedDataset(mockConfig.datasets[0]);
    });

    await waitFor(() => {
      expect(result.current.datasetResults).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedDataset(null);
    });

    expect(result.current.datasetResults).toBeNull();
    expect(result.current.optimalGear).toBeNull();
  });

  it('should start with feather disabled', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    expect(result.current.featherEnabled).toBe(false);
    expect(result.current.featherValue).toBe(0);
    expect(result.current.headArmorType).toBeNull();
  });

  it('should filter encumbrance range by head armor type when feather is enabled', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedDataset(mockConfig.datasets[0]);
    });

    await waitFor(() => {
      expect(result.current.datasetResults).not.toBeNull();
    });

    act(() => {
      result.current.setFeatherEnabled(true);
      result.current.setHeadArmorType('Bone');
    });

    // Only one result has Head - Bone (encumbrance 19.15)
    expect(result.current.encumbranceRange.min).toBe(19.15);
    expect(result.current.encumbranceRange.max).toBe(19.15);
  });

  it('should set error when dataset fetch fails', async () => {
    fetchMock.mockImplementation((url) => {
      if (url.includes('config.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockConfig),
        });
      }
      return Promise.resolve({ ok: false });
    });

    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedDataset(mockConfig.datasets[0]);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load dataset');
  });
});
