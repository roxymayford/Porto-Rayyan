import gsap from 'gsap';
import { pasteIn } from './paste-in';

export function initHeroIntro(): gsap.core.Timeline {
  const isSmall = typeof window !== 'undefined' && window.innerWidth < 640;
  const dropY = isSmall ? -120 : -320;
  const dropScale = isSmall ? 1.08 : 1.25;
  const polaroidX = isSmall ? 32 : 160;
  const stickerY = isSmall ? 60 : 120;

  const tl = gsap.timeline({ delay: 0.15 });

  tl.add(
    pasteIn('#cutout-block-1', {
      y: dropY,
      rotation: isSmall ? '+=12' : '+=28',
      scale: dropScale,
      opacity: 0,
      duration: 0.7,
      ease: 'back.out(1.3)',
    })
  )
    .add(
      pasteIn('#cutout-block-2', {
        y: dropY,
        rotation: isSmall ? '-=10' : '-=20',
        scale: dropScale,
        opacity: 0,
        duration: 0.7,
        ease: 'back.out(1.3)',
      }),
      '-=0.45'
    )
    .add(
      pasteIn('#cutout-block-3', {
        y: dropY,
        rotation: isSmall ? '+=10' : '+=24',
        scale: dropScale,
        opacity: 0,
        duration: 0.7,
        ease: 'back.out(1.3)',
      }),
      '-=0.45'
    )
    .add(
      pasteIn('#collage-hero .yt-glossy-badge', {
        scale: 0,
        rotation: '+=90',
        duration: 0.5,
        ease: 'back.out(2.2)',
      }),
      '-=0.2'
    )
    .add(
      pasteIn('#collage-hero .polaroid-yt-card', {
        x: polaroidX,
        y: isSmall ? 24 : 40,
        rotation: isSmall ? '+=8' : '+=16',
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      }),
      '-=0.6'
    )
    .add(
      pasteIn('#collage-hero .die-cut-sticker', {
        y: stickerY,
        rotation: isSmall ? '-=8' : '-=14',
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      }),
      '-=0.5'
    )
    .add(
      pasteIn('#collage-hero .mt-6 > *', {
        y: 24,
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out',
      }),
      '-=0.5'
    );

  return tl;
}
