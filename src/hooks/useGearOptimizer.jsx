import { useState, useEffect, useMemo } from 'react';
import { findOptimalGear, getEncumbranceRange, parseGearData, parseArmorCsv, calculateRealStats } from '../utils/gearCalculator';

/**
 * Custom hook for managing gear optimizer state and data fetching
 */
export function useGearOptimizer() {
  const [config, setConfig] = useState(null);
  const [selectedProtectionType, setSelectedProtectionType] = useState(null);
  const [selectedArmorTier, setSelectedArmorTier] = useState(null);
  const [datasetResults, setDatasetResults] = useState(null);
  const [armorData, setArmorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Feather configuration
  const [featherEnabled, setFeatherEnabled] = useState(false);
  const [featherValue, setFeatherValue] = useState(0.1);
  const [headArmorType, setHeadArmorType] = useState(null);

  // Encumbrance target
  const [targetEncumbrance, setTargetEncumbrance] = useState(20);

  // Load config and armor CSV on mount
  useEffect(() => {
    Promise.all([
      fetch('/darkfall-gear-optimizer-web/config.json').then(res => {
        if (!res.ok) throw new Error('Failed to load configuration');
        return res.json();
      }),
      fetch('/darkfall-gear-optimizer-web/armor-data-complete.csv').then(res => {
        if (!res.ok) throw new Error('Failed to load armor data');
        return res.text();
      })
    ])
      .then(([configData, csvText]) => {
        setConfig(configData);
        setArmorData(parseArmorCsv(csvText));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Load dataset when protection type or armor tier changes
  useEffect(() => {
    if (!selectedProtectionType || !selectedArmorTier) {
      setDatasetResults(null);
      return;
    }

    setLoading(true);
    setError(null);

    const filePath = `/darkfall-gear-optimizer-web/results-complete-${selectedArmorTier.id}-${selectedProtectionType.id}.json`;

    fetch(filePath)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load dataset');
        return res.json();
      })
      .then(data => {
        setDatasetResults(data.results);
        setLoading(false);

        // Clamp encumbrance to new dataset's range, preserving current value if possible
        if (data.results && data.results.length > 0) {
          const range = getEncumbranceRange(
            data.results,
            featherEnabled ? headArmorType : null
          );
          setTargetEncumbrance(prev => {
            if (prev < range.min) return range.min;
            if (prev > range.max) return range.max;
            return prev;
          });
        }
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedProtectionType, selectedArmorTier]);

  // Update encumbrance range when feather config changes
  useEffect(() => {
    if (datasetResults && datasetResults.length > 0) {
      const range = getEncumbranceRange(
        datasetResults,
        featherEnabled ? headArmorType : null
      );

      // Clamp current target to new range
      if (targetEncumbrance < range.min) {
        setTargetEncumbrance(range.min);
      } else if (targetEncumbrance > range.max) {
        setTargetEncumbrance(range.max);
      }
    }
  }, [featherEnabled, headArmorType, datasetResults]);

  // Calculate optimal gear
  const optimalGear = datasetResults
    ? findOptimalGear(
        datasetResults,
        targetEncumbrance,
        featherEnabled ? featherValue : 0,
        featherEnabled ? headArmorType : null
      )
    : null;

  // Get encumbrance range
  const encumbranceRange = datasetResults
    ? getEncumbranceRange(
        datasetResults,
        featherEnabled ? headArmorType : null
      )
    : { min: 0, max: 200 };

  // Calculate real stats from armor CSV data
  const realStats = useMemo(() => {
    if (!optimalGear || !armorData) return null;
    const parsedGear = parseGearData(optimalGear);
    return calculateRealStats(parsedGear, armorData);
  }, [optimalGear, armorData]);

  return {
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
  };
}
