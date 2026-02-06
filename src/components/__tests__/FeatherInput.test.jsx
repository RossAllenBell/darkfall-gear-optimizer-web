import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeatherInput from '../FeatherInput';

describe('FeatherInput', () => {
  const mockConfig = {
    armorTypes: ['NoArmor', 'Cloth', 'Bone', 'Leather', 'Plate']
  };

  const defaultProps = {
    config: mockConfig,
    enabled: false,
    onEnabledChange: vi.fn(),
    featherValue: 0,
    onFeatherValueChange: vi.fn(),
    headArmorType: null,
    onHeadArmorTypeChange: vi.fn(),
    disabled: false
  };

  it('should render checkbox for enabling feather mode', () => {
    render(<FeatherInput {...defaultProps} />);
    expect(screen.getByLabelText('Enable Feathered Head Gear')).toBeInTheDocument();
  });

  it('should not show feather inputs when disabled', () => {
    render(<FeatherInput {...defaultProps} />);
    expect(screen.queryByLabelText('Feather Value (0-200)')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Head Armor Type')).not.toBeInTheDocument();
  });

  it('should show feather inputs when enabled', () => {
    render(<FeatherInput {...defaultProps} enabled={true} />);
    expect(screen.getByLabelText('Feather Value (0-200)')).toBeInTheDocument();
    expect(screen.getByLabelText('Head Armor Type')).toBeInTheDocument();
  });

  it('should call onEnabledChange when checkbox is toggled', async () => {
    const user = userEvent.setup();
    const onEnabledChange = vi.fn();

    render(<FeatherInput {...defaultProps} onEnabledChange={onEnabledChange} />);

    const checkbox = screen.getByLabelText('Enable Feathered Head Gear');
    await user.click(checkbox);

    expect(onEnabledChange).toHaveBeenCalledWith(true);
  });

  it('should render armor type options', () => {
    render(<FeatherInput {...defaultProps} enabled={true} />);

    mockConfig.armorTypes.forEach(type => {
      expect(screen.getByRole('option', { name: type })).toBeInTheDocument();
    });
  });

  it('should clamp feather value to maximum 200', async () => {
    const user = userEvent.setup();
    const onFeatherValueChange = vi.fn();

    render(
      <FeatherInput
        {...defaultProps}
        enabled={true}
        onFeatherValueChange={onFeatherValueChange}
      />
    );

    const input = screen.getByLabelText('Feather Value (0-200)');

    // Type a value that should be clamped
    await user.type(input, '250');

    // Check that all onChange calls have clamped values (none exceed 200)
    const calls = onFeatherValueChange.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    calls.forEach(call => {
      expect(call[0]).toBeLessThanOrEqual(200);
      expect(call[0]).toBeGreaterThanOrEqual(0);
    });
  });

  it('should call onHeadArmorTypeChange when armor type is selected', async () => {
    const user = userEvent.setup();
    const onHeadArmorTypeChange = vi.fn();

    render(
      <FeatherInput
        {...defaultProps}
        enabled={true}
        onHeadArmorTypeChange={onHeadArmorTypeChange}
      />
    );

    const select = screen.getByLabelText('Head Armor Type');
    await user.selectOptions(select, 'Bone');

    expect(onHeadArmorTypeChange).toHaveBeenCalledWith('Bone');
  });

  it('should disable inputs when disabled prop is true', () => {
    render(<FeatherInput {...defaultProps} enabled={true} disabled={true} />);

    expect(screen.getByLabelText('Enable Feathered Head Gear')).toBeDisabled();
    expect(screen.getByLabelText('Feather Value (0-200)')).toBeDisabled();
    expect(screen.getByLabelText('Head Armor Type')).toBeDisabled();
  });
});
