import { describe, it, expect } from 'vitest';
import {
  findOptimalGear,
  getAvailableEncumbrances,
  getEncumbranceRange,
  parseGearData,
  getArmorColorClass
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
      expect(getArmorColorClass('Wyvern')).toContain('text-white');
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
  });
});
