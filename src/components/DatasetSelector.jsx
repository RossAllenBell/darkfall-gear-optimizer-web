import React from 'react';

export default function DatasetSelector({ config, selectedDataset, onSelect, disabled }) {
  if (!config) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <p className="text-gray-500">Loading datasets...</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <label htmlFor="dataset" className="block text-sm font-medium text-gray-700 mb-2">
        Protection Type
      </label>
      <select
        id="dataset"
        value={selectedDataset?.id || ''}
        onChange={(e) => {
          const dataset = config.datasets.find(d => d.id === e.target.value);
          onSelect(dataset);
        }}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">Select a protection type...</option>
        {config.datasets.map(dataset => (
          <option key={dataset.id} value={dataset.id}>
            {dataset.displayName}
          </option>
        ))}
      </select>
    </div>
  );
}
