import gsap from 'gsap';
import { pasteIn } from './paste-in';

export function initHeroIntro(): gsap.core.Timeline {
  const tl = gsap.timeline({ delay: 0.15 });

  tl.add(
    pasteIn('#cutout-block-1', {
      y: -320,
      rotation: '+=28',
      scale: 1.25,
      opacity: 0,
      duration: 0.7,
      ease: 'back.out(1.3)',
    })
  )
    .add(
      pasteIn('#cutout-block-2', {
        y: -320,
        rotation: '-=20',
        scale: 1.25,
        opacity: 0,
        duration: 0.7,
        ease: 'back.out(1.3)',
      }),
      '-=0.45'
    )
    .add(
      pasteIn('#cutout-block-3', {
        y: -320,
        rotation: '+=24',
        scale: 1.25,
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
        x: 160,
        y: 40,
        rotation: '+=16',
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      }),
      '-=0.6'
    )
    .add(
      pasteIn('#collage-hero .die-cut-sticker', {
        y: 120,
        rotation: '-=14',
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
