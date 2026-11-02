import { describe, it, expect } from 'vitest';
import { matchExperienceCard } from '../../src/features/experience-filter';

describe('experience-filter matching logic', () => {
  it('returns true for all filter regardless of card category', () => {
    expect(matchExperienceCard('hr-lead', 'all')).toBe(true);
    expect(matchExperienceCard('event', 'all')).toBe(true);
    expect(matchExperienceCard('admin', 'all')).toBe(true);
    expect(matchExperienceCard(null, 'all')).toBe(true);
  });

  it('matches matching category exactly', () => {
    expect(matchExperienceCard('hr-lead', 'hr-lead')).toBe(true);
    expect(matchExperienceCard('event', 'hr-lead')).toBe(false);
    expect(matchExperienceCard('admin', 'admin')).toBe(true);
    expect(matchExperienceCard('event', 'admin')).toBe(false);
  });
});
