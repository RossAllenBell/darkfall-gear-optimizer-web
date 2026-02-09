import { describe, it, expect } from 'vitest';
import {
  findOptimalGear,
  getAvailableEncumbrances,
  getEncumbranceRange,
  parseGearData,
  getArmorColorClass,
  DAMAGE_TYPES,
  parseArmorCsv,
  calculateRealStats
} from '../gearCalculator';

describe('gearCalculator', () => {
  const mockResults = [
    {
      rank: 1,
      totalProtection: 5.44,
      encumbrance: 19.15,
      gear: {
        piece1: { description: 'Head - Bone', count: 1 },
        piece2: { description: '(interchangeable) - Bone', count: 5 },
        piece3: { description: 'Chest - Leather', count: 1 },
        piece4: { description: 'Legs - Studded', count: 1 }
      }
    },
    {
      rank: 2,
      totalProtection: 5.50,
      encumbrance: 20.0,
      gear: {
        piece1: { description: 'Head - Leather', count: 1 },
        piece2: { description: '(interchangeable) - Leather', count: 5 },
        piece3: { description: 'Chest - Studded', count: 1 },
        piece4: { description: 'Legs - Studded', count: 1 }
      }
    },
    {
      rank: 3,
      totalProtection: 6.00,
      encumbrance: 25.0,
      gear: {
        piece1: { description: 'Head - Plate', count: 1 },
        piece2: { description: '(interchangeable) - Plate', count: 5 },
        piece3: { description: 'Chest - Plate', count: 1 },
        piece4: { description: 'Legs - Plate', count: 1 }
      }
    }
  ];

  describe('findOptimalGear', () => {
    it('should find gear with highest protection under target encumbrance', () => {
      const result = findOptimalGear(mockResults, 20.0, 0, null);
      expect(result).toBeTruthy();
      expect(result.totalProtection).toBe(5.50);
      expect(result.encumbrance).toBe(20.0);
    });

    it('should return null when no results match encumbrance', () => {
      const result = findOptimalGear(mockResults, 10.0, 0, null);
      expect(result).toBeNull();
    });

    it('should adjust target encumbrance with feather value', () => {
      // With feather value of 5, target of 20 becomes 25
      const result = findOptimalGear(mockResults, 20.0, 5.0, 'Plate');
      expect(result).toBeTruthy();
      expect(result.totalProtection).toBe(6.00);
      expect(result.encumbrance).toBe(25.0);
    });

    it('should filter by head armor type when feather enabled', () => {
      const result = findOptimalGear(mockResults, 25.0, 5.0, 'Bone');
      expect(result).toBeTruthy();
      expect(result.gear.piece1.description).toBe('Head - Bone');
    });

    it('should return null when head armor type not found', () => {
      const result = findOptimalGear(mockResults, 25.0, 5.0, 'Chain');
      expect(result).toBeNull();
    });

    it('should handle empty results', () => {
      const result = findOptimalGear([], 20.0, 0, null);
      expect(result).toBeNull();
    });

    it('should handle null results', () => {
      const result = findOptimalGear(null, 20.0, 0, null);
      expect(result).toBeNull();
    });
  });

  describe('getAvailableEncumbrances', () => {
    it('should return sorted unique encumbrance values', () => {
      const encumbrances = getAvailableEncumbrances(mockResults);
      expect(encumbrances).toEqual([19.15, 20.0, 25.0]);
    });

    it('should filter by head armor type', () => {
      const encumbrances = getAvailableEncumbrances(mockResults, 'Bone');
      expect(encumbrances).toEqual([19.15]);
    });

    it('should handle empty results', () => {
      const encumbrances = getAvailableEncumbrances([]);
      expect(encumbrances).toEqual([]);
    });

    it('should handle null results', () => {
      const encumbrances = getAvailableEncumbrances(null);
      expect(encumbrances).toEqual([]);
    });
  });

  describe('getEncumbranceRange', () => {
    it('should return min and max encumbrance', () => {
      const range = getEncumbranceRange(mockResults);
      expect(range).toEqual({ min: 19.15, max: 25.0 });
    });

    it('should cap max at 200', () => {
      const largeResults = [
        { ...mockResults[0], encumbrance: 10.0 },
        { ...mockResults[1], encumbrance: 250.0 }
      ];
      const range = getEncumbranceRange(largeResults);
      expect(range.max).toBe(200);
    });

    it('should filter by head armor type', () => {
      const range = getEncumbranceRange(mockResults, 'Leather');
      expect(range).toEqual({ min: 20.0, max: 20.0 });
    });

    it('should handle empty results', () => {
      const range = getEncumbranceRange([]);
      expect(range).toEqual({ min: 0, max: 200 });
    });
  });

  describe('parseGearData', () => {
    it('should parse gear into fixed and interchangeable slots', () => {
      const parsed = parseGearData(mockResults[0]);

      expect(parsed.fixed).toEqual({
        head: 'Bone',
        chest: 'Leather',
        legs: 'Studded'
      });

      expect(parsed.interchangeable).toEqual([
        { type: 'Bone', count: 5 }
      ]);

      expect(parsed.totalProtection).toBe(5.44);
      expect(parsed.encumbrance).toBe(19.15);
    });

    it('should handle null gear set', () => {
      const parsed = parseGearData(null);
      expect(parsed).toBeNull();
    });

    it('should handle gear set without gear property', () => {
      const parsed = parseGearData({});
      expect(parsed).toBeNull();
    });
  });

  describe('getArmorColorClass', () => {
    it('should return correct CSS classes for armor type', () => {
      expect(getArmorColorClass('Bone')).toBe('bg-armor-bone text-gray-900');
      expect(getArmorColorClass('Leather')).toBe('bg-armor-leather text-gray-900');
      expect(getArmorColorClass('Plate')).toBe('bg-armor-plate text-white');
    });

    it('should use white text for dark armor types', () => {
      expect(getArmorColorClass('Scale')).toContain('text-white');
      expect(getArmorColorClass('Plate')).toContain('text-white');
      expect(getArmorColorClass('FullPlate')).toContain('text-white');
      expect(getArmorColorClass('Infernal')).toContain('text-white');
    });

    it('should use dark text for light armor types', () => {
      expect(getArmorColorClass('Bone')).toContain('text-gray-900');
      expect(getArmorColorClass('Cloth')).toContain('text-gray-900');
      expect(getArmorColorClass('Leather')).toContain('text-gray-900');
    });

    it('should handle armor types with spaces', () => {
      expect(getArmorColorClass('Full Plate')).toBe('bg-armor-fullplate text-white');
    });

    it('should handle case insensitivity', () => {
      expect(getArmorColorClass('BONE')).toBe('bg-armor-bone text-gray-900');
      expect(getArmorColorClass('LeAtHeR')).toBe('bg-armor-leather text-gray-900');
    });

    it('should use white text for Dragon armor', () => {
      expect(getArmorColorClass('Dragon')).toContain('text-white');
    });

    it('should use dark text for Padded armor', () => {
      expect(getArmorColorClass('Padded')).toBe('bg-armor-padded text-gray-900');
    });

    it('should use dark text for NoArmor', () => {
      expect(getArmorColorClass('NoArmor')).toBe('bg-armor-noarmor text-gray-900');
    });
  });

  describe('DAMAGE_TYPES', () => {
    it('should have 13 damage types', () => {
      expect(DAMAGE_TYPES).toHaveLength(13);
    });

    it('should include all expected damage types', () => {
      expect(DAMAGE_TYPES).toContain('Bludgeoning');
      expect(DAMAGE_TYPES).toContain('Piercing');
      expect(DAMAGE_TYPES).toContain('Slashing');
      expect(DAMAGE_TYPES).toContain('DragonScales');
    });
  });

  describe('parseArmorCsv', () => {
    const csvText = `Type,Slot,Name,Skill,Mastery,Cloth,Bone,Leather,Iron,Selentine,Theyril,Leenspar,Gold,Encumbrance,Bludgeoning,Piercing,Slashing,Acid,Cold,Fire,Holy,Lightning,Unholy,Impact,FiendClaw,Ratka,DragonScales
Bone,Head,Helmet,100,0,0,4,3,0,0,0,0,11,1.5,0.6,0.6,0.6,1.16,1.16,1.16,1.4,1.16,1.4,0.37,0,0,0
Bone,Arms,Vambraces,100,0,0,2,2,0,0,0,0,9,1.5,0.3,0.3,0.3,0.56,0.56,0.56,0.68,0.56,0.68,0.18,0,0,0
Leather,Chest,Cuirass,50,0,0,0,12,0,0,0,0,0,5.75,1.15,1.15,1.15,1.51,1.51,1.51,1.51,1.51,1.51,0.86,0,0,0`;

    it('should parse CSV into lookup table', () => {
      const result = parseArmorCsv(csvText);
      expect(result).toHaveProperty('Bone');
      expect(result).toHaveProperty('Leather');
      expect(result.Bone).toHaveProperty('Head');
      expect(result.Bone).toHaveProperty('Arms');
      expect(result.Leather).toHaveProperty('Chest');
    });

    it('should parse encumbrance values correctly', () => {
      const result = parseArmorCsv(csvText);
      expect(result.Bone.Head.encumbrance).toBe(1.5);
      expect(result.Leather.Chest.encumbrance).toBe(5.75);
    });

    it('should parse damage stats correctly', () => {
      const result = parseArmorCsv(csvText);
      expect(result.Bone.Head.stats.Bludgeoning).toBe(0.6);
      expect(result.Bone.Head.stats.Slashing).toBe(0.6);
      expect(result.Bone.Head.stats.Holy).toBe(1.4);
      expect(result.Leather.Chest.stats.Bludgeoning).toBe(1.15);
    });

    it('should return empty object for empty CSV', () => {
      expect(parseArmorCsv('')).toEqual({});
      expect(parseArmorCsv('header only')).toEqual({});
    });

    it('should handle armor types with partial slot coverage', () => {
      const partialCsv = `Type,Slot,Name,Skill,Mastery,Cloth,Bone,Leather,Iron,Selentine,Theyril,Leenspar,Gold,Encumbrance,Bludgeoning,Piercing,Slashing,Acid,Cold,Fire,Holy,Lightning,Unholy,Impact,FiendClaw,Ratka,DragonScales
Chain,Arms,Sleeves,1,0,0,0,1,1,0,0,0,0,5,0.34,0.38,0.43,0.78,0.78,0.78,0.78,0.57,0.78,0.43,0,0,0
Chain,Legs,Leggings,1,0,0,0,1,1,0,0,0,0,4,0.34,0.38,0.43,0.78,0.78,0.78,0.78,0.57,0.78,0.43,0,0,0
Chain,Chest,Hauberk,1,0,0,0,2,6,0,0,0,0,21,1.36,1.53,1.7,3.29,3.29,3.29,3.29,2.42,3.29,1.7,0,0,0`;

      const result = parseArmorCsv(partialCsv);
      expect(result.Chain).toBeDefined();
      expect(Object.keys(result.Chain)).toEqual(['Arms', 'Legs', 'Chest']);
      expect(result.Chain.Arms.encumbrance).toBe(5);
      expect(result.Chain.Boots).toBeUndefined();
      expect(result.Chain.Gauntlets).toBeUndefined();
    });

    it('should handle multiple armor types in same CSV', () => {
      const multiCsv = `Type,Slot,Name,Skill,Mastery,Cloth,Bone,Leather,Iron,Selentine,Theyril,Leenspar,Gold,Encumbrance,Bludgeoning,Piercing,Slashing,Acid,Cold,Fire,Holy,Lightning,Unholy,Impact,FiendClaw,Ratka,DragonScales
Infernal,Boots,Boots,100,50,0,0,4,0,0,0,2,100,9,0.8,0.9,1,1.69,1.69,1.69,1.69,1.19,1.69,0.8,1,0,0
Dragon,Boots,Boots,100,100,0,0,4,0,0,3,0,200,10,0.9,1.01,1.12,1.85,1.85,1.85,1.85,1.36,1.85,0.9,0,0,4`;

      const result = parseArmorCsv(multiCsv);
      expect(result.Infernal.Boots.stats.FiendClaw).toBe(1);
      expect(result.Dragon.Boots.stats.DragonScales).toBe(4);
      expect(result.Dragon.Boots.stats.FiendClaw).toBe(0);
    });
  });

  describe('calculateRealStats', () => {
    const csvText = `Type,Slot,Name,Skill,Mastery,Cloth,Bone,Leather,Iron,Selentine,Theyril,Leenspar,Gold,Encumbrance,Bludgeoning,Piercing,Slashing,Acid,Cold,Fire,Holy,Lightning,Unholy,Impact,FiendClaw,Ratka,DragonScales
Bone,Head,Helmet,100,0,0,4,3,0,0,0,0,11,1.5,0.6,0.6,0.6,1.16,1.16,1.16,1.4,1.16,1.4,0.37,0,0,0
Bone,Arms,Vambraces,100,0,0,2,2,0,0,0,0,9,1.5,0.3,0.3,0.3,0.56,0.56,0.56,0.68,0.56,0.68,0.18,0,0,0
Bone,Chest,Breastplate,100,0,0,0,4,0,0,0,0,18,6,1.2,1.2,1.2,2.37,2.37,2.37,2.84,2.37,2.84,0.75,0,0,0
Leather,Chest,Cuirass,50,0,0,0,12,0,0,0,0,0,5.75,1.15,1.15,1.15,1.51,1.51,1.51,1.51,1.51,1.51,0.86,0,0,0
Leather,Arms,Armguards,50,0,0,0,3,0,0,0,0,0,1.5,0.3,0.3,0.3,0.38,0.38,0.38,0.38,0.38,0.8,0.22,0,0,0
Leather,Legs,Leggings,50,0,0,0,3,0,0,0,0,0,1.5,0.3,0.3,0.3,0.38,0.38,0.38,0.38,0.38,0.8,0.22,0,0,0`;

    const armorData = parseArmorCsv(csvText);

    it('should calculate stats for a gear set', () => {
      const parsedGear = {
        fixed: { head: 'Bone', chest: 'Leather', legs: 'Leather' },
        interchangeable: [{ type: 'Bone', count: 5 }],
        totalProtection: 5.44,
        encumbrance: 19.15
      };

      const result = calculateRealStats(parsedGear, armorData);
      expect(result).not.toBeNull();
      expect(result.slots).toHaveLength(4); // head, chest, legs, interchangeable group
      expect(result.slots[0].label).toBe('Head');
      expect(result.slots[0].encumbrance).toBe(1.5);
    });

    it('should multiply interchangeable stats by count', () => {
      const parsedGear = {
        fixed: { head: 'Bone', chest: 'Bone', legs: null },
        interchangeable: [{ type: 'Bone', count: 7 }],
        totalProtection: 5.0,
        encumbrance: 20.0
      };

      const result = calculateRealStats(parsedGear, armorData);
      const interchangeableSlot = result.slots.find(s => s.count === 7);
      expect(interchangeableSlot.encumbrance).toBe(1.5 * 7);
      expect(interchangeableSlot.stats.Bludgeoning).toBeCloseTo(0.3 * 7);
    });

    it('should compute correct totals', () => {
      const parsedGear = {
        fixed: { head: 'Bone', chest: 'Bone', legs: null },
        interchangeable: [],
        totalProtection: 3.0,
        encumbrance: 7.5
      };

      const result = calculateRealStats(parsedGear, armorData);
      // Head (1.5) + Chest (6)
      expect(result.totals.encumbrance).toBeCloseTo(7.5);
      // Head Bludgeoning (0.6) + Chest Bludgeoning (1.2)
      expect(result.totals.stats.Bludgeoning).toBeCloseTo(1.8);
    });

    it('should return null for null inputs', () => {
      expect(calculateRealStats(null, armorData)).toBeNull();
      expect(calculateRealStats({}, null)).toBeNull();
    });

    it('should gracefully skip fixed slots whose armor type is not in CSV', () => {
      const parsedGear = {
        fixed: { head: 'UnknownArmor', chest: 'Bone', legs: null },
        interchangeable: [],
        totalProtection: 1.0,
        encumbrance: 6.0
      };

      const result = calculateRealStats(parsedGear, armorData);
      // Head slot should be skipped (UnknownArmor not in CSV)
      expect(result.slots).toHaveLength(1); // only Chest
      expect(result.slots[0].label).toBe('Chest');
      expect(result.totals.encumbrance).toBeCloseTo(6.0);
    });

    it('should gracefully skip interchangeable groups whose armor type is not in CSV', () => {
      const parsedGear = {
        fixed: { head: 'Bone', chest: null, legs: null },
        interchangeable: [{ type: 'MissingType', count: 7 }],
        totalProtection: 1.0,
        encumbrance: 1.5
      };

      const result = calculateRealStats(parsedGear, armorData);
      // Only head should be present; MissingType interchangeable skipped
      expect(result.slots).toHaveLength(1);
      expect(result.slots[0].label).toBe('Head');
      expect(result.totals.encumbrance).toBeCloseTo(1.5);
    });

    it('should find interchangeable slot data via fallback when Arms is missing', () => {
      // CSV data where armor type has Elbows but not Arms
      const csvWithElbows = `Type,Slot,Name,Skill,Mastery,Cloth,Bone,Leather,Iron,Selentine,Theyril,Leenspar,Gold,Encumbrance,Bludgeoning,Piercing,Slashing,Acid,Cold,Fire,Holy,Lightning,Unholy,Impact,FiendClaw,Ratka,DragonScales
Plate,Elbows,Couters,75,0,0,0,4,8,0,0,0,40,8,0.52,0.58,0.65,1.3,1.3,1.3,1.3,0.99,1.3,0.65,0,0,0
Plate,Head,Helm,75,0,0,0,6,11,0,0,0,55,8,1.04,1.17,1.3,2.71,2.71,2.71,2.71,2,2.71,1.3,0,0,0`;

      const plateArmorData = parseArmorCsv(csvWithElbows);

      const parsedGear = {
        fixed: { head: 'Plate', chest: null, legs: null },
        interchangeable: [{ type: 'Plate', count: 3 }],
        totalProtection: 4.0,
        encumbrance: 32.0
      };

      const result = calculateRealStats(parsedGear, plateArmorData);
      expect(result.slots).toHaveLength(2); // head + interchangeable
      // Interchangeable should use Elbows data (fallback from Arms)
      const interSlot = result.slots.find(s => s.count === 3);
      expect(interSlot.encumbrance).toBe(8 * 3);
      expect(interSlot.stats.Bludgeoning).toBeCloseTo(0.52 * 3);
    });

    it('should handle multiple interchangeable groups', () => {
      const parsedGear = {
        fixed: { head: 'Bone', chest: 'Leather', legs: null },
        interchangeable: [
          { type: 'Bone', count: 3 },
          { type: 'Leather', count: 4 }
        ],
        totalProtection: 5.0,
        encumbrance: 20.0
      };

      const result = calculateRealStats(parsedGear, armorData);
      expect(result.slots).toHaveLength(4); // head, chest, bone x3, leather x4
      // Bone interchangeable: enc = 1.5 * 3 = 4.5
      const boneGroup = result.slots.find(s => s.label === 'Bone x3');
      expect(boneGroup.encumbrance).toBeCloseTo(4.5);
      // Leather interchangeable: enc = 1.5 * 4 = 6.0
      const leatherGroup = result.slots.find(s => s.label === 'Leather x4');
      expect(leatherGroup.encumbrance).toBeCloseTo(6.0);
    });
  });
});
