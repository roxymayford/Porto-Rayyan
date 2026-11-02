import { playKeyClick } from '../lib/audio';
import { showTactileToast } from './toast';

export async function copyTextToClipboard(text: string): Promise<void> {
  playKeyClick(800);
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
    } else {
      const tempInput = document.createElement('textarea');
      tempInput.value = text;
      tempInput.style.position = 'fixed';
      tempInput.style.opacity = '0';
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
    }
    showTactileToast(`Tersalin: ${text}`);
  } catch {
    showTactileToast(`Gagal menyalin: ${text}`);
  }
}
