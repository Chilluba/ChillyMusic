// mobile/src/utils/__tests__/simpleMath.test.ts
import { add, subtract } from '../simpleMath';

describe('simpleMath', () => {
  describe('add', () => {
    it('should return the sum of two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('should return the sum when one number is negative', () => {
      expect(add(-1, 5)).toBe(4);
    });

    it('should return the sum of two negative numbers', () => {
      expect(add(-2, -3)).toBe(-5);
    });

    it('should return zero when adding a number and its negation', () => {
      expect(add(-1, 1)).toBe(0);
      expect(add(5, -5)).toBe(0);
    });

    it('should handle adding zero', () => {
      expect(add(5, 0)).toBe(5);
      expect(add(0, 5)).toBe(5);
      expect(add(0, 0)).toBe(0);
    });
  });

  describe('subtract', () => {
    it('should return the difference of two positive numbers', () => {
      expect(subtract(5, 3)).toBe(2);
    });

    it('should return the difference when subtracting a larger number from a smaller one', () => {
      expect(subtract(3, 5)).toBe(-2);
    });

    it('should return the difference when one number is negative', () => {
      expect(subtract(-1, 5)).toBe(-6);
      expect(subtract(5, -1)).toBe(6);
    });

    it('should return the difference of two negative numbers', () => {
      expect(subtract(-2, -3)).toBe(1);
      expect(subtract(-3, -2)).toBe(-1);
    });

    it('should handle subtracting zero', () => {
      expect(subtract(5, 0)).toBe(5);
      expect(subtract(0, 5)).toBe(-5);
      expect(subtract(0, 0)).toBe(0);
    });
  });
});
