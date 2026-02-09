import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArmorAccessSelector from '../ArmorAccessSelector';

describe('ArmorAccessSelector', () => {
  const mockConfig = {
    armorAccessTiers: [
      { id: 'common', displayName: 'Bone and Plate' },
      { id: 'common+fp', displayName: 'Full Plate' },
      { id: 'common+fp+inf', displayName: 'Infernal' },
      { id: 'all', displayName: 'Dragon' }
    ]
  };

  it('should show loading state when config is null', () => {
    render(<ArmorAccessSelector config={null} selectedTier={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render armor tier options', () => {
    render(
      <ArmorAccessSelector
        config={mockConfig}
        selectedTier={null}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByLabelText('I have access to everything up to:')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Bone and Plate' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Full Plate' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Infernal' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Dragon' })).toBeInTheDocument();
  });

  it('should call onSelect when a tier is selected', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <ArmorAccessSelector
        config={mockConfig}
        selectedTier={null}
        onSelect={onSelect}
      />
    );

    const select = screen.getByLabelText('I have access to everything up to:');
    await user.selectOptions(select, 'common+fp');

    expect(onSelect).toHaveBeenCalledWith(mockConfig.armorAccessTiers[1]);
  });

  it('should show selected tier', () => {
    render(
      <ArmorAccessSelector
        config={mockConfig}
        selectedTier={mockConfig.armorAccessTiers[0]}
        onSelect={vi.fn()}
      />
    );

    const select = screen.getByLabelText('I have access to everything up to:');
    expect(select).toHaveValue('common');
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <ArmorAccessSelector
        config={mockConfig}
        selectedTier={null}
        onSelect={vi.fn()}
        disabled={true}
      />
    );

    const select = screen.getByLabelText('I have access to everything up to:');
    expect(select).toBeDisabled();
  });

  it('should call onSelect with null when empty option is selected', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <ArmorAccessSelector
        config={mockConfig}
        selectedTier={mockConfig.armorAccessTiers[0]}
        onSelect={onSelect}
      />
    );

    const select = screen.getByLabelText('I have access to everything up to:');
    await user.selectOptions(select, '');

    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
