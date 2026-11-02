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
import { filterScrapbookExp } from './features/experience-filter';
import {
  closeWatchlistModal,
  initWatchlistModal,
  openWatchlistModal
} from './features/watchlist-modal';

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

// Initialize features on DOM ready
function init(): void {
  initDraggableCollage();
  initGridCoordsTracker();
  initWatchlistModal();
  initDeskControls();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
