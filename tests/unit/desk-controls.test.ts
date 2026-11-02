import { describe, it, expect } from 'vitest';
import {
  zoomLevels,
  getNextZoomIndex,
  getNextHeadlineMode,
} from '../../src/features/desk-controls';

describe('desk-controls logic', () => {
  it('cycles zoom index cleanly through all 3 zoom levels', () => {
    expect(zoomLevels).toHaveLength(3);
    expect(getNextZoomIndex(0)).toBe(1);
    expect(getNextZoomIndex(1)).toBe(2);
    expect(getNextZoomIndex(2)).toBe(0);
  });

  it('cycles headline modes cleanly across 3 modes', () => {
    expect(getNextHeadlineMode(0)).toBe(1);
    expect(getNextHeadlineMode(1)).toBe(2);
    expect(getNextHeadlineMode(2)).toBe(0);
  });
});
