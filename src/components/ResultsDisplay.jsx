import React from 'react';
import { parseGearData, getArmorColorClass } from '../utils/gearCalculator';

export default function ResultsDisplay({ optimalGear, loading, error, hasDataset, featherEnabled, headArmorType }) {
  if (loading) {
    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <p className="text-gray-500 text-center">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 border-red-200">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!hasDataset) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <p className="text-gray-500 text-center">Select options above to view optimal gear</p>
      </div>
    );
  }

  if (!optimalGear) {
    let message = 'No valid gear sets found at this encumbrance level';

    if (featherEnabled && headArmorType) {
      message = `No gear sets available with ${headArmorType} head armor`;
    }

    return (
      <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
        <p className="text-yellow-800">{message}</p>
      </div>
    );
  }

  const gearData = parseGearData(optimalGear);

  if (!gearData) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 border-red-200">
        <p className="text-red-600">Error parsing gear data</p>
      </div>
    );
  }

  const ArmorSlot = ({ label, armorType }) => {
    if (!armorType) return null;

    const colorClass = getArmorColorClass(armorType);

    return (
      <div className="flex items-center justify-between p-2 rounded border border-gray-200">
        <span className="text-sm font-medium text-gray-700">{label}:</span>
        <span className={`px-3 py-1 rounded text-sm font-medium ${colorClass}`}>
          {armorType}
        </span>
      </div>
    );
  };

  const InterchangeableSlot = ({ armorType, count }) => {
    const colorClass = getArmorColorClass(armorType);

    return (
      <div className="flex items-center justify-between p-2 rounded border border-gray-200">
        <span className={`px-3 py-1 rounded text-sm font-medium ${colorClass}`}>
          {armorType}
        </span>
        <span className="text-sm text-gray-600">×{count}</span>
      </div>
    );
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Optimal Gear Configuration</h2>

      <div className="space-y-4">
        {/* Fixed Slots */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Fixed Slots
          </h3>
          <div className="space-y-2">
            <ArmorSlot label="Head" armorType={gearData.fixed.head} />
            <ArmorSlot label="Chest" armorType={gearData.fixed.chest} />
            <ArmorSlot label="Legs" armorType={gearData.fixed.legs} />
          </div>
        </div>

        {/* Interchangeable Slots */}
        {gearData.interchangeable.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              Interchangeable Slots (7 total)
            </h3>
            <div className="space-y-2">
              {gearData.interchangeable.map((slot, index) => (
                <InterchangeableSlot
                  key={index}
                  armorType={slot.type}
                  count={slot.count}
                />
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Statistics
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <p className="text-xs text-gray-600 mb-1">Total Protection</p>
              <p className="text-lg font-bold text-green-700">
                {gearData.totalProtection.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-gray-600 mb-1">Actual Encumbrance</p>
              <p className="text-lg font-bold text-blue-700">
                {gearData.encumbrance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
