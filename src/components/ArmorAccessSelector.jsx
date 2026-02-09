import React from 'react';

export default function ArmorAccessSelector({ config, selectedTier, onSelect, disabled }) {
  if (!config) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <label htmlFor="armor-tier" className="block text-sm font-medium text-gray-700 mb-2">
        I have access to everything up to:
      </label>
      <select
        id="armor-tier"
        value={selectedTier?.id || ''}
        onChange={(e) => {
          const tier = config.armorAccessTiers.find(t => t.id === e.target.value);
          onSelect(tier || null);
        }}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">Select armor access tier...</option>
        {config.armorAccessTiers.map(tier => (
          <option key={tier.id} value={tier.id}>
            {tier.displayName}
          </option>
        ))}
      </select>
    </div>
  );
}
