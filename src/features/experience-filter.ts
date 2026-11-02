import { playKeyClick } from '../lib/audio';

export type ExperienceCategory = 'all' | 'hr-lead' | 'event' | 'admin';

let onFilterChangeHook: (() => void) | null = null;

export function setOnFilterChangeHook(fn: () => void): void {
  onFilterChangeHook = fn;
}

export const registerFilterChangeCallback = setOnFilterChangeHook;

export function matchExperienceCard(cardCat: string | null, filterCat: string): boolean {
  return filterCat === 'all' || cardCat === filterCat;
}

export function filterScrapbookExp(cat: ExperienceCategory | string): void {
  playKeyClick(640);
  const cards = document.querySelectorAll<HTMLElement>('.exp-scrap-card');
  const btns = document.querySelectorAll<HTMLElement>('.scrap-filter-btn');

  btns.forEach((btn) => {
    const isActive = btn.getAttribute('data-filter') === cat;
    btn.setAttribute('aria-selected', String(isActive));
    if (isActive) {
      btn.classList.remove('paper-cutout-white');
      btn.classList.add('paper-cutout-yellow');
    } else {
      btn.classList.remove('paper-cutout-yellow');
      btn.classList.add('paper-cutout-white');
    }
  });

  cards.forEach((card) => {
    const cardCat = card.getAttribute('data-exp-cat');
    if (matchExperienceCard(cardCat, cat)) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });

  if (onFilterChangeHook) {
    onFilterChangeHook();
  }
}
