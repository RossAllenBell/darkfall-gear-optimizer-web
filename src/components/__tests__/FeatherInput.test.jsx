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
    featherValue: 5,
    onFeatherValueChange: vi.fn(),
    headArmorType: null,
    onHeadArmorTypeChange: vi.fn(),
    disabled: false
  };

  it('should render checkbox for enabling feather mode', () => {
    render(<FeatherInput {...defaultProps} />);
    expect(screen.getByLabelText("I'm using Head armor with Feather")).toBeInTheDocument();
  });

  it('should not show feather inputs when disabled', () => {
    render(<FeatherInput {...defaultProps} />);
    expect(screen.queryByLabelText(/Feather Value/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Head Armor Type (optional)')).not.toBeInTheDocument();
  });

  it('should show feather inputs when enabled', () => {
    render(<FeatherInput {...defaultProps} enabled={true} />);
    expect(screen.getByLabelText(/Feather Value/)).toBeInTheDocument();
    expect(screen.getByLabelText('Head Armor Type (optional)')).toBeInTheDocument();
  });

  it('should call onEnabledChange when checkbox is toggled', async () => {
    const user = userEvent.setup();
    const onEnabledChange = vi.fn();

    render(<FeatherInput {...defaultProps} onEnabledChange={onEnabledChange} />);

    const checkbox = screen.getByLabelText("I'm using Head armor with Feather");
    await user.click(checkbox);

    expect(onEnabledChange).toHaveBeenCalledWith(true);
  });

  it('should render armor type options', () => {
    render(<FeatherInput {...defaultProps} enabled={true} />);

    mockConfig.armorTypes.forEach(type => {
      expect(screen.getByRole('option', { name: type })).toBeInTheDocument();
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

    const select = screen.getByLabelText('Head Armor Type (optional)');
    await user.selectOptions(select, 'Bone');

    expect(onHeadArmorTypeChange).toHaveBeenCalledWith('Bone');
  });

  describe('feather value input', () => {
    it('should display the current feather value in the input', () => {
      render(<FeatherInput {...defaultProps} enabled={true} featherValue={13} />);
      const input = screen.getByLabelText(/Feather Value/);
      expect(input.value).toBe('13.0');
    });

    it('should call onFeatherValueChange with incremented value when +0.1 is clicked', async () => {
      const user = userEvent.setup();
      const onFeatherValueChange = vi.fn();
      render(
        <FeatherInput
          {...defaultProps}
          enabled={true}
          featherValue={5}
          onFeatherValueChange={onFeatherValueChange}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Increase by 0.1' }));
      expect(onFeatherValueChange).toHaveBeenCalledWith(5.1);
    });

    it('should call onFeatherValueChange with decremented value when -0.1 is clicked', async () => {
      const user = userEvent.setup();
      const onFeatherValueChange = vi.fn();
      render(
        <FeatherInput
          {...defaultProps}
          enabled={true}
          featherValue={5}
          onFeatherValueChange={onFeatherValueChange}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Decrease by 0.1' }));
      expect(onFeatherValueChange).toHaveBeenCalledWith(4.9);
    });

    it('should disable decrement button at minimum value', () => {
      render(
        <FeatherInput {...defaultProps} enabled={true} featherValue={0.1} />
      );
      expect(screen.getByRole('button', { name: 'Decrease by 0.1' })).toBeDisabled();
    });

    it('should disable increment button at maximum value', () => {
      render(
        <FeatherInput {...defaultProps} enabled={true} featherValue={30} />
      );
      expect(screen.getByRole('button', { name: 'Increase by 0.1' })).toBeDisabled();
    });

    it('should clamp manual input above max to max on blur', async () => {
      const user = userEvent.setup();
      const onFeatherValueChange = vi.fn();
      render(
        <FeatherInput
          {...defaultProps}
          enabled={true}
          onFeatherValueChange={onFeatherValueChange}
        />
      );

      const input = screen.getByLabelText(/Feather Value/);
      await user.clear(input);
      await user.type(input, '50');
      await user.tab();

      expect(onFeatherValueChange).toHaveBeenCalledWith(30);
    });

    it('should clamp manual input below min to min on blur', async () => {
      const user = userEvent.setup();
      const onFeatherValueChange = vi.fn();
      render(
        <FeatherInput
          {...defaultProps}
          enabled={true}
          onFeatherValueChange={onFeatherValueChange}
        />
      );

      const input = screen.getByLabelText(/Feather Value/);
      await user.clear(input);
      await user.type(input, '0');
      await user.tab();

      expect(onFeatherValueChange).toHaveBeenCalledWith(0.1);
    });

    it('should handle non-numeric input by falling back to min on blur', async () => {
      const user = userEvent.setup();
      const onFeatherValueChange = vi.fn();
      render(
        <FeatherInput
          {...defaultProps}
          enabled={true}
          onFeatherValueChange={onFeatherValueChange}
        />
      );

      const input = screen.getByLabelText(/Feather Value/);
      await user.clear(input);
      await user.type(input, 'abc');
      await user.tab();

      expect(onFeatherValueChange).toHaveBeenCalledWith(0.1);
    });

    it('should submit value on Enter key press', async () => {
      const user = userEvent.setup();
      const onFeatherValueChange = vi.fn();
      render(
        <FeatherInput
          {...defaultProps}
          enabled={true}
          onFeatherValueChange={onFeatherValueChange}
        />
      );

      const input = screen.getByLabelText(/Feather Value/);
      await user.clear(input);
      await user.type(input, '18{Enter}');

      expect(onFeatherValueChange).toHaveBeenCalledWith(18);
    });

    it('should update displayed value when featherValue prop changes', () => {
      const { rerender } = render(
        <FeatherInput {...defaultProps} enabled={true} featherValue={5} />
      );
      expect(screen.getByLabelText(/Feather Value/).value).toBe('5.0');

      rerender(<FeatherInput {...defaultProps} enabled={true} featherValue={13} />);
      expect(screen.getByLabelText(/Feather Value/).value).toBe('13.0');
    });
  });

  describe('preset buttons', () => {
    it('should render all five preset buttons', () => {
      render(<FeatherInput {...defaultProps} enabled={true} />);
      expect(screen.getByRole('button', { name: 'Q1 (5)' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Q2 (9)' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Q3 (13)' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Q4 (18)' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Q5 (22)' })).toBeInTheDocument();
    });

    it('should call onFeatherValueChange when a preset is clicked', async () => {
      const user = userEvent.setup();
      const onFeatherValueChange = vi.fn();
      render(
        <FeatherInput
          {...defaultProps}
          enabled={true}
          onFeatherValueChange={onFeatherValueChange}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Q3 (13)' }));
      expect(onFeatherValueChange).toHaveBeenCalledWith(13);
    });

    it('should call onFeatherValueChange for each preset value', async () => {
      const user = userEvent.setup();
      const onFeatherValueChange = vi.fn();
      render(
        <FeatherInput
          {...defaultProps}
          enabled={true}
          onFeatherValueChange={onFeatherValueChange}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Q1 (5)' }));
      expect(onFeatherValueChange).toHaveBeenCalledWith(5);

      await user.click(screen.getByRole('button', { name: 'Q2 (9)' }));
      expect(onFeatherValueChange).toHaveBeenCalledWith(9);

      await user.click(screen.getByRole('button', { name: 'Q4 (18)' }));
      expect(onFeatherValueChange).toHaveBeenCalledWith(18);

      await user.click(screen.getByRole('button', { name: 'Q5 (22)' }));
      expect(onFeatherValueChange).toHaveBeenCalledWith(22);
    });
  });

  describe('disabled state', () => {
    it('should disable all inputs when disabled prop is true', () => {
      render(<FeatherInput {...defaultProps} enabled={true} disabled={true} />);

      expect(screen.getByLabelText("I'm using Head armor with Feather")).toBeDisabled();
      expect(screen.getByLabelText(/Feather Value/)).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Decrease by 0.1' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Increase by 0.1' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Q1 (5)' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Q2 (9)' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Q3 (13)' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Q4 (18)' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Q5 (22)' })).toBeDisabled();
      expect(screen.getByLabelText('Head Armor Type (optional)')).toBeDisabled();
    });
  });
});
