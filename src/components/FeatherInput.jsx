import React, { useState, useEffect } from 'react';

const FEATHER_MIN = 0.1;
const FEATHER_MAX = 30;

const FEATHER_PRESETS = [
  { value: 5, label: 'Q1 (5)' },
  { value: 9, label: 'Q2 (9)' },
  { value: 13, label: 'Q3 (13)' },
  { value: 18, label: 'Q4 (18)' },
  { value: 22, label: 'Q5 (22)' },
];

export default function FeatherInput({
  config,
  enabled,
  onEnabledChange,
  featherValue,
  onFeatherValueChange,
  headArmorType,
  onHeadArmorTypeChange,
  disabled
}) {
  const [inputValue, setInputValue] = useState(featherValue.toString());

  useEffect(() => {
    setInputValue(featherValue.toFixed(2));
  }, [featherValue]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const numValue = parseFloat(inputValue) || FEATHER_MIN;
    const clamped = Math.max(FEATHER_MIN, Math.min(FEATHER_MAX, numValue));
    onFeatherValueChange(clamped);
    setInputValue(clamped.toFixed(2));
  };

  const handleIncrement = (delta) => {
    const newValue = parseFloat((featherValue + delta).toFixed(2));
    const clamped = Math.max(FEATHER_MIN, Math.min(FEATHER_MAX, newValue));
    onFeatherValueChange(clamped);
  };

  const handlePresetClick = (preset) => {
    onFeatherValueChange(preset);
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center mb-3">
        <input
          type="checkbox"
          id="feather-enabled"
          checked={enabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
        />
        <label htmlFor="feather-enabled" className="ml-2 text-sm font-medium text-gray-700">
          I'm using Head armor with Feather
        </label>
      </div>

      {enabled && (
        <div className="space-y-3 pl-6 border-l-2 border-gray-200">
          <div>
            <label htmlFor="feather-value" className="block text-sm font-medium text-gray-700 mb-1">
              Feather Value ({FEATHER_MIN}-{FEATHER_MAX})
            </label>

            <div className="text-xs text-gray-500 mb-2">
              Valid range: {FEATHER_MIN.toFixed(2)} - {FEATHER_MAX.toFixed(2)}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => handleIncrement(-0.1)}
                disabled={disabled || featherValue <= FEATHER_MIN}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Decrease by 0.1"
              >
                -0.1
              </button>

              <input
                type="text"
                id="feather-value"
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
                disabled={disabled || featherValue >= FEATHER_MAX}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Increase by 0.1"
              >
                +0.1
              </button>
            </div>

            <div className="flex gap-2">
              {FEATHER_PRESETS.map(({ value: preset, label }) => (
                <button
                  key={preset}
                  onClick={() => handlePresetClick(preset)}
                  disabled={disabled}
                  className="flex-1 px-2 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="head-armor-type" className="block text-sm font-medium text-gray-700 mb-1">
              Head Armor Type (optional)
            </label>
            <select
              id="head-armor-type"
              value={headArmorType || ''}
              onChange={(e) => onHeadArmorTypeChange(e.target.value || null)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select head armor type...</option>
              {config?.armorTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 italic">
              Note: selecting a Head Armor Type filters results to optimal sets that happen to contain that specific Head armor
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
