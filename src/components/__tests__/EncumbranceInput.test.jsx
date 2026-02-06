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
    disabled: false,
  };

  it('should render the encumbrance label and range', () => {
    render(<EncumbranceInput {...defaultProps} />);
    expect(screen.getByLabelText('Target Encumbrance')).toBeInTheDocument();
    expect(screen.getByText('Valid range: 19.15 - 42.50')).toBeInTheDocument();
  });

  it('should display the current value in the input', () => {
    render(<EncumbranceInput {...defaultProps} />);
    const input = screen.getByLabelText('Target Encumbrance');
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
    render(<EncumbranceInput {...defaultProps} value={19.15} onChange={onChange} />);

    // Button should be disabled at min
    expect(screen.getByRole('button', { name: 'Decrease by 0.1' })).toBeDisabled();
  });

  it('should clamp manual input to valid range on blur', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EncumbranceInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByLabelText('Target Encumbrance');
    await user.clear(input);
    await user.type(input, '999');
    await user.tab(); // triggers blur

    expect(onChange).toHaveBeenCalledWith(42.50);
  });

  it('should clamp manual input below min to min on blur', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EncumbranceInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByLabelText('Target Encumbrance');
    await user.clear(input);
    await user.type(input, '1');
    await user.tab();

    expect(onChange).toHaveBeenCalledWith(19.15);
  });

  it('should handle non-numeric input by falling back to range min on blur', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EncumbranceInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByLabelText('Target Encumbrance');
    await user.clear(input);
    await user.type(input, 'abc');
    await user.tab();

    expect(onChange).toHaveBeenCalledWith(19.15);
  });

  it('should render preset buttons (20, 30, 40)', () => {
    render(<EncumbranceInput {...defaultProps} />);
    expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '30' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '40' })).toBeInTheDocument();
  });

  it('should call onChange when a preset within range is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EncumbranceInput {...defaultProps} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '30' }));
    expect(onChange).toHaveBeenCalledWith(30);
  });

  it('should disable preset buttons outside the valid range', () => {
    render(
      <EncumbranceInput
        {...defaultProps}
        range={{ min: 25, max: 35 }}
      />
    );

    expect(screen.getByRole('button', { name: '20' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '30' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '40' })).toBeDisabled();
  });

  it('should disable all inputs when disabled prop is true', () => {
    render(<EncumbranceInput {...defaultProps} disabled={true} />);

    expect(screen.getByLabelText('Target Encumbrance')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decrease by 0.1' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Increase by 0.1' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '20' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '30' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '40' })).toBeDisabled();
  });

  it('should update displayed value when value prop changes', () => {
    const { rerender } = render(<EncumbranceInput {...defaultProps} value={25.30} />);
    expect(screen.getByLabelText('Target Encumbrance').value).toBe('25.30');

    rerender(<EncumbranceInput {...defaultProps} value={30.00} />);
    expect(screen.getByLabelText('Target Encumbrance').value).toBe('30.00');
  });

  it('should submit value on Enter key press', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EncumbranceInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByLabelText('Target Encumbrance');
    await user.clear(input);
    await user.type(input, '35{Enter}');

    expect(onChange).toHaveBeenCalledWith(35);
  });
});
