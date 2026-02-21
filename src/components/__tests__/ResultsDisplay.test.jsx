import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResultsDisplay, { ArmorStatsTable } from '../ResultsDisplay';

describe('ResultsDisplay', () => {
  const mockOptimalGear = {
    rank: 1,
    totalProtection: 5.44,
    encumbrance: 19.15,
    gear: {
      piece1: { description: 'Head - Bone', count: 1 },
      piece2: { description: '(interchangeable) - Bone', count: 5 },
      piece3: { description: '(interchangeable) - Leather', count: 2 },
      piece4: { description: 'Chest - Leather', count: 1 },
      piece5: { description: 'Legs - Studded', count: 1 }
    }
  };

  const mockRealStats = {
    slots: [
      {
        label: 'Head',
        armorType: 'Bone',
        count: 1,
        encumbrance: 1.5,
        stats: {
          Bludgeoning: 0.6, Piercing: 0.6, Slashing: 0.6,
          Acid: 1.16, Cold: 1.16, Fire: 1.16, Holy: 1.4,
          Lightning: 1.16, Unholy: 1.4, Impact: 0.37,
          FiendClaw: 0, Ratka: 0, DragonScales: 0
        }
      },
      {
        label: 'Chest',
        armorType: 'Leather',
        count: 1,
        encumbrance: 5.75,
        stats: {
          Bludgeoning: 1.15, Piercing: 1.15, Slashing: 1.15,
          Acid: 1.51, Cold: 1.51, Fire: 1.51, Holy: 1.51,
          Lightning: 1.51, Unholy: 1.51, Impact: 0.86,
          FiendClaw: 0, Ratka: 0, DragonScales: 0
        }
      },
      {
        label: 'Bone x5',
        armorType: 'Bone',
        count: 5,
        encumbrance: 7.5,
        stats: {
          Bludgeoning: 1.5, Piercing: 1.5, Slashing: 1.5,
          Acid: 2.8, Cold: 2.8, Fire: 2.8, Holy: 3.4,
          Lightning: 2.8, Unholy: 3.4, Impact: 0.9,
          FiendClaw: 0, Ratka: 0, DragonScales: 0
        }
      }
    ],
    totals: {
      encumbrance: 14.75,
      stats: {
        Bludgeoning: 3.25, Piercing: 3.25, Slashing: 3.25,
        Acid: 5.47, Cold: 5.47, Fire: 5.47, Holy: 6.31,
        Lightning: 5.47, Unholy: 6.31, Impact: 2.13,
        FiendClaw: 0, Ratka: 0, DragonScales: 0
      }
    }
  };

  it('should show loading state', () => {
    render(
      <ResultsDisplay
        optimalGear={null}
        loading={true}
        error={null}
        hasDataset={false}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show error state', () => {
    render(
      <ResultsDisplay
        optimalGear={null}
        loading={false}
        error="Failed to load data"
        hasDataset={false}
      />
    );

    expect(screen.getByText(/Error: Failed to load data/)).toBeInTheDocument();
  });

  it('should show placeholder when no dataset selected', () => {
    render(
      <ResultsDisplay
        optimalGear={null}
        loading={false}
        error={null}
        hasDataset={false}
      />
    );

    expect(screen.getByText('Select options above to view optimal gear')).toBeInTheDocument();
  });

  it('should show no results message when no gear found', () => {
    render(
      <ResultsDisplay
        optimalGear={null}
        loading={false}
        error={null}
        hasDataset={true}
      />
    );

    expect(screen.getByText('No valid gear sets found at this encumbrance level')).toBeInTheDocument();
  });

  it('should show specific message for feather mode with no results', () => {
    render(
      <ResultsDisplay
        optimalGear={null}
        loading={false}
        error={null}
        hasDataset={true}
        featherEnabled={true}
        headArmorType="Chain"
      />
    );

    expect(screen.getByText('No gear sets available with Chain head armor')).toBeInTheDocument();
  });

  it('should display optimal gear configuration', () => {
    render(
      <ResultsDisplay
        optimalGear={mockOptimalGear}
        loading={false}
        error={null}
        hasDataset={true}
      />
    );

    expect(screen.getByText('Optimal Gear Configuration')).toBeInTheDocument();
    expect(screen.getByText('Fixed Slots')).toBeInTheDocument();
    expect(screen.getByText('Interchangeable Slots (7 total)')).toBeInTheDocument();
  });

  it('should display fixed slots correctly', () => {
    render(
      <ResultsDisplay
        optimalGear={mockOptimalGear}
        loading={false}
        error={null}
        hasDataset={true}
      />
    );

    const boneElements = screen.getAllByText('Bone');
    expect(boneElements.length).toBeGreaterThan(0);

    const leatherElements = screen.getAllByText('Leather');
    expect(leatherElements.length).toBeGreaterThan(0);

    expect(screen.getByText('Studded')).toBeInTheDocument();
  });

  it('should display interchangeable slots with counts', () => {
    render(
      <ResultsDisplay
        optimalGear={mockOptimalGear}
        loading={false}
        error={null}
        hasDataset={true}
      />
    );

    expect(screen.getByText('×5')).toBeInTheDocument();
    expect(screen.getByText('×2')).toBeInTheDocument();
  });

  it('should display interchangeable slots note', () => {
    render(
      <ResultsDisplay
        optimalGear={mockOptimalGear}
        loading={false}
        error={null}
        hasDataset={true}
      />
    );

    expect(screen.getByText(/you still need to be aware of which types of armor/)).toBeInTheDocument();
  });

});

describe('ArmorStatsTable', () => {
  const mockRealStats = {
    slots: [
      {
        label: 'Head',
        armorType: 'Bone',
        count: 1,
        encumbrance: 1.5,
        stats: {
          Bludgeoning: 0.6, Piercing: 0.6, Slashing: 0.6,
          Acid: 1.16, Cold: 1.16, Fire: 1.16, Holy: 1.4,
          Lightning: 1.16, Unholy: 1.4, Impact: 0.37,
          FiendClaw: 0, Ratka: 0, DragonScales: 0
        }
      },
      {
        label: 'Chest',
        armorType: 'Leather',
        count: 1,
        encumbrance: 5.75,
        stats: {
          Bludgeoning: 1.15, Piercing: 1.15, Slashing: 1.15,
          Acid: 1.51, Cold: 1.51, Fire: 1.51, Holy: 1.51,
          Lightning: 1.51, Unholy: 1.51, Impact: 0.86,
          FiendClaw: 0, Ratka: 0, DragonScales: 0
        }
      }
    ],
    totals: {
      encumbrance: 7.25,
      stats: {
        Bludgeoning: 1.75, Piercing: 1.75, Slashing: 1.75,
        Acid: 2.67, Cold: 2.67, Fire: 2.67, Holy: 2.91,
        Lightning: 2.67, Unholy: 2.91, Impact: 1.23,
        FiendClaw: 0, Ratka: 0, DragonScales: 0
      }
    }
  };

  it('should render the stats table with correct columns', () => {
    render(<ArmorStatsTable realStats={mockRealStats} />);

    expect(screen.getByTestId('armor-stats-table')).toBeInTheDocument();

    // Check new column headers
    expect(screen.getByText('Enc')).toBeInTheDocument();
    expect(screen.getByText('Slash')).toBeInTheDocument();
    expect(screen.getByText('Bludg')).toBeInTheDocument();
    expect(screen.getByText('Pierce')).toBeInTheDocument();
    expect(screen.getByText('Fire/Acid/Cold')).toBeInTheDocument();
    expect(screen.getByText('Lightning')).toBeInTheDocument();
    expect(screen.getByText('Holy')).toBeInTheDocument();
    expect(screen.getByText('Unholy')).toBeInTheDocument();
    expect(screen.getByText('Impact')).toBeInTheDocument();
  });

  it('should not render Fiend, Ratka, or DrScl columns', () => {
    render(<ArmorStatsTable realStats={mockRealStats} />);

    expect(screen.queryByText('Fiend')).not.toBeInTheDocument();
    expect(screen.queryByText('Ratka')).not.toBeInTheDocument();
    expect(screen.queryByText('DrScl')).not.toBeInTheDocument();
  });

  it('should display slot labels', () => {
    render(<ArmorStatsTable realStats={mockRealStats} />);

    expect(screen.getByText('Head')).toBeInTheDocument();
    expect(screen.getByText('Chest')).toBeInTheDocument();
  });

  it('should display totals row', () => {
    render(<ArmorStatsTable realStats={mockRealStats} />);

    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('should return null when realStats is null', () => {
    const { container } = render(<ArmorStatsTable realStats={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('should display Magic Enc and Archery Enc summary rows', () => {
    render(<ArmorStatsTable realStats={mockRealStats} />);

    expect(screen.getByText('Magic Enc')).toBeInTheDocument();
    expect(screen.getByText('Archery Enc')).toBeInTheDocument();
  });

  it('should show dash for Magic/Archery Enc when total encumbrance is below threshold', () => {
    // Total encumbrance is 7.25, below both thresholds (20 and 30)
    render(<ArmorStatsTable realStats={mockRealStats} />);

    const magicRow = screen.getByText('Magic Enc').closest('tr');
    const archeryRow = screen.getByText('Archery Enc').closest('tr');

    expect(magicRow).toHaveTextContent('-');
    expect(archeryRow).toHaveTextContent('-');
  });

  it('should show correct effective encumbrance when above thresholds', () => {
    const highEncStats = {
      ...mockRealStats,
      totals: {
        ...mockRealStats.totals,
        encumbrance: 35,
      }
    };
    render(<ArmorStatsTable realStats={highEncStats} />);

    const magicRow = screen.getByText('Magic Enc').closest('tr');
    const archeryRow = screen.getByText('Archery Enc').closest('tr');

    // 35 - 20 = 15
    expect(magicRow).toHaveTextContent('15.00');
    // 35 - 30 = 5
    expect(archeryRow).toHaveTextContent('5.00');
  });
});
