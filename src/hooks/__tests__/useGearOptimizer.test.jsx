import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGearOptimizer } from '../useGearOptimizer';

const mockConfig = {
  protectionTypes: [
    { id: 'physical', displayName: 'Physical' },
    { id: 'magic', displayName: 'Magic' },
  ],
  armorAccessTiers: [
    { id: 'common', displayName: 'Common' },
    { id: 'all', displayName: 'All (incl. Dragon)' },
  ],
  armorTypes: ['NoArmor', 'Cloth', 'Bone', 'Leather', 'Plate'],
};

const mockCsvText = `Type,Slot,Name,Skill,Mastery,Cloth,Bone,Leather,Iron,Selentine,Theyril,Leenspar,Gold,Encumbrance,Bludgeoning,Piercing,Slashing,Acid,Cold,Fire,Holy,Lightning,Unholy,Impact,FiendClaw,Ratka,DragonScales
Bone,Head,Helmet,100,0,0,4,3,0,0,0,0,11,1.5,0.6,0.6,0.6,1.16,1.16,1.16,1.4,1.16,1.4,0.37,0,0,0
Bone,Arms,Vambraces,100,0,0,2,2,0,0,0,0,9,1.5,0.3,0.3,0.3,0.56,0.56,0.56,0.68,0.56,0.68,0.18,0,0,0
Leather,Chest,Cuirass,50,0,0,0,12,0,0,0,0,0,5.75,1.15,1.15,1.15,1.51,1.51,1.51,1.51,1.51,1.51,0.86,0,0,0
Cloth,Legs,Leggings,1,0,1,0,0,0,0,0,0,0,0.75,0.15,0.15,0.15,0.19,0.19,0.19,0.19,0.19,0.19,0.11,0,0,0`;

