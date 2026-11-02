import { playKeyClick } from '../lib/audio';

export function toggleQuickJumpMenu(): void {
  playKeyClick(700);
  const menu = document.getElementById('quick-jump-menu');
  const trigger = document.getElementById('floating-back-btn');
  if (!menu) return;

  const isHidden = menu.classList.toggle('hidden');
  if (trigger) {
    trigger.setAttribute('aria-expanded', String(!isHidden));
  }
}

export function closeQuickJumpMenu(): void {
  const menu = document.getElementById('quick-jump-menu');
  const trigger = document.getElementById('floating-back-btn');
  if (menu && !menu.classList.contains('hidden')) {
    menu.classList.add('hidden');
  }
  if (trigger) {
    trigger.setAttribute('aria-expanded', 'false');
  }
}
