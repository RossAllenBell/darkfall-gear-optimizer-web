import React, { useState, useCallback } from 'react';
import { useGearOptimizer } from './hooks/useGearOptimizer';
import DatasetSelector from './components/DatasetSelector';
import ArmorAccessSelector from './components/ArmorAccessSelector';
import FeatherInput from './components/FeatherInput';
import EncumbranceInput from './components/EncumbranceInput';
import ResultsDisplay, { ArmorStatsTable } from './components/ResultsDisplay';

function App() {
  const {
    config,
    selectedProtectionType,
    setSelectedProtectionType,
    selectedArmorTier,
    setSelectedArmorTier,
    datasetResults,
    loading,
    error,
    featherEnabled,
    setFeatherEnabled,
    featherValue,
    setFeatherValue,
    headArmorType,
    setHeadArmorType,
    targetEncumbrance,
    setTargetEncumbrance,
    optimalGear,
    encumbranceRange,
    realStats
  } = useGearOptimizer();

  const hasDataset = !!selectedProtectionType && !!selectedArmorTier && !!datasetResults;

  const [copied, setCopied] = useState(false);
  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Darkfall Gear Optimizer
          </h1>
          <p className="text-gray-600">
            Find optimal gear configurations based on protection type and encumbrance targets
          </p>
        </header>

        {/* Main Content */}
        <div className={hasDataset ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'max-w-2xl'}>
          {/* Left Column - Inputs */}
          <div className="space-y-4">
            <DatasetSelector
              config={config}
              selectedProtectionType={selectedProtectionType}
              onSelect={setSelectedProtectionType}
              disabled={loading}
            />

            <ArmorAccessSelector
              config={config}
              selectedTier={selectedArmorTier}
              onSelect={setSelectedArmorTier}
              disabled={loading || !selectedProtectionType}
            />

            <FeatherInput
              config={config}
              enabled={featherEnabled}
              onEnabledChange={setFeatherEnabled}
              featherValue={featherValue}
              onFeatherValueChange={setFeatherValue}
              headArmorType={headArmorType}
              onHeadArmorTypeChange={setHeadArmorType}
              disabled={!hasDataset || loading}
            />

            <EncumbranceInput
              value={targetEncumbrance}
              onChange={setTargetEncumbrance}
              range={encumbranceRange}
              datasetResults={datasetResults}
              headArmorType={featherEnabled ? headArmorType : null}
              featherEnabled={featherEnabled}
              disabled={!hasDataset || loading}
            />
          </div>

          {/* Right Column - Results (only shown when dataset is selected) */}
          {hasDataset && (
            <div>
              <ResultsDisplay
                optimalGear={optimalGear}
                loading={loading}
                error={error}
                hasDataset={hasDataset}
                featherEnabled={featherEnabled}
                headArmorType={headArmorType}
              />
            </div>
          )}
        </div>

        {/* Armor Stats Table - Below the two-column layout, sized to content */}
        {hasDataset && realStats && (
          <div className="mt-6 inline-block p-4 border rounded-lg bg-white shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              Armor Stats
            </h3>
            <ArmorStatsTable realStats={realStats} featherEnabled={featherEnabled} featherValue={featherValue} />
            <p className="mt-3 text-xs text-gray-500 italic max-w-lg">
              Note: I thought Archery encumbrance kicks in at 30, but the in-game paperdoll suggests it kicks in at 60. Let me know if there's a definitive source of truth for this.
            </p>
            <div className="mt-3 relative inline-block">
              <button
                onClick={handleShare}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors"
              >
                Share
              </button>
              {copied && (
                <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap text-sm text-green-700 font-medium">
                  Link copied to clipboard
                </span>
              )}
            </div>
          </div>
        )}
        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-gray-300 text-center text-sm text-gray-500">
          <p>
            I'm very interested in feedback on if this tool was helpful and if you have any suggestions or fixes to make it even better.
            I'm <span className="font-medium text-gray-700">bullwinklejmoose</span> on Discord
            and <span className="font-medium text-gray-700">Bullwinkle Jmoose</span> in game.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