const mockDataset = {
  metadata: { dataset: 'complete', protectionWeights: { Slashing: 1.0 } },
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
    // Reset URL to clean state before each test
    window.history.replaceState(null, '', '/');
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
      if (url.includes('armor-data-complete.csv')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockCsvText),
        });
      }
      if (url.includes('results-complete-')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDataset),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  }

  it('should load config and armor data on mount', async () => {
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

  it('should start with no selections', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.selectedProtectionType).toBeNull();
    expect(result.current.selectedArmorTier).toBeNull();
    expect(result.current.datasetResults).toBeNull();
    expect(result.current.optimalGear).toBeNull();
  });

  it('should not load dataset until both protection type and armor tier are selected', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    // Select only protection type
    act(() => {
      result.current.setSelectedProtectionType(mockConfig.protectionTypes[0]);
    });

    // Should not have loaded dataset
    expect(result.current.datasetResults).toBeNull();
  });

  it('should load dataset when both selections are made', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedProtectionType(mockConfig.protectionTypes[0]);
      result.current.setSelectedArmorTier(mockConfig.armorAccessTiers[0]);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.datasetResults).toEqual(mockDataset.results);
  });

  it('should construct correct file path from selections', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedProtectionType(mockConfig.protectionTypes[0]);
      result.current.setSelectedArmorTier(mockConfig.armorAccessTiers[1]);
    });

    await waitFor(() => {
      expect(result.current.datasetResults).not.toBeNull();
    });

    // Check that fetch was called with the right path
    const datasetCall = fetchMock.mock.calls.find(c => c[0].includes('results-complete-'));
    expect(datasetCall[0]).toBe('/darkfall-gear-optimizer-web/results-complete-all-physical.json');
  });

  it('should preserve encumbrance when dataset loads if value is in range', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedProtectionType(mockConfig.protectionTypes[0]);
      result.current.setSelectedArmorTier(mockConfig.armorAccessTiers[0]);
    });

    await waitFor(() => {
      expect(result.current.datasetResults).not.toBeNull();
    });

    // Default encumbrance is 20, which is within the mock dataset range (19.15-25.0)
    expect(result.current.targetEncumbrance).toBe(20);
  });

  it('should calculate optimal gear after dataset loads', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedProtectionType(mockConfig.protectionTypes[0]);
      result.current.setSelectedArmorTier(mockConfig.armorAccessTiers[0]);
    });

    await waitFor(() => {
      expect(result.current.datasetResults).not.toBeNull();
    });

    expect(result.current.optimalGear).not.toBeNull();
    expect(result.current.optimalGear.encumbrance).toBe(19.15);
  });

  it('should compute realStats when optimal gear is available', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedProtectionType(mockConfig.protectionTypes[0]);
      result.current.setSelectedArmorTier(mockConfig.armorAccessTiers[0]);
    });

    await waitFor(() => {
      expect(result.current.datasetResults).not.toBeNull();
    });

    expect(result.current.realStats).not.toBeNull();
    expect(result.current.realStats.slots).toBeDefined();
    expect(result.current.realStats.totals).toBeDefined();
  });

  it('should update optimal gear when target encumbrance changes', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedProtectionType(mockConfig.protectionTypes[0]);
      result.current.setSelectedArmorTier(mockConfig.armorAccessTiers[0]);
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
      result.current.setSelectedProtectionType(mockConfig.protectionTypes[0]);
      result.current.setSelectedArmorTier(mockConfig.armorAccessTiers[0]);
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

  it('should clear dataset results when selection is cleared', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedProtectionType(mockConfig.protectionTypes[0]);
      result.current.setSelectedArmorTier(mockConfig.armorAccessTiers[0]);
    });

    await waitFor(() => {
      expect(result.current.datasetResults).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedProtectionType(null);
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
    expect(result.current.featherValue).toBe(0.1);
    expect(result.current.headArmorType).toBeNull();
  });

  it('should filter encumbrance range by head armor type when feather is enabled', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedProtectionType(mockConfig.protectionTypes[0]);
      result.current.setSelectedArmorTier(mockConfig.armorAccessTiers[0]);
    });

    await waitFor(() => {
      expect(result.current.datasetResults).not.toBeNull();
    });

    act(() => {
      result.current.setFeatherEnabled(true);
      result.current.setHeadArmorType('Bone');
    });

    // Only one result has Head - Bone (encumbrance 19.15)
    // With feather value 0.1, min is adjusted: 19.15 - 0.1 = 19.05
    expect(result.current.encumbranceRange.min).toBe(19.05);
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
      if (url.includes('armor-data-complete.csv')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockCsvText),
        });
      }
      return Promise.resolve({ ok: false });
    });

    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedProtectionType(mockConfig.protectionTypes[0]);
      result.current.setSelectedArmorTier(mockConfig.armorAccessTiers[0]);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load dataset');
  });

  it('should not load dataset when only armor tier is selected', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedArmorTier(mockConfig.armorAccessTiers[0]);
    });

    expect(result.current.datasetResults).toBeNull();
    expect(result.current.optimalGear).toBeNull();
  });

  it('should clear dataset when armor tier is deselected', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedProtectionType(mockConfig.protectionTypes[0]);
      result.current.setSelectedArmorTier(mockConfig.armorAccessTiers[0]);
    });

    await waitFor(() => {
      expect(result.current.datasetResults).not.toBeNull();
    });

    act(() => {
      result.current.setSelectedArmorTier(null);
    });

    expect(result.current.datasetResults).toBeNull();
    expect(result.current.optimalGear).toBeNull();
  });

  it('should return null realStats when no dataset is loaded', async () => {
    mockFetchResponses();
    const { result } = renderHook(() => useGearOptimizer());

    await waitFor(() => {
      expect(result.current.config).not.toBeNull();
    });

    expect(result.current.realStats).toBeNull();
  });

  describe('URL state', () => {
    it('should initialize feather and encumbrance from URL params on mount', async () => {
      window.history.replaceState(null, '', '/?feather=true&featherValue=5&headArmor=Bone&enc=25');
      mockFetchResponses();
      const { result } = renderHook(() => useGearOptimizer());

      expect(result.current.featherEnabled).toBe(true);
      expect(result.current.featherValue).toBe(5);
      expect(result.current.headArmorType).toBe('Bone');
      expect(result.current.targetEncumbrance).toBe(25);
    });

    it('should resolve protection and tier from URL after config loads', async () => {
      window.history.replaceState(null, '', '/?protection=physical&tier=common');
      mockFetchResponses();
      const { result } = renderHook(() => useGearOptimizer());

      await waitFor(() => {
        expect(result.current.config).not.toBeNull();
      });

      // Protection and tier should be resolved from URL params
      await waitFor(() => {
        expect(result.current.selectedProtectionType).toEqual(mockConfig.protectionTypes[0]);
      });
      expect(result.current.selectedArmorTier).toEqual(mockConfig.armorAccessTiers[0]);

      // Should trigger dataset load
      await waitFor(() => {
        expect(result.current.datasetResults).not.toBeNull();
      });
    });

    it('should ignore invalid protection and tier IDs from URL', async () => {
      window.history.replaceState(null, '', '/?protection=invalid&tier=bogus');
      mockFetchResponses();
      const { result } = renderHook(() => useGearOptimizer());

      await waitFor(() => {
        expect(result.current.config).not.toBeNull();
      });

      // Should remain null (invalid IDs ignored)
      expect(result.current.selectedProtectionType).toBeNull();
      expect(result.current.selectedArmorTier).toBeNull();
      expect(result.current.datasetResults).toBeNull();
    });

    it('should call replaceState with correct URL on state changes', async () => {
      mockFetchResponses();
      const replaceSpy = vi.spyOn(window.history, 'replaceState');
      const { result } = renderHook(() => useGearOptimizer());

      await waitFor(() => {
        expect(result.current.config).not.toBeNull();
      });

      // Clear any calls from initialization
      replaceSpy.mockClear();

      act(() => {
        result.current.setSelectedProtectionType(mockConfig.protectionTypes[0]);
        result.current.setSelectedArmorTier(mockConfig.armorAccessTiers[0]);
      });

      await waitFor(() => {
        expect(result.current.datasetResults).not.toBeNull();
      });

      // URL should include protection and tier
      const lastCall = replaceSpy.mock.calls[replaceSpy.mock.calls.length - 1];
      const url = lastCall[2];
      expect(url).toContain('protection=physical');
      expect(url).toContain('tier=common');
    });

    it('should produce clean URL when all values are defaults', async () => {
      mockFetchResponses();
      const replaceSpy = vi.spyOn(window.history, 'replaceState');
      const { result } = renderHook(() => useGearOptimizer());

      await waitFor(() => {
        expect(result.current.config).not.toBeNull();
      });

      // With no selections and default enc/feather, URL should be clean
      // The URL sync effect should produce a URL with no query params
      const lastCallUrl = replaceSpy.mock.calls.length > 0
        ? replaceSpy.mock.calls[replaceSpy.mock.calls.length - 1][2]
        : window.location.pathname;
      expect(lastCallUrl).not.toContain('?');
    });

    it('should omit featherValue and headArmor from URL when feather disabled', async () => {
      mockFetchResponses();
      const replaceSpy = vi.spyOn(window.history, 'replaceState');
      const { result } = renderHook(() => useGearOptimizer());

      await waitFor(() => {
        expect(result.current.config).not.toBeNull();
      });

      act(() => {
        result.current.setSelectedProtectionType(mockConfig.protectionTypes[0]);
        result.current.setSelectedArmorTier(mockConfig.armorAccessTiers[0]);
      });

      await waitFor(() => {
        expect(result.current.datasetResults).not.toBeNull();
      });

      // Enable feather, set values, then disable
      act(() => {
        result.current.setFeatherEnabled(true);
        result.current.setFeatherValue(5);
        result.current.setHeadArmorType('Bone');
      });

      act(() => {
        result.current.setFeatherEnabled(false);
      });

      const lastCall = replaceSpy.mock.calls[replaceSpy.mock.calls.length - 1];
      const url = lastCall[2];
      expect(url).not.toContain('featherValue');
      expect(url).not.toContain('headArmor');
      expect(url).not.toContain('feather');
    });

    it('should reflect clamped encumbrance in URL after dataset load', async () => {
      // Set enc to 5 which is below the dataset range (19.15-30)
      window.history.replaceState(null, '', '/?protection=physical&tier=common&enc=5');
      mockFetchResponses();
      const replaceSpy = vi.spyOn(window.history, 'replaceState');
      const { result } = renderHook(() => useGearOptimizer());

      await waitFor(() => {
        expect(result.current.datasetResults).not.toBeNull();
      });

      // Encumbrance should be clamped to min of dataset range
      expect(result.current.targetEncumbrance).toBe(19.15);

      // URL should reflect the clamped value
      await waitFor(() => {
        const calls = replaceSpy.mock.calls;
        const lastUrl = calls[calls.length - 1][2];
        expect(lastUrl).toContain('enc=19.15');
      });
    });
  });
});
