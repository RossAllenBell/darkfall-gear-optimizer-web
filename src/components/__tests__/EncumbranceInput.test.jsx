import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EncumbranceInput from '../EncumbranceInput';

describe('EncumbranceInput', () => {
  const mockResults = [
    { encumbrance: 19.15, totalProtection: 5.44, gear: { piece1: { description: 'Head - Bone' } } },
    { encumbrance: 25.30, totalProtection: 7.20, gear: { piece1: { description: 'Head - Leather' } } },
    { encumbrance: 30.00, totalProtection: 9.10, gear: { piece1: { description: 'Head - Chain' } } },
    { encumbrance: 42.50, totalProtection: 11.80, gear: { piece1: { description: 'Head - Plate' } } },
  ];

  const defaultProps = {
    value: 25.30,
    onChange: vi.fn(),
    range: { min: 19.15, max: 42.50 },
    datasetResults: mockResults,
    headArmorType: null,
    encumbranceType: 'raw',
    onEncumbranceTypeChange: vi.fn(),
    disabled: false,
  };

  it('should render the encumbrance label and range', () => {
    render(<EncumbranceInput {...defaultProps} />);
    expect(screen.getByRole('textbox', { name: /Encumbrance/ })).toBeInTheDocument();
    expect(screen.getByText('Valid range: 20.00 - 42.50')).toBeInTheDocument();
  });

  it('should display the current value in the input', () => {
    render(<EncumbranceInput {...defaultProps} />);
    const input = screen.getByRole('textbox', { name: /Encumbrance/ });
    expect(input.value).toBe('25.30');
  });

  it('should call onChange with incremented value when +0.1 is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EncumbranceInput {...defaultProps} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Increase by 0.1' }));
    expect(onChange).toHaveBeenCalledWith(25.40);
  });

  it('should call onChange with decremented value when -0.1 is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EncumbranceInput {...defaultProps} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Decrease by 0.1' }));
    expect(onChange).toHaveBeenCalledWith(25.20);
  });

  it('should clamp increment to range max', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EncumbranceInput {...defaultProps} value={42.50} onChange={onChange} />);

    // Button should be disabled at max
    expect(screen.getByRole('button', { name: 'Increase by 0.1' })).toBeDisabled();
  });

  it('should clamp decrement to range min', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EncumbranceInput {...defaultProps} value={20} onChange={onChange} />);

    // Button should be disabled at effective min (20 for raw)
    expect(screen.getByRole('button', { name: 'Decrease by 0.1' })).toBeDisabled();
  });

  it('should clamp manual input to valid range on blur', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EncumbranceInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole('textbox', { name: /Encumbrance/ });
    await user.clear(input);
    await user.type(input, '999');
    await user.tab(); // triggers blur

    expect(onChange).toHaveBeenCalledWith(42.50);
  });

  it('should clamp manual input below min to min on blur', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EncumbranceInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole('textbox', { name: /Encumbrance/ });
    await user.clear(input);
    await user.type(input, '1');
    await user.tab();

    expect(onChange).toHaveBeenCalledWith(20);
  });

  it('should handle non-numeric input by falling back to range min on blur', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EncumbranceInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole('textbox', { name: /Encumbrance/ });
    await user.clear(input);
    await user.type(input, 'abc');
    await user.tab();

    expect(onChange).toHaveBeenCalledWith(20);
  });

  it('should render preset buttons (20, 40, 60) in raw mode', () => {
    render(<EncumbranceInput {...defaultProps} />);
    expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '40' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '60' })).toBeInTheDocument();
  });

  it('should call onChange when a preset within range is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EncumbranceInput {...defaultProps} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '40' }));
    expect(onChange).toHaveBeenCalledWith(40);
  });

  it('should disable preset buttons outside the valid range', () => {
    render(
      <EncumbranceInput
        {...defaultProps}
        range={{ min: 15, max: 55 }}
      />
    );

    expect(screen.getByRole('button', { name: '20' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '40' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '60' })).toBeDisabled();
  });

  it('should disable all inputs when disabled prop is true', () => {
    render(<EncumbranceInput {...defaultProps} disabled={true} />);

    expect(screen.getByRole('textbox', { name: /Encumbrance/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decrease by 0.1' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Increase by 0.1' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '20' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '40' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '60' })).toBeDisabled();
  });

  it('should update displayed value when value prop changes', () => {
    const { rerender } = render(<EncumbranceInput {...defaultProps} value={25.30} />);
    expect(screen.getByRole('textbox', { name: /Encumbrance/ }).value).toBe('25.30');

    rerender(<EncumbranceInput {...defaultProps} value={30.00} />);
    expect(screen.getByRole('textbox', { name: /Encumbrance/ }).value).toBe('30.00');
  });

  it('should submit value on Enter key press', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EncumbranceInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole('textbox', { name: /Encumbrance/ });
    await user.clear(input);
    await user.type(input, '35{Enter}');

    expect(onChange).toHaveBeenCalledWith(35);
  });

  it('should render the encumbrance type dropdown', () => {
    render(<EncumbranceInput {...defaultProps} />);
    const select = document.getElementById('enc-type');
    expect(select).toBeInTheDocument();
    expect(select.value).toBe('raw');
  });

  it('should call onEncumbranceTypeChange when dropdown changes', async () => {
    const user = userEvent.setup();
    const onEncumbranceTypeChange = vi.fn();
    render(<EncumbranceInput {...defaultProps} onEncumbranceTypeChange={onEncumbranceTypeChange} />);

    await user.selectOptions(document.getElementById('enc-type'), 'magic');
    expect(onEncumbranceTypeChange).toHaveBeenCalledWith('magic');
  });

  it('should display converted value in Magic mode', () => {
    render(<EncumbranceInput {...defaultProps} value={25} encumbranceType="magic" />);
    const input = screen.getByRole('textbox', { name: /Encumbrance/ });
    expect(input.value).toBe('5.00');
  });

  it('should display converted range in Magic mode', () => {
    render(<EncumbranceInput {...defaultProps} encumbranceType="magic" />);
    expect(screen.getByText('Valid range: 0.00 - 22.50')).toBeInTheDocument();
  });

  it('should convert input back to raw value on blur in Magic mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EncumbranceInput {...defaultProps} encumbranceType="magic" onChange={onChange} />);

    const input = screen.getByRole('textbox', { name: /Encumbrance/ });
    await user.clear(input);
    await user.type(input, '10');
    await user.tab();

    // User typed 10 in magic mode, which is 10 + 20 = 30 raw
    expect(onChange).toHaveBeenCalledWith(30);
  });

  it('should display presets in selected unit for Magic mode', () => {
    render(<EncumbranceInput {...defaultProps} encumbranceType="magic" />);
    expect(screen.getByRole('button', { name: '0' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
  });

  it('should display presets in selected unit for Archery mode', () => {
    render(<EncumbranceInput {...defaultProps} encumbranceType="archery" />);
    expect(screen.getByRole('button', { name: '0' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '40' })).toBeInTheDocument();
  });

  it('should display converted value in Archery mode', () => {
    render(<EncumbranceInput {...defaultProps} value={30} encumbranceType="archery" />);
    const input = screen.getByRole('textbox', { name: /Encumbrance/ });
    expect(input.value).toBe('0.00');
  });

  it('should clamp value up to effective min when below floor', () => {
    const onChange = vi.fn();
    // value=25 raw, archery effective min = max(19.15, 30) = 30, so 25 < 30
    render(<EncumbranceInput {...defaultProps} value={25} encumbranceType="archery" onChange={onChange} />);
    expect(onChange).toHaveBeenCalledWith(30);
  });

  it('should enforce raw minimum of 20', () => {
    const onChange = vi.fn();
    // value=15 raw, raw effective min = max(19.15, 20) = 20
    render(<EncumbranceInput {...defaultProps} value={15} encumbranceType="raw" onChange={onChange} />);
    expect(onChange).toHaveBeenCalledWith(20);
  });
});
