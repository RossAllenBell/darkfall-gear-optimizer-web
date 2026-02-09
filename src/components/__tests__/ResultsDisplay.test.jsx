import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResultsDisplay from '../ResultsDisplay';

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
        realStats={mockRealStats}
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
        realStats={mockRealStats}
      />
    );

    const boneElements = screen.getAllByText('Bone');
    expect(boneElements.length).toBeGreaterThan(0);

    const leatherElements = screen.getAllByText('Leather');
    expect(leatherElements.length).toBeGreaterThan(0);

    expect(screen.getByText('Studded')).toBeInTheDocument();
  });

  it('should display armor stats table when realStats is provided', () => {
    render(
      <ResultsDisplay
        optimalGear={mockOptimalGear}
        loading={false}
        error={null}
        hasDataset={true}
        realStats={mockRealStats}
      />
    );

    expect(screen.getByText('Armor Stats')).toBeInTheDocument();
    expect(screen.getByTestId('armor-stats-table')).toBeInTheDocument();

    // Check column headers
    expect(screen.getByText('Enc')).toBeInTheDocument();
    expect(screen.getByText('Blud')).toBeInTheDocument();
    expect(screen.getByText('Slash')).toBeInTheDocument();
    expect(screen.getByText('Fire')).toBeInTheDocument();

    // Check totals row
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('should display slot labels in stats table', () => {
    render(
      <ResultsDisplay
        optimalGear={mockOptimalGear}
        loading={false}
        error={null}
        hasDataset={true}
        realStats={mockRealStats}
      />
    );

    expect(screen.getByText('Head')).toBeInTheDocument();
    expect(screen.getByText('Chest')).toBeInTheDocument();
    expect(screen.getByText('Bone x5')).toBeInTheDocument();
  });

  it('should display dash for zero stats', () => {
    render(
      <ResultsDisplay
        optimalGear={mockOptimalGear}
        loading={false}
        error={null}
        hasDataset={true}
        realStats={mockRealStats}
      />
    );

    // FiendClaw, Ratka, DragonScales are all 0 -> should show '-'
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('should show fallback statistics when realStats is null', () => {
    render(
      <ResultsDisplay
        optimalGear={mockOptimalGear}
        loading={false}
        error={null}
        hasDataset={true}
        realStats={null}
      />
    );

    expect(screen.getByText('Statistics')).toBeInTheDocument();
    expect(screen.getByText('Total Protection')).toBeInTheDocument();
    expect(screen.getByText('5.44')).toBeInTheDocument();
    expect(screen.getByText('Actual Encumbrance')).toBeInTheDocument();
    expect(screen.getByText('19.15')).toBeInTheDocument();
  });

  it('should display interchangeable slots with counts', () => {
    render(
      <ResultsDisplay
        optimalGear={mockOptimalGear}
        loading={false}
        error={null}
        hasDataset={true}
        realStats={mockRealStats}
      />
    );

    expect(screen.getByText('×5')).toBeInTheDocument();
    expect(screen.getByText('×2')).toBeInTheDocument();
  });
});
