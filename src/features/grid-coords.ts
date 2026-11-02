export function calculateGridCoords(
  clientX: number,
  clientY: number,
  scrollY = 0
): { gridX: string; gridY: string } {
  const gridX = String(Math.floor(clientX / 48)).padStart(3, '0');
  const gridY = String(Math.floor((clientY + scrollY) / 48)).padStart(3, '0');
  return { gridX, gridY };
}

export function initGridCoordsTracker(): void {
  const coordEl = document.getElementById('live-grid-coords');
  if (!coordEl) return;

  window.addEventListener(
    'mousemove',
    (e: MouseEvent) => {
      const { gridX, gridY } = calculateGridCoords(e.clientX, e.clientY, window.scrollY);
      coordEl.textContent = `GRID X:${gridX} Y:${gridY}`;
    },
    { passive: true }
  );
}
