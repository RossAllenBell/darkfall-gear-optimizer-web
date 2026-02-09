import React from 'react';
import { useGearOptimizer } from './hooks/useGearOptimizer';
import DatasetSelector from './components/DatasetSelector';
import ArmorAccessSelector from './components/ArmorAccessSelector';
import FeatherInput from './components/FeatherInput';
import EncumbranceInput from './components/EncumbranceInput';
import ResultsDisplay from './components/ResultsDisplay';

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
  const isFeatherReady = !featherEnabled || (featherEnabled && headArmorType);

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
              disabled={loading}
            />

            <FeatherInput
              config={config}
              enabled={featherEnabled}
              onEnabledChange={(enabled) => {
                setFeatherEnabled(enabled);
                if (enabled) {
                  setFeatherValue(0.1);
                } else {
                  setFeatherValue(0);
                  setHeadArmorType(null);
                }
              }}
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
              disabled={!hasDataset || !isFeatherReady || loading}
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
                realStats={realStats}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
