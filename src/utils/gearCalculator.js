/**
 * Finds the optimal gear set based on target encumbrance and optional feather configuration
 * @param {Array} results - Array of gear configurations from the dataset
 * @param {number} targetEncumbrance - Target encumbrance value
 * @param {number} featherValue - Feather value to adjust encumbrance (0 if not enabled)
 * @param {string} headArmorType - Required head armor type (null if feather not enabled)
 * @returns {Object|null} - Best gear configuration or null if no match found
 */
export function findOptimalGear(results, targetEncumbrance, featherValue, headArmorType) {
  if (!results || results.length === 0) {
    return null;
  }

  // Adjust target encumbrance if feather is enabled
  const adjustedTarget = featherValue > 0 ? targetEncumbrance + featherValue : targetEncumbrance;

  // Filter results based on feather configuration
  let filteredResults = results;
  if (featherValue > 0 && headArmorType) {
    const headPattern = `Head - ${headArmorType}`;
    filteredResults = results.filter(result => {
      // Check all gear pieces for the matching head piece
      return Object.values(result.gear).some(piece =>
        piece.description === headPattern
      );
    });
  }

  if (filteredResults.length === 0) {
    return null;
  }

  // Find the best match: highest protection where encumbrance <= adjustedTarget
  let bestMatch = null;
  let bestProtection = -1;

  for (const result of filteredResults) {
    if (result.encumbrance <= adjustedTarget) {
      if (result.totalProtection > bestProtection) {
        bestProtection = result.totalProtection;
        bestMatch = result;
      }
    }
  }

  return bestMatch;
}

/**
 * Gets all unique encumbrance values from the dataset
 * @param {Array} results - Array of gear configurations
 * @param {string} headArmorType - Required head armor type (null if feather not enabled)
 * @returns {Array} - Sorted array of unique encumbrance values
 */
export function getAvailableEncumbrances(results, headArmorType = null) {
  if (!results || results.length === 0) {
    return [];
  }

  // Filter results if head armor type is specified
  let filteredResults = results;
  if (headArmorType) {
    const headPattern = `Head - ${headArmorType}`;
    filteredResults = results.filter(result => {
      return Object.values(result.gear).some(piece =>
        piece.description === headPattern
      );
    });
  }

  const encumbrances = filteredResults.map(r => r.encumbrance);
  return [...new Set(encumbrances)].sort((a, b) => a - b);
}

/**
 * Gets the valid encumbrance range for a dataset
 * @param {Array} results - Array of gear configurations
 * @param {string} headArmorType - Required head armor type (null if feather not enabled)
 * @returns {Object} - {min, max} encumbrance values
 */
export function getEncumbranceRange(results, headArmorType = null) {
  const encumbrances = getAvailableEncumbrances(results, headArmorType);

  if (encumbrances.length === 0) {
    return { min: 0, max: 200 };
  }

  return {
    min: encumbrances[0],
    max: Math.min(200, encumbrances[encumbrances.length - 1])
  };
}

/**
 * Parses gear data into a more readable format for display
 * @param {Object} gearSet - Gear configuration object
 * @returns {Object} - Parsed gear data with fixed and interchangeable slots
 */
export function parseGearData(gearSet) {
  if (!gearSet || !gearSet.gear) {
    return null;
  }

  const fixed = {
    head: null,
    chest: null,
    legs: null
  };

  const interchangeable = [];

  Object.values(gearSet.gear).forEach(piece => {
    const desc = piece.description;

    if (desc.startsWith('Head - ')) {
      fixed.head = desc.replace('Head - ', '');
    } else if (desc.startsWith('Chest - ')) {
      fixed.chest = desc.replace('Chest - ', '');
    } else if (desc.startsWith('Legs - ')) {
      fixed.legs = desc.replace('Legs - ', '');
    } else if (desc.startsWith('(interchangeable) - ')) {
      const armorType = desc.replace('(interchangeable) - ', '');
      interchangeable.push({
        type: armorType,
        count: piece.count
      });
    }
  });

  return {
    fixed,
    interchangeable,
    totalProtection: gearSet.totalProtection,
    encumbrance: gearSet.encumbrance
  };
}

/**
 * Gets the CSS classes for a specific armor type (background + text color)
 * @param {string} armorType - Armor type name
 * @returns {string} - Tailwind CSS class names
 */
