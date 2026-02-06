import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DatasetSelector from '../DatasetSelector';

describe('DatasetSelector', () => {
  const mockConfig = {
    datasets: [
      {
        id: 'fire100-slashing100',
        displayName: '50% Fire, 50% Slashing',
        filePath: '/path1.json'
      },
      {
        id: 'slashing100',
        displayName: '100% Slashing',
        filePath: '/path2.json'
      }
    ]
  };

  it('should show loading state when config is null', () => {
    render(<DatasetSelector config={null} selectedDataset={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Loading datasets...')).toBeInTheDocument();
  });

  it('should render dataset options', () => {
    render(
      <DatasetSelector
        config={mockConfig}
        selectedDataset={null}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Protection Type')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '50% Fire, 50% Slashing' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '100% Slashing' })).toBeInTheDocument();
  });

  it('should call onSelect when a dataset is selected', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <DatasetSelector
        config={mockConfig}
        selectedDataset={null}
        onSelect={onSelect}
      />
    );

    const select = screen.getByLabelText('Protection Type');
    await user.selectOptions(select, 'slashing100');

    expect(onSelect).toHaveBeenCalledWith(mockConfig.datasets[1]);
  });

  it('should show selected dataset', () => {
    render(
      <DatasetSelector
        config={mockConfig}
        selectedDataset={mockConfig.datasets[0]}
        onSelect={vi.fn()}
      />
    );

    const select = screen.getByLabelText('Protection Type');
    expect(select).toHaveValue('fire100-slashing100');
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <DatasetSelector
        config={mockConfig}
        selectedDataset={null}
        onSelect={vi.fn()}
        disabled={true}
      />
    );

    const select = screen.getByLabelText('Protection Type');
    expect(select).toBeDisabled();
  });
});
