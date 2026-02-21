import React from 'react';
import { parseGearData, getArmorColorClass } from '../utils/gearCalculator';

const DISPLAY_COLUMNS = [
  { key: 'Slashing', label: 'Slash', group: 'physical' },
  { key: 'Bludgeoning', label: 'Bludg', group: 'physical' },
  { key: 'Piercing', label: 'Pierce', group: 'physical' },
  { key: 'elemental', label: 'Fire/Acid/Cold', group: 'elemental', computed: true },
  { key: 'Lightning', label: 'Lightning', group: 'lightning' },
  { key: 'Holy', label: 'Holy', group: 'holyunholy' },
  { key: 'Unholy', label: 'Unholy', group: 'holyunholy' },
  { key: 'Impact', label: 'Impact', group: 'impact' },
];

function getElementalValue(stats) {
  return stats.Fire || stats.Acid || stats.Cold || 0;
}

function formatStat(val) {
  if (val === 0) return '-';
  return val.toFixed(2);
}

function getStatValue(stats, col) {
  if (col.computed && col.key === 'elemental') {
    return getElementalValue(stats);
  }
  return stats[col.key] || 0;
}

function groupBorderClass(col, idx) {
  if (idx === 0) return '';
  const prevGroup = DISPLAY_COLUMNS[idx - 1].group;
  if (col.group !== prevGroup) return 'border-l-2 border-gray-300';
  return '';
}

export function ArmorStatsTable({ realStats, featherEnabled = false, featherValue = 0 }) {
  if (!realStats) return null;

  const rawEnc = realStats.totals.encumbrance;
  const activeFeather = featherEnabled ? featherValue : 0;
  const effectiveEnc = Math.max(0, rawEnc - activeFeather);
  const emptyCols = DISPLAY_COLUMNS.map((col, colIdx) => (
    <td key={col.key} className={`py-1 px-1 ${groupBorderClass(col, colIdx)}`}></td>
  ));

  return (
    <table className="text-xs" data-testid="armor-stats-table">
      <thead>
        <tr className="border-b border-gray-300">
          <th className="text-left py-1 pr-2 font-semibold text-gray-700">Slot</th>
          <th className="text-right py-1 px-1 font-semibold text-gray-700 border-l-2 border-gray-300 border-r-2">Enc</th>
          {DISPLAY_COLUMNS.map((col, idx) => (
            <th key={col.key} className={`text-right py-1 px-1 font-semibold text-gray-700 ${groupBorderClass(col, idx)}`}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {realStats.slots.map((slot, idx) => (
          <tr key={idx} className="border-b border-gray-100">
            <td className="py-1 pr-2 text-gray-700 whitespace-nowrap">{slot.label}</td>
            <td className="text-right py-1 px-1 text-gray-600 border-l-2 border-gray-300 border-r-2">{formatStat(slot.encumbrance)}</td>
            {DISPLAY_COLUMNS.map((col, colIdx) => (
              <td key={col.key} className={`text-right py-1 px-1 text-gray-600 ${groupBorderClass(col, colIdx)}`}>
                {formatStat(getStatValue(slot.stats, col))}
              </td>
            ))}
          </tr>
        ))}
        <tr className="border-t-2 border-gray-400 font-bold">
          <td className="py-1 pr-2 text-gray-900">Total</td>
          <td className="text-right py-1 px-1 text-gray-900 border-l-2 border-gray-300 border-r-2">{formatStat(rawEnc)}</td>
          {DISPLAY_COLUMNS.map((col, colIdx) => (
            <td key={col.key} className={`text-right py-1 px-1 text-gray-900 ${groupBorderClass(col, colIdx)}`}>
              {formatStat(getStatValue(realStats.totals.stats, col))}
            </td>
          ))}
        </tr>
        {featherEnabled && (
          <>
            <tr className="text-gray-500">
              <td className="py-1 pr-2 italic">Feather</td>
              <td className="text-right py-1 px-1 border-l-2 border-gray-300 border-r-2">
                {activeFeather > 0 ? `−${activeFeather.toFixed(2)}` : '-'}
              </td>
              {emptyCols}
            </tr>
            <tr className="font-semibold text-gray-700">
              <td className="py-1 pr-2">Effective</td>
              <td className="text-right py-1 px-1 border-l-2 border-gray-300 border-r-2">{formatStat(effectiveEnc)}</td>
              {emptyCols}
            </tr>
          </>
        )}
        <tr className="h-3" aria-hidden="true"><td colSpan={2 + DISPLAY_COLUMNS.length}></td></tr>
        {[{ label: 'Magic Enc', threshold: 20 }, { label: 'Archery Enc', threshold: 30 }].map(({ label, threshold }) => (
          <tr key={label} className="text-gray-500">
            <td className="py-1 pr-2 italic">{label}</td>
            <td className="text-right py-1 px-1 border-l-2 border-gray-300 border-r-2">
              {formatStat(Math.max(0, effectiveEnc - threshold))}
            </td>
            {DISPLAY_COLUMNS.map((col, colIdx) => (
              <td key={col.key} className={`py-1 px-1 ${groupBorderClass(col, colIdx)}`}></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

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
        <span className="text-sm text-gray-600">&times;{count}</span>
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
            <p className="text-xs text-gray-500 italic mb-2">
              Note: you still need to be aware of which types of armor are available in which slots (ex: gloves are only available in certain types)
            </p>
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

      </div>
    </div>
  );
}