export function getArmorColorClass(armorType) {
  const type = armorType.toLowerCase().replace(/\s+/g, '');
  const darkTypes = ['scale', 'plate', 'fullplate', 'infernal', 'dragon'];
  const textClass = darkTypes.includes(type) ? 'text-white' : 'text-gray-900';
  return `bg-armor-${type} ${textClass}`;
}

/**
 * All 13 damage type names in CSV column order
 */
export const DAMAGE_TYPES = [
  'Bludgeoning', 'Piercing', 'Slashing',
  'Acid', 'Cold', 'Fire', 'Holy', 'Lightning', 'Unholy',
  'Impact', 'FiendClaw', 'Ratka', 'DragonScales'
];

/**
 * Parses armor CSV text into a lookup table
 * @param {string} csvText - Raw CSV text
 * @returns {Object} - { [armorType]: { [slot]: { encumbrance, stats: { [damageType]: number } } } }
 */
export function parseArmorCsv(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return {};

  const headers = lines[0].split(',');
  const encIdx = headers.indexOf('Encumbrance');
  const typeIdx = headers.indexOf('Type');
  const slotIdx = headers.indexOf('Slot');

  const damageIndices = DAMAGE_TYPES.map(name => headers.indexOf(name));

  const lookup = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const armorType = cols[typeIdx];
    const slot = cols[slotIdx];

    if (!lookup[armorType]) {
      lookup[armorType] = {};
    }

    const stats = {};
    for (let j = 0; j < DAMAGE_TYPES.length; j++) {
      stats[DAMAGE_TYPES[j]] = parseFloat(cols[damageIndices[j]]) || 0;
    }

    lookup[armorType][slot] = {
      encumbrance: parseFloat(cols[encIdx]) || 0,
      stats
    };
  }

  return lookup;
}

/**
 * Calculates real armor stats for a parsed gear set using CSV armor data
 * @param {Object} parsedGear - Output from parseGearData()
 * @param {Object} armorData - Output from parseArmorCsv()
 * @returns {Object|null} - { slots: [...], totals: { encumbrance, stats: {...} } }
 */
export function calculateRealStats(parsedGear, armorData) {
  if (!parsedGear || !armorData) return null;

  const slots = [];
  const totals = { encumbrance: 0, stats: {} };
  DAMAGE_TYPES.forEach(dt => { totals.stats[dt] = 0; });

  // Helper to add a slot entry
  const addSlot = (label, armorType, slotKey, count) => {
    const typeData = armorData[armorType];
    if (!typeData) return;

    const slotData = typeData[slotKey];
    if (!slotData) return;

    const entry = {
      label,
      armorType,
      count,
      encumbrance: slotData.encumbrance * count,
      stats: {}
    };

    DAMAGE_TYPES.forEach(dt => {
      entry.stats[dt] = slotData.stats[dt] * count;
      totals.stats[dt] += entry.stats[dt];
    });

    totals.encumbrance += entry.encumbrance;
    slots.push(entry);
  };

  // Fixed slots
  if (parsedGear.fixed.head) {
    addSlot('Head', parsedGear.fixed.head, 'Head', 1);
  }
  if (parsedGear.fixed.chest) {
    addSlot('Chest', parsedGear.fixed.chest, 'Chest', 1);
  }
  if (parsedGear.fixed.legs) {
    addSlot('Legs', parsedGear.fixed.legs, 'Legs', 1);
  }

  // Interchangeable slots — use Arms as the representative slot
  for (const group of parsedGear.interchangeable) {
    const typeData = armorData[group.type];
    if (!typeData) continue;

    // Find a representative interchangeable slot
    const interchangeableSlots = ['Arms', 'Boots', 'Elbows', 'Gauntlets', 'Girdle', 'Greaves', 'Shoulders'];
    let slotData = null;
    for (const s of interchangeableSlots) {
      if (typeData[s]) {
        slotData = typeData[s];
        break;
      }
    }
    if (!slotData) continue;

    const entry = {
      label: `${group.type} x${group.count}`,
      armorType: group.type,
      count: group.count,
      encumbrance: slotData.encumbrance * group.count,
      stats: {}
    };

    DAMAGE_TYPES.forEach(dt => {
      entry.stats[dt] = slotData.stats[dt] * group.count;
      totals.stats[dt] += entry.stats[dt];
    });

    totals.encumbrance += entry.encumbrance;
    slots.push(entry);
  }

  return { slots, totals };
}
