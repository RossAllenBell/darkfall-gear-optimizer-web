import React from 'react';

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
          <p className="text-xs text-gray-500 italic">
            Note: when using this option, results may be unexpected as it filters to optimal sets that happen to contain the Head armor you've selected
          </p>
          <div>
            <label htmlFor="feather-value" className="block text-sm font-medium text-gray-700 mb-1">
              Feather Value (0.1-30)
            </label>
            <input
              type="number"
              id="feather-value"
              min="0.1"
              max="30"
              step="0.1"
              value={featherValue}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0.1;
                onFeatherValueChange(Math.max(0.1, Math.min(30, value)));
              }}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="head-armor-type" className="block text-sm font-medium text-gray-700 mb-1">
              Head Armor Type
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
          </div>
        </div>
      )}
    </div>
  );
}
