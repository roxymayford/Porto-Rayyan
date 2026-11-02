import { playKeyClick } from '../lib/audio';
import { showTactileToast } from './toast';
import { closeQuickJumpMenu } from './quick-menu';

interface DragPosition {
  dx: number;
  dy: number;
}

const dragPositions = new WeakMap<HTMLElement, DragPosition>();

export function initDraggableCollage(): void {
  const draggables = document.querySelectorAll<HTMLElement>('.draggable-cutout');

  draggables.forEach((el) => {
    dragPositions.set(el, { dx: 0, dy: 0 });

    let startX = 0;
    let startY = 0;
    let initialDx = 0;
    let initialDy = 0;
    let isDragging = false;

    el.addEventListener('pointerdown', (e: PointerEvent) => {
      if (e.pointerType === 'touch') return; // let phones scroll
      const target = e.target as HTMLElement | null;
      if (target?.closest('button') || target?.closest('a')) return;

      isDragging = true;
      el.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;

      const currentPos = dragPositions.get(el) ?? { dx: 0, dy: 0 };
      initialDx = currentPos.dx;
      initialDy = currentPos.dy;

      playKeyClick(480);
    });

    el.addEventListener('pointermove', (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = initialDx + (e.clientX - startX);
      const dy = initialDy + (e.clientY - startY);

      dragPositions.set(el, { dx, dy });
      // Use CSS translate property so Tailwind/inline rotation is never overwritten (§7 #1)
      el.style.translate = `${dx}px ${dy}px`;
    });

    const endDrag = (): void => {
      isDragging = false;
    };

    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
  });
}

export function resetDraggablePositions(): void {
  playKeyClick(820);
  const draggables = document.querySelectorAll<HTMLElement>('.draggable-cutout');
  draggables.forEach((el) => {
    dragPositions.set(el, { dx: 0, dy: 0 });
    el.style.translate = '';
  });
  closeQuickJumpMenu();
  showTactileToast('Meja potong dirapikan kembali!');
}
