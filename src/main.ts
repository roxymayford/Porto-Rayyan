// Self-hosted fonts
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/plus-jakarta-sans/700-italic.css';
import '@fontsource/plus-jakarta-sans/800-italic.css';

import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/jetbrains-mono/500-italic.css';

// Styles
import './styles/main.css';

// GSAP
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Lib & Features
import { playKeyClick } from './lib/audio';
import { initGridCoordsTracker } from './features/grid-coords';
import { copyTextToClipboard } from './features/clipboard';
import { initDraggableCollage, resetDraggablePositions } from './features/draggable';
import {
  cycleCanvasZoom,
  initDeskControls,
  retroControlAction,
  toggleHeadlineCopy,
  toggleXrayDeskMode,
  type RetroAction
} from './features/desk-controls';
import { closeQuickJumpMenu, toggleQuickJumpMenu } from './features/quick-menu';
import { filterScrapbookExp, setOnFilterChangeHook } from './features/experience-filter';
import {
  closeWatchlistModal,
  initWatchlistModal,
  openWatchlistModal
} from './features/watchlist-modal';

// Motion
import { initHeroIntro } from './motion/hero-intro';
import { initCardReveal } from './motion/card-reveal';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Refresh ScrollTrigger when experience category changes
setOnFilterChangeHook(() => {
  ScrollTrigger.refresh();
});

type Action =
  | 'toggle-menu'
  | 'reset-desk'
  | 'cycle-zoom'
  | 'cycle-headline'
  | 'retro'
  | 'toggle-xray'
  | 'filter-exp'
  | 'open-modal'
  | 'close-modal'
  | 'close-modal-backdrop'
  | 'copy'
  | 'click-sound';

const handlers: Record<Action, (el: HTMLElement, e: MouseEvent) => void> = {
  'toggle-menu': () => {
    toggleQuickJumpMenu();
  },
  'reset-desk': () => {
    resetDraggablePositions();
    closeQuickJumpMenu();
  },
  'cycle-zoom': () => {
    cycleCanvasZoom();
  },
  'cycle-headline': () => {
    toggleHeadlineCopy();
  },
  'retro': (el) => {
    const action = (el.dataset.value ?? 'minimize') as RetroAction;
    retroControlAction(action);
  },
  'toggle-xray': () => {
    toggleXrayDeskMode();
  },
  'filter-exp': (el) => {
    const cat = el.dataset.value ?? 'all';
    filterScrapbookExp(cat);
  },
  'open-modal': (el) => {
    const type = el.dataset.value ?? 'olaf';
    openWatchlistModal(type, el);
  },
  'close-modal': () => {
    closeWatchlistModal();
  },
  'close-modal-backdrop': (el, e) => {
    if (e.target === el) {
      closeWatchlistModal();
    }
  },
  'copy': (el) => {
    const text = el.dataset.value ?? '';
    if (text) {
      void copyTextToClipboard(text);
    }
  },
  'click-sound': () => {
    playKeyClick();
  }
};

// Event delegation for all [data-action] elements
document.addEventListener('click', (e: MouseEvent) => {
  const target = e.target as HTMLElement | null;
  if (!target) return;

  const actionEl = target.closest<HTMLElement>('[data-action]');
  if (!actionEl) return;

  const action = actionEl.dataset.action as Action | undefined;
  if (action && action in handlers) {
    handlers[action](actionEl, e);
  }
});

function loadMatScene(): void {
  const initScene = () => {
    import('./motion/mat-scene')
      .then((m) => m.initMatScene())
      .catch((err) => console.error('Failed to load mat-scene:', err));
  };

  if ('requestIdleCallback' in window) {
    (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(initScene);
  } else {
    setTimeout(initScene, 200);
  }
}

// Initialize features on DOM ready
function init(): void {
  initDraggableCollage();
  initGridCoordsTracker();
  initWatchlistModal();
  initDeskControls();

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    initHeroIntro();
    initCardReveal();
  }
  loadMatScene();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
