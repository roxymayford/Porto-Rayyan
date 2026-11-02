import { playKeyClick } from '../lib/audio';

export type ModalKey = 'olaf' | 'peace';

interface ModalContent {
  tag: string;
  title: string;
  bodyHtml: string;
}

const MODAL_DATA: Record<ModalKey, ModalContent> = {
  olaf: {
    tag: 'EPISODE 01 • KETUA PELAKSANA OLAF 2026',
    title: '"Perfect Imperfection": Memimpin 49 Panitia Lintas 7 Divisi Selama 5 Bulan',
    bodyHtml:
      'Melalui prinsip <strong>Right Person on the Right Place</strong>, penetapan <strong>SMART Goals</strong> sejak hari pertama, serta evaluasi rutin lewat rapat mingguan dan sesi <strong>1-on-1</strong>, OLAF 2026 ditargetkan terlaksana tepat waktu pada 2 Desember 2026 dan menjangkau <strong>100% HIMA/Ormawa se-FKS Universitas Telkom</strong>.',
  },
  peace: {
    tag: 'EPISODE 02 • WAKIL KETUA PELAKSANA PEACE 2026',
    title: 'Roadshow Tel-U Karawang: Meningkatkan +10% Rekrutmen Kepanitiaan',
    bodyHtml:
      'Berhasil merekrut mahasiswa Karawang dan <strong>meningkatkan 10% jumlah anggota kepanitiaan</strong>, menyusun Timeline 4 bulan untuk setiap divisi, serta menguatkan <em>internal bonding</em> agar seluruh anggota bekerja maksimal.',
  },
};

let previousActiveElement: HTMLElement | null = null;

export function openWatchlistModal(type: ModalKey | string = 'olaf', triggerEl?: HTMLElement): void {
  playKeyClick(880);
  const modal = document.getElementById('watchlist-modal');
  const epTag = document.getElementById('modal-episode-tag');
  const heading = document.getElementById('modal-Main-Heading');
  const desc = document.getElementById('modal-description');

  if (!modal) return;

  const key: ModalKey = type === 'peace' ? 'peace' : 'olaf';
  const data = MODAL_DATA[key];

  if (epTag) epTag.textContent = data.tag;
  if (heading) heading.textContent = data.title;
  if (desc) desc.innerHTML = data.bodyHtml;

  if (triggerEl) {
    previousActiveElement = triggerEl;
  } else if (document.activeElement instanceof HTMLElement) {
    previousActiveElement = document.activeElement;
  }

  modal.classList.remove('hidden');

  // Focus management: move focus into the close button or first focusable element
  const closeBtn = modal.querySelector<HTMLElement>('button[data-action="close-modal"]');
  if (closeBtn) {
    closeBtn.focus();
  }
}

export function closeWatchlistModal(): void {
  const modal = document.getElementById('watchlist-modal');
  if (!modal || modal.classList.contains('hidden')) return;

  playKeyClick(440);
  modal.classList.add('hidden');

  // Restore focus to triggering element
  if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
    previousActiveElement.focus();
    previousActiveElement = null;
  }
}

export function initWatchlistModal(): void {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeWatchlistModal();
    }
  });
}
