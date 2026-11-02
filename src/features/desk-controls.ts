import { playKeyClick } from '../lib/audio';
import { showTactileToast } from './toast';
import { resetDraggablePositions } from './draggable';

// --- Zoom Pill Control ---
export const zoomLevels = [
  { label: '1000', scale: 1 },
  { label: '0920', scale: 0.94 },
  { label: '1050', scale: 1.03 },
] as const;

export function getNextZoomIndex(current: number): number {
  return (current + 1) % zoomLevels.length;
}

let currentZoomIdx = 0;

export function cycleCanvasZoom(): void {
  playKeyClick(760);
  currentZoomIdx = getNextZoomIndex(currentZoomIdx);
  const z = zoomLevels[currentZoomIdx]!;
  const counterEl = document.getElementById('zoom-counter-value');
  const canvasEl = document.getElementById('studio-canvas');

  if (counterEl) {
    counterEl.textContent = z.label;
  }
  if (canvasEl) {
    const isNarrow = typeof window !== 'undefined' && window.innerWidth < 640;
    const effectiveScale = isNarrow && z.scale > 1 ? 1 : z.scale;
    canvasEl.style.transform = `scale(${effectiveScale})`;
  }
  showTactileToast(`Skala Kanvas Meja Potong: ${z.label}`);
}

// --- Headline Copy Cycle ---
export function getNextHeadlineMode(current: number): number {
  return (current + 1) % 3;
}

let headlineMode = 0;

export function toggleHeadlineCopy(): void {
  playKeyClick(740);
  headlineMode = getNextHeadlineMode(headlineMode);
  const t1 = document.getElementById('cutout-text-1');
  const t2 = document.getElementById('cutout-text-2');
  const t3 = document.getElementById('cutout-text-3');
  const label = document.getElementById('headline-mode-label');

  if (headlineMode === 0) {
    if (t1) t1.textContent = 'Creative';
    if (t2) t2.textContent = 'HR block';
    if (t3) t3.textContent = 'watchlist';
    if (label) label.textContent = 'HR + Creative Collage';
  } else if (headlineMode === 1) {
    if (t1) t1.textContent = 'Human';
    if (t2) t2.textContent = 'Resources';
    if (t3) t3.textContent = 'portfolio';
    if (label) label.textContent = 'Human Resources Focus';
  } else {
    if (t1) t1.textContent = 'Creative';
    if (t2) t2.textContent = 'block';
    if (t3) t3.textContent = 'watchlist';
    if (label) label.textContent = 'Original Design.md';
  }
}

// --- Retro Window Trio Controls ---
export type RetroAction = 'minimize' | 'maximize' | 'close';

export function retroControlAction(action: RetroAction): void {
  playKeyClick(600);
  const b1 = document.getElementById('cutout-block-1');
  const b2 = document.getElementById('cutout-block-2');
  const b3 = document.getElementById('cutout-block-3');
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  if (action === 'minimize') {
    if (b1) b1.style.transform = 'rotate(-4deg) scale(0.92)';
    if (b2) b2.style.transform = 'rotate(0deg) scale(0.92)';
    if (b3) b3.style.transform = 'rotate(2deg) scale(0.92)';
    showTactileToast('Kolase diperkecil sedikit (Minimize)');
  } else if (action === 'maximize') {
    const maxScale = isMobile ? 1.01 : 1.04;
    if (b1) b1.style.transform = `rotate(-10deg) scale(${maxScale})`;
    if (b2) b2.style.transform = `rotate(0deg) scale(${maxScale})`;
    if (b3) b3.style.transform = `rotate(4deg) scale(${maxScale})`;
    showTactileToast('Kolase diperbesar (Maximize)');
  } else if (action === 'close') {
    if (b1) b1.style.transform = 'rotate(-10deg)';
    if (b2) b2.style.transform = 'rotate(0deg)';
    if (b3) b3.style.transform = 'rotate(4deg)';
    resetDraggablePositions();
  }
}

// --- Tactile 3D X-Ray Switch ---
let xrayActive = false;

export function toggleXrayDeskMode(): void {
  playKeyClick(520);
  xrayActive = !xrayActive;
  const switchEl = document.getElementById('hero-tactile-switch');
  document.body.classList.toggle('xray-mode', xrayActive);

  if (switchEl) {
    switchEl.classList.toggle('active', xrayActive);
    switchEl.setAttribute('aria-checked', String(xrayActive));
  }
  showTactileToast(
    xrayActive ? 'Mode Garis Potong (Crop-Mark X-Ray): AKTIF' : 'Mode Garis Potong: NORMAL'
  );
}

export function initDeskControls(): void {
  const switchEl = document.getElementById('hero-tactile-switch');
  if (switchEl) {
    switchEl.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleXrayDeskMode();
      }
    });
  }
}
