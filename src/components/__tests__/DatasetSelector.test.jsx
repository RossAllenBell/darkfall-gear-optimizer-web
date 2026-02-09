import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DatasetSelector from '../DatasetSelector';

describe('DatasetSelector', () => {
  const mockConfig = {
    protectionTypes: [
      { id: 'physical', displayName: 'Physical' },
      { id: 'magic', displayName: 'Magic' },
      { id: 'piercing', displayName: 'Piercing' }
    ]
  };

  it('should show loading state when config is null', () => {
    render(<DatasetSelector config={null} selectedProtectionType={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Loading datasets...')).toBeInTheDocument();
  });

  it('should render protection type options', () => {
    render(
      <DatasetSelector
        config={mockConfig}
        selectedProtectionType={null}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Protection Type')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Physical' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Magic' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Piercing' })).toBeInTheDocument();
  });

  it('should call onSelect when a protection type is selected', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <DatasetSelector
        config={mockConfig}
        selectedProtectionType={null}
        onSelect={onSelect}
      />
    );

    const select = screen.getByLabelText('Protection Type');
    await user.selectOptions(select, 'magic');

    expect(onSelect).toHaveBeenCalledWith(mockConfig.protectionTypes[1]);
  });

  it('should show selected protection type', () => {
    render(
      <DatasetSelector
        config={mockConfig}
        selectedProtectionType={mockConfig.protectionTypes[0]}
        onSelect={vi.fn()}
      />
    );

    const select = screen.getByLabelText('Protection Type');
    expect(select).toHaveValue('physical');
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <DatasetSelector
        config={mockConfig}
        selectedProtectionType={null}
        onSelect={vi.fn()}
        disabled={true}
      />
    );

    const select = screen.getByLabelText('Protection Type');
    expect(select).toBeDisabled();
  });

  it('should call onSelect with null when empty option is selected', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <DatasetSelector
        config={mockConfig}
        selectedProtectionType={mockConfig.protectionTypes[0]}
        onSelect={onSelect}
      />
    );

    const select = screen.getByLabelText('Protection Type');
    await user.selectOptions(select, '');

    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
