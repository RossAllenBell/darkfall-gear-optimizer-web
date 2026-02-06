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
    expect(screen.getByText('Statistics')).toBeInTheDocument();
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

    // Use getAllByText since armor types may appear in multiple places
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

  it('should display statistics', () => {
    render(
      <ResultsDisplay
        optimalGear={mockOptimalGear}
        loading={false}
        error={null}
        hasDataset={true}
      />
    );

    expect(screen.getByText('Total Protection')).toBeInTheDocument();
    expect(screen.getByText('5.44')).toBeInTheDocument();
    expect(screen.getByText('Actual Encumbrance')).toBeInTheDocument();
    expect(screen.getByText('19.15')).toBeInTheDocument();
  });
});
