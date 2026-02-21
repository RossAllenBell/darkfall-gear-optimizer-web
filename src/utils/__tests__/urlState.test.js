import { describe, it, expect } from 'vitest';
import {
  URL_DEFAULTS,
  parseUrlParams,
  serializeUrlParams,
  buildUrl,
  validateParamsAgainstConfig,
} from '../urlState';

describe('parseUrlParams', () => {
  it('should return defaults for empty string', () => {
    expect(parseUrlParams('')).toEqual(URL_DEFAULTS);
  });

  it('should parse all params', () => {
    const result = parseUrlParams(
      '?protection=physical&tier=common&enc=25&feather=true&featherValue=5&headArmor=Bone'
    );
    expect(result).toEqual({
      protection: 'physical',
      tier: 'common',
      enc: 25,
      feather: true,
      featherValue: 5,
      headArmor: 'Bone',
    });
  });

  it('should parse partial params and use defaults for the rest', () => {
    const result = parseUrlParams('?protection=magic&enc=30');
    expect(result).toEqual({
      ...URL_DEFAULTS,
      protection: 'magic',
      enc: 30,
    });
  });

  it('should fall back to default for invalid enc', () => {
    const result = parseUrlParams('?enc=notanumber');
    expect(result.enc).toBe(URL_DEFAULTS.enc);
  });

  it('should fall back to default for negative enc', () => {
    const result = parseUrlParams('?enc=-5');
    expect(result.enc).toBe(URL_DEFAULTS.enc);
  });

  it('should treat non-"true" feather as false', () => {
    const result = parseUrlParams('?feather=yes');
    expect(result.feather).toBe(false);
  });

  it('should ignore featherValue and headArmor when feather is false', () => {
    const result = parseUrlParams('?featherValue=10&headArmor=Plate');
    expect(result.featherValue).toBe(URL_DEFAULTS.featherValue);
    expect(result.headArmor).toBeNull();
  });

  it('should fall back to default for out-of-range featherValue', () => {
    const result = parseUrlParams('?feather=true&featherValue=0.05');
    expect(result.featherValue).toBe(URL_DEFAULTS.featherValue);
  });

  it('should fall back to default for featherValue > 30', () => {
    const result = parseUrlParams('?feather=true&featherValue=50');
    expect(result.featherValue).toBe(URL_DEFAULTS.featherValue);
  });

  it('should fall back to default for non-numeric featherValue', () => {
    const result = parseUrlParams('?feather=true&featherValue=abc');
    expect(result.featherValue).toBe(URL_DEFAULTS.featherValue);
  });

  it('should parse enc=0 as valid', () => {
    const result = parseUrlParams('?enc=0');
    expect(result.enc).toBe(0);
  });
});

describe('serializeUrlParams', () => {
  it('should return empty string for all defaults', () => {
    expect(serializeUrlParams(URL_DEFAULTS)).toBe('');
  });

  it('should include non-default protection', () => {
    const result = serializeUrlParams({ ...URL_DEFAULTS, protection: 'physical' });
    expect(result).toBe('protection=physical');
  });

  it('should include non-default tier', () => {
    const result = serializeUrlParams({ ...URL_DEFAULTS, tier: 'all' });
    expect(result).toBe('tier=all');
  });

  it('should include non-default enc', () => {
    const result = serializeUrlParams({ ...URL_DEFAULTS, enc: 30 });
    expect(result).toBe('enc=30');
  });

  it('should include feather and sub-params when feather is true', () => {
    const result = serializeUrlParams({
      ...URL_DEFAULTS,
      feather: true,
      featherValue: 5,
      headArmor: 'Bone',
    });
    const params = new URLSearchParams(result);
    expect(params.get('feather')).toBe('true');
    expect(params.get('featherValue')).toBe('5');
    expect(params.get('headArmor')).toBe('Bone');
  });

  it('should omit featherValue when it matches default', () => {
    const result = serializeUrlParams({
      ...URL_DEFAULTS,
      feather: true,
      featherValue: 0.1,
      headArmor: 'Bone',
    });
    const params = new URLSearchParams(result);
    expect(params.has('featherValue')).toBe(false);
    expect(params.get('headArmor')).toBe('Bone');
  });

  it('should omit featherValue and headArmor when feather is false', () => {
    const result = serializeUrlParams({
      ...URL_DEFAULTS,
      feather: false,
      featherValue: 5,
      headArmor: 'Bone',
    });
    expect(result).toBe('');
  });

  it('should round-trip with parseUrlParams', () => {
    const state = {
      protection: 'magic',
      tier: 'common',
      enc: 25.5,
      feather: true,
      featherValue: 3,
      headArmor: 'Plate',
    };
    const serialized = serializeUrlParams(state);
    const parsed = parseUrlParams(`?${serialized}`);
    expect(parsed).toEqual(state);
  });

  it('should include multiple params', () => {
    const result = serializeUrlParams({
      ...URL_DEFAULTS,
      protection: 'physical',
      tier: 'common',
      enc: 25,
    });
    const params = new URLSearchParams(result);
    expect(params.get('protection')).toBe('physical');
    expect(params.get('tier')).toBe('common');
    expect(params.get('enc')).toBe('25');
  });
});

describe('buildUrl', () => {
  it('should return just base path for empty search string', () => {
    expect(buildUrl('/darkfall-gear-optimizer-web/', '')).toBe(
      '/darkfall-gear-optimizer-web/'
    );
  });

  it('should append search params to base path', () => {
    expect(buildUrl('/darkfall-gear-optimizer-web/', 'protection=physical&enc=25')).toBe(
      '/darkfall-gear-optimizer-web/?protection=physical&enc=25'
    );
  });
});

describe('validateParamsAgainstConfig', () => {
  const config = {
    protectionTypes: [
      { id: 'physical', displayName: 'Physical' },
      { id: 'magic', displayName: 'Magic' },
    ],
    armorAccessTiers: [
      { id: 'common', displayName: 'Common' },
      { id: 'all', displayName: 'All' },
    ],
    armorTypes: ['NoArmor', 'Cloth', 'Bone', 'Leather', 'Plate'],
  };

  it('should pass through valid IDs', () => {
    const params = {
      ...URL_DEFAULTS,
      protection: 'physical',
      tier: 'common',
      headArmor: 'Bone',
    };
    const result = validateParamsAgainstConfig(params, config);
    expect(result.protection).toBe('physical');
    expect(result.tier).toBe('common');
    expect(result.headArmor).toBe('Bone');
  });

  it('should nullify invalid protection ID', () => {
    const params = { ...URL_DEFAULTS, protection: 'invalid' };
    const result = validateParamsAgainstConfig(params, config);
    expect(result.protection).toBeNull();
  });

  it('should nullify invalid tier ID', () => {
    const params = { ...URL_DEFAULTS, tier: 'invalid' };
    const result = validateParamsAgainstConfig(params, config);
    expect(result.tier).toBeNull();
  });

  it('should nullify invalid headArmor', () => {
    const params = { ...URL_DEFAULTS, headArmor: 'Mithril' };
    const result = validateParamsAgainstConfig(params, config);
    expect(result.headArmor).toBeNull();
  });

  it('should leave null values as null', () => {
    const result = validateParamsAgainstConfig(URL_DEFAULTS, config);
    expect(result.protection).toBeNull();
    expect(result.tier).toBeNull();
    expect(result.headArmor).toBeNull();
  });
});
