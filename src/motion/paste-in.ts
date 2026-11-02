import gsap from 'gsap';

export function pasteIn(
  targets: gsap.DOMTarget,
  vars: gsap.TweenVars,
  extra: gsap.TweenVars = {}
): gsap.core.Tween {
  const elements = gsap.utils.toArray<HTMLElement>(targets);
  const originalStyles = elements.map((el) => ({
    transform: el.style.transform,
    transition: el.style.transition,
  }));

  elements.forEach((el) => {
    el.style.transition = 'none';
    el.classList.remove('pre-paste');
  });

  return gsap.from(elements, {
    ...vars,
    ...extra,
    onComplete() {
      elements.forEach((el, i) => {
        gsap.set(el, { clearProps: 'transform,opacity' });
        const saved = originalStyles[i];
        if (saved) {
          el.style.transform = saved.transform;
          el.style.transition = saved.transition;
        }
      });
      if (typeof vars.onComplete === 'function') {
        vars.onComplete();
      }
    },
  });
}
