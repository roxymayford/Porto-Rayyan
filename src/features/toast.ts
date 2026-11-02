let toastTimer: ReturnType<typeof setTimeout> | null = null;

export function showTactileToast(msg: string): void {
  const toast = document.getElementById('tactile-toast');
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.remove('hidden');

  if (toastTimer !== null) {
    clearTimeout(toastTimer);
  }
  toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
    toastTimer = null;
  }, 2400);
}
