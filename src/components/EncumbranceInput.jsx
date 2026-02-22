import React, { useState, useEffect } from 'react';
import { getAvailableEncumbrances } from '../utils/gearCalculator';

const ENC_TYPE_OFFSETS = { raw: 0, magic: 20, archery: 30 };

export default function EncumbranceInput({
  value,
  onChange,
  range,
  datasetResults,
  headArmorType,
  featherEnabled,
  encumbranceType,
  onEncumbranceTypeChange,
  disabled
}) {
  const offset = ENC_TYPE_OFFSETS[encumbranceType] || 0;
  const displayValue = value - offset;
  const displayRange = { min: range.min - offset, max: range.max - offset };

  const [inputValue, setInputValue] = useState(displayValue.toFixed(2));

  useEffect(() => {
    setInputValue(displayValue.toFixed(2));
  }, [displayValue]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const numValue = parseFloat(inputValue);
    const rawValue = (isNaN(numValue) ? displayRange.min : numValue) + offset;
    const clamped = Math.max(range.min, Math.min(range.max, rawValue));
    onChange(clamped);
    setInputValue((clamped - offset).toFixed(2));
  };

  const handleIncrement = (delta) => {
    const newValue = parseFloat((value + delta).toFixed(2));
    const clamped = Math.max(range.min, Math.min(range.max, newValue));
    onChange(clamped);
  };

  const handlePresetClick = (rawPreset) => {
    if (rawPreset >= range.min && rawPreset <= range.max) {
      onChange(rawPreset);
    }
  };

  // Check if preset values are available
  const availableEncumbrances = datasetResults
    ? getAvailableEncumbrances(datasetResults, headArmorType)
    : [];

  const rawPresets = [20, 30, 40];
  const presetAvailability = rawPresets.map(rawValue => ({
    rawValue,
    displayLabel: (rawValue - offset).toString(),
    available: rawValue >= range.min && rawValue <= range.max
  }));

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <label htmlFor="encumbrance" className="block text-sm font-medium text-gray-700 mb-2">
        <span>Target </span>
        <select
          id="enc-type"
          value={encumbranceType}
          onChange={(e) => onEncumbranceTypeChange(e.target.value)}
          className="inline-block mx-1 px-1 py-0.5 text-sm font-medium border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={disabled}
        >
          <option value="raw">Raw</option>
          <option value="magic">Magic</option>
          <option value="archery">Archery</option>
        </select>
        <span> Encumbrance</span>
        {featherEnabled && <span> after Feather applied</span>}
      </label>

      <div className="text-xs text-gray-500 mb-3">
        Valid range: {displayRange.min.toFixed(2)} - {displayRange.max.toFixed(2)}
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
        {presetAvailability.map(({ rawValue, displayLabel, available }) => (
          <button
            key={rawValue}
            onClick={() => handlePresetClick(rawValue)}
            disabled={disabled || !available}
            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              available
                ? 'border-gray-300 bg-white hover:bg-gray-50'
                : 'border-gray-200 bg-gray-100 cursor-not-allowed text-gray-400'
            }`}
          >
            {displayLabel}
          </button>
        ))}
      </div>
    </div>
  );
}
