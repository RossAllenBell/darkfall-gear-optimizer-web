import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { findOptimalGear, getEncumbranceRange, parseGearData, parseArmorCsv, calculateRealStats } from '../utils/gearCalculator';
import { URL_DEFAULTS, parseUrlParams, serializeUrlParams, buildUrl, validateParamsAgainstConfig } from '../utils/urlState';

/**
 * Custom hook for managing gear optimizer state and data fetching
 */
export function useGearOptimizer() {
  // Parse URL params once on first render
  const urlParamsRef = useRef(null);
  if (urlParamsRef.current === null) {
    urlParamsRef.current = parseUrlParams(window.location.search);
  }

  const [config, setConfig] = useState(null);
  const [selectedProtectionType, setSelectedProtectionType] = useState(null);
  const [selectedArmorTier, setSelectedArmorTier] = useState(null);
  const [datasetResults, setDatasetResults] = useState(null);
  const [armorData, setArmorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Feather configuration — initialized from URL params
  const [featherEnabled, setFeatherEnabled] = useState(() => urlParamsRef.current.feather);
  const [featherValue, setFeatherValue] = useState(() => urlParamsRef.current.featherValue);
  const [headArmorType, setHeadArmorType] = useState(() => urlParamsRef.current.headArmor);

  // Encumbrance target — initialized from URL params
  const [targetEncumbrance, setTargetEncumbrance] = useState(() => urlParamsRef.current.enc);
  const [encumbranceType, setEncumbranceType] = useState(() => urlParamsRef.current.encType);

  // Track pending URL param IDs that need config to resolve
  const pendingUrlParams = useRef({
    protection: urlParamsRef.current.protection,
    tier: urlParamsRef.current.tier,
  });
  const hasAppliedUrlParams = useRef(false);

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

        // Resolve pending URL params against config
        if (!hasAppliedUrlParams.current && pendingUrlParams.current) {
          hasAppliedUrlParams.current = true;
          const pending = pendingUrlParams.current;

          if (pending.protection || pending.tier) {
            const validated = validateParamsAgainstConfig(
              { protection: pending.protection, tier: pending.tier, headArmor: null },
              configData
            );

            if (validated.protection) {
              const protType = configData.protectionTypes.find(pt => pt.id === validated.protection);
              if (protType) setSelectedProtectionType(protType);
            }

            if (validated.tier) {
              const tierObj = configData.armorAccessTiers.find(at => at.id === validated.tier);
              if (tierObj) setSelectedArmorTier(tierObj);
            }
          }
        }
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
            featherEnabled ? headArmorType : null,
            featherEnabled ? featherValue : 0
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
        featherEnabled ? headArmorType : null,
        featherEnabled ? featherValue : 0
      );

      // Clamp current target to new range
      if (targetEncumbrance < range.min) {
        setTargetEncumbrance(range.min);
      } else if (targetEncumbrance > range.max) {
        setTargetEncumbrance(range.max);
      }
    }
  }, [featherEnabled, headArmorType, featherValue, datasetResults]);

  // Sync state to URL
  useEffect(() => {
    // Don't update URL until config has loaded and initial params are applied
    if (!config || !hasAppliedUrlParams.current) return;

    const state = {
      protection: selectedProtectionType?.id ?? null,
      tier: selectedArmorTier?.id ?? null,
      enc: targetEncumbrance,
      encType: encumbranceType,
      feather: featherEnabled,
      featherValue,
      headArmor: headArmorType,
    };

    const searchString = serializeUrlParams(state);
    const newUrl = buildUrl(window.location.pathname, searchString);

    if (newUrl !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, '', newUrl);
    }
  }, [config, selectedProtectionType, selectedArmorTier, targetEncumbrance, encumbranceType, featherEnabled, featherValue, headArmorType]);

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
        featherEnabled ? headArmorType : null,
        featherEnabled ? featherValue : 0
      )
    : { min: 0, max: 200 };

  // Calculate real stats from armor CSV data
  const realStats = useMemo(() => {
    if (!optimalGear || !armorData) return null;
    const parsedGear = parseGearData(optimalGear);
    return calculateRealStats(parsedGear, armorData);
  }, [optimalGear, armorData]);

  const resetAll = useCallback(() => {
    setSelectedProtectionType(null);
    setSelectedArmorTier(null);
    setFeatherEnabled(URL_DEFAULTS.feather);
    setFeatherValue(URL_DEFAULTS.featherValue);
    setHeadArmorType(URL_DEFAULTS.headArmor);
    setTargetEncumbrance(URL_DEFAULTS.enc);
    setEncumbranceType(URL_DEFAULTS.encType);
  }, []);

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
    encumbranceType,
    setEncumbranceType,
    resetAll,
    optimalGear,
    encumbranceRange,
    realStats
  };
}
