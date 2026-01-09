import { describe, it, expect } from 'vitest';
import { calculateRetirementPlan } from './index';

describe('RetirementPlan', () => {
  it('should throw if receive less than 9 parameters', (): void => {
    expect(() => calculateRetirementPlan(20, 65, 20, 3000, 50000, 5, 2, -1)).toThrowError();
  });

  it('shoud throw if actual age is smaller than retirement age', (): void => {
    expect(() => calculateRetirementPlan(70, 65, 20, 3000, 50000, 5, 2, -1, 1)).toThrowError();
  });

  it('rates must be in percentage', (): void => {
    expect(() => calculateRetirementPlan(30, 65, 20, 3000, 50000, 10, 4, 8, 12)).not.toThrowError();
  });

  it('shoud return an object', (): void => {
    expect(calculateRetirementPlan(30, 65, 20, 3000, 50000, 5, 2, -1, 1)).toBeInstanceOf(Object);
  });
});