import { useState, useEffect } from 'react';
import { findOptimalGear, getEncumbranceRange } from '../utils/gearCalculator';

/**
 * Custom hook for managing gear optimizer state and data fetching
 */
export function useGearOptimizer() {
  const [config, setConfig] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [datasetResults, setDatasetResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Feather configuration
  const [featherEnabled, setFeatherEnabled] = useState(false);
  const [featherValue, setFeatherValue] = useState(0);
  const [headArmorType, setHeadArmorType] = useState(null);

  // Encumbrance target
  const [targetEncumbrance, setTargetEncumbrance] = useState(20);

  // Load config on mount
  useEffect(() => {
    fetch('/darkfall-gear-optimizer-web/config.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load configuration');
        return res.json();
      })
      .then(data => {
        setConfig(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Load dataset when selected
  useEffect(() => {
    if (!selectedDataset) {
      setDatasetResults(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(selectedDataset.filePath)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load dataset');
        return res.json();
      })
      .then(data => {
        setDatasetResults(data.results);
        setLoading(false);

        // Set initial encumbrance to minimum available
        if (data.results && data.results.length > 0) {
          const range = getEncumbranceRange(
            data.results,
            featherEnabled ? headArmorType : null
          );
          setTargetEncumbrance(range.min);
        }
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedDataset]);

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

  return {
    config,
    selectedDataset,
    setSelectedDataset,
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
    encumbranceRange
  };
}
