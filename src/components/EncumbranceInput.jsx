import React, { useState, useEffect } from 'react';
import { getAvailableEncumbrances } from '../utils/gearCalculator';

export default function EncumbranceInput({
  value,
  onChange,
  range,
  datasetResults,
  headArmorType,
  featherEnabled,
  disabled
}) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toFixed(2));
  }, [value]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const numValue = parseFloat(inputValue) || range.min;
    const clamped = Math.max(range.min, Math.min(range.max, numValue));
    onChange(clamped);
    setInputValue(clamped.toFixed(2));
  };

  const handleIncrement = (delta) => {
    const newValue = parseFloat((value + delta).toFixed(2));
    const clamped = Math.max(range.min, Math.min(range.max, newValue));
    onChange(clamped);
  };

  const handlePresetClick = (preset) => {
    if (preset >= range.min && preset <= range.max) {
      onChange(preset);
    }
  };

  // Check if preset values are available
  const availableEncumbrances = datasetResults
    ? getAvailableEncumbrances(datasetResults, headArmorType)
    : [];

  const presets = [
    { value: 20, label: '20 (Magic)' },
    { value: 30, label: '30 (Archery)' },
    { value: 40, label: '40' }
  ];
  const presetAvailability = presets.map(preset => ({
    ...preset,
    available: preset.value >= range.min && preset.value <= range.max
  }));

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <label htmlFor="encumbrance" className="block text-sm font-medium text-gray-700 mb-2">
        {featherEnabled ? 'Target Encumbrance after Feather applied' : 'Target Encumbrance'}
      </label>

      <div className="text-xs text-gray-500 mb-3">
        Valid range: {range.min.toFixed(2)} - {range.max.toFixed(2)}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => handleIncrement(-0.1)}
          disabled={disabled || value <= range.min}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Decrease by 0.1"
        >
          -0.1
        </button>

        <input
          type="text"
          id="encumbrance"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleInputBlur();
            }
          }}
          disabled={disabled}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-center"
        />

        <button
          onClick={() => handleIncrement(0.1)}
          disabled={disabled || value >= range.max}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Increase by 0.1"
        >
          +0.1
        </button>
      </div>

      <div className="flex gap-2">
        {presetAvailability.map(({ value: preset, label, available }) => (
          <button
            key={preset}
            onClick={() => handlePresetClick(preset)}
            disabled={disabled || !available}
            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              available
                ? 'border-gray-300 bg-white hover:bg-gray-50'
                : 'border-gray-200 bg-gray-100 cursor-not-allowed text-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
