export const URL_DEFAULTS = {
  protection: null,
  tier: null,
  enc: 20,
  encType: 'raw',
  feather: false,
  featherValue: 0.1,
  headArmor: null,
};

/**
 * Parses URL search string into a flat state object.
 * Invalid numeric values fall back to defaults.
 */
export function parseUrlParams(searchString) {
  const params = new URLSearchParams(searchString);
  const result = { ...URL_DEFAULTS };

  if (params.has('protection')) {
    result.protection = params.get('protection');
  }

  if (params.has('tier')) {
    result.tier = params.get('tier');
  }

  if (params.has('enc')) {
    const enc = parseFloat(params.get('enc'));
    if (!isNaN(enc) && enc >= 0) {
      result.enc = enc;
    }
  }

  if (params.has('encType')) {
    const encType = params.get('encType');
    if (['raw', 'magic', 'archery'].includes(encType)) {
      result.encType = encType;
    }
  }

  if (params.has('feather')) {
    result.feather = params.get('feather') === 'true';
  }

  if (result.feather) {
    if (params.has('featherValue')) {
      const fv = parseFloat(params.get('featherValue'));
      if (!isNaN(fv) && fv >= 0.1 && fv <= 30) {
        result.featherValue = fv;
      }
    }

    if (params.has('headArmor')) {
      result.headArmor = params.get('headArmor');
    }
  }

  return result;
}

/**
 * Converts state object to URL search string.
 * Omits default values. Omits featherValue/headArmor when feather is false.
 */
export function serializeUrlParams(state) {
  const params = new URLSearchParams();

  if (state.protection != null) {
    params.set('protection', state.protection);
  }

  if (state.tier != null) {
    params.set('tier', state.tier);
  }

  if (state.enc !== URL_DEFAULTS.enc) {
    params.set('enc', String(state.enc));
  }

  if (state.encType && state.encType !== URL_DEFAULTS.encType) {
    params.set('encType', state.encType);
  }

  if (state.feather) {
    params.set('feather', 'true');

    if (state.featherValue !== URL_DEFAULTS.featherValue) {
      params.set('featherValue', String(state.featherValue));
    }

    if (state.headArmor != null) {
      params.set('headArmor', state.headArmor);
    }
  }

  return params.toString();
}

/**
 * Combines base path with search params into a full URL path.
 */
export function buildUrl(basePath, searchString) {
  if (!searchString) {
    return basePath;
  }
  return `${basePath}?${searchString}`;
}

/**
 * Validates protection/tier/headArmor IDs against loaded config.
 * Nullifies any IDs not found in config.
 */
export function validateParamsAgainstConfig(params, config) {
  const result = { ...params };

  if (result.protection != null) {
    const found = config.protectionTypes.some(pt => pt.id === result.protection);
    if (!found) {
      result.protection = null;
    }
  }

  if (result.tier != null) {
    const found = config.armorAccessTiers.some(at => at.id === result.tier);
    if (!found) {
      result.tier = null;
    }
  }

  if (result.headArmor != null) {
    const found = config.armorTypes.includes(result.headArmor);
    if (!found) {
      result.headArmor = null;
    }
  }

  return result;
}
