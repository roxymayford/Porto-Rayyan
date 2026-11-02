import { describe, it, expect } from 'vitest';
import { calculateGridCoords } from '../../src/features/grid-coords';

describe('calculateGridCoords', () => {
  it('calculates correct 3-digit grid coordinates', () => {
    expect(calculateGridCoords(0, 0, 0)).toEqual({ gridX: '000', gridY: '000' });
    expect(calculateGridCoords(48, 96, 0)).toEqual({ gridX: '001', gridY: '002' });
  });

  it('correctly accounts for window.scrollY', () => {
    expect(calculateGridCoords(96, 12, 180)).toEqual({ gridX: '002', gridY: '004' });
    expect(calculateGridCoords(480, 240, 240)).toEqual({ gridX: '010', gridY: '010' });
  });
});
