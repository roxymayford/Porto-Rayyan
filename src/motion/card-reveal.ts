import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { pasteIn } from './paste-in';

export function initCardReveal(): void {
  const cards = gsap.utils.toArray<HTMLElement>('.exp-scrap-card');
  cards.forEach((c) => c.classList.add('pre-paste'));

  ScrollTrigger.batch(cards, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) =>
      pasteIn(batch, {
        y: 60,
        scale: 1.07,
        rotation: '+=4',
        opacity: 0,
        duration: 0.55,
        ease: 'power3.out',
        stagger: 0.12,
      }),
  });
}
