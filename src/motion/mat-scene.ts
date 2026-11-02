import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
  AmbientLight,
  DirectionalLight,
  MathUtils
} from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface NetworkInformationLike {
  saveData?: boolean;
}

export function initMatScene(): (() => void) | undefined {
  const cv = document.getElementById('mat-3d') as HTMLCanvasElement | null;
  if (!cv) return;

  // Respect Data Saver mode on mobile devices
  const nav = navigator as Navigator & { connection?: NetworkInformationLike };
  if (nav.connection?.saveData) {
    cv.remove();
    return;
  }

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
  } catch {
    cv.remove();
    return;
  }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene = new Scene();
  const cam = new PerspectiveCamera(40, 1, 0.1, 60);
  cam.position.z = 14;

  // Modern Three.js physically correct lighting adjustment (~pi multiplier)
  scene.add(new AmbientLight(0xffffff, 0.75 * Math.PI));
  const sun = new DirectionalLight(0xffffff, 0.9 * Math.PI);
  sun.position.set(-4, 6, 8);
  scene.add(sun);

  // Dark/mid tones only so text remains legible
  const mats = [0x5c3a21, 0x5c3a21, 0xb8a818, 0xb5252a].map(
    (c) => new MeshStandardMaterial({ color: c, roughness: 0.9 })
  );
  const geo = new BoxGeometry(1, 1, 0.04);
  const R = (a: number, b: number) => a + Math.random() * (b - a);

  let scraps: Mesh[] = [];
  let visH = 1;
  let span = 0;
  let lastWidth = innerWidth;

  function build(intro: boolean): void {
    scraps.forEach((m) => scene.remove(m));
    scraps = [];

    const pages = Math.max(1, document.documentElement.scrollHeight / innerHeight);
    const visW = visH * cam.aspect;
    span = (pages - 1) * visH * 0.45;
    const mobileViewport = innerWidth < 768;
    const maxScraps = mobileViewport ? 28 : 60;
    const density = mobileViewport ? 5 : 11;
    const n = Math.min(maxScraps, Math.round(density * pages));

    // Scale down 3D paper trimmings proportionally on narrower screens so they don't appear oversized
    const sizeScale = mobileViewport ? Math.max(0.32, Math.min(0.55, innerWidth / 1050)) : 1;

    for (let i = 0; i < n; i++) {
      const mat = mats[Math.floor(Math.random() * mats.length)]!;
      const m = new Mesh(geo, mat);
      const w = R(0.5, 1.5) * sizeScale;
      const h = R(0.4, 1.1) * sizeScale;
      m.scale.set(w, h, 1);
      m.position.set(
        R(-0.55, 0.55) * visW,
        R(visH * 0.7, -(span + visH * 0.7)),
        R(-5, -0.5)
      );
      m.rotation.set(R(0, 6.28), R(0, 6.28), R(0, 6.28));
      m.userData = { vx: R(-0.25, 0.25), vy: R(-0.25, 0.25), vz: R(-0.2, 0.2) };
      scene.add(m);
      scraps.push(m);

      if (intro && !reduce) {
        gsap.from(m.scale, {
          x: 0,
          y: 0,
          duration: 0.9,
          delay: R(0.3, 1.4),
          ease: 'back.out(2)'
        });
      }
    }
  }

  function size(intro: boolean, rebuildScene = true): void {
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(innerWidth, innerHeight, false);
    cam.aspect = innerWidth / innerHeight;
    cam.updateProjectionMatrix();
    visH = 2 * Math.tan(MathUtils.degToRad(cam.fov / 2)) * cam.position.z;
    if (rebuildScene) {
      build(intro);
    }
  }

  size(true, true);

  let rt: ReturnType<typeof setTimeout> | null = null;
  const onResize = () => {
    if (rt !== null) clearTimeout(rt);
    rt = setTimeout(() => {
      const widthChanged = Math.abs(innerWidth - lastWidth) >= 2;
      lastWidth = innerWidth;
      size(false, widthChanged);
    }, 200);
  };
  window.addEventListener('resize', onResize);

  if (reduce) {
    renderer.render(scene, cam);
    return () => {
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geo.dispose();
      mats.forEach((m) => m.dispose());
    };
  }

  const camY = gsap.quickTo(cam.position, 'y', { duration: 0.7, ease: 'power3.out' });
  const camX = gsap.quickTo(cam.position, 'x', { duration: 1.2, ease: 'power3.out' });

  const scrollTriggerInstance = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => camY(-self.progress * span)
  });

  const onPointerMove = (e: MouseEvent) => {
    camX(((e.clientX / innerWidth) - 0.5) * -1.2);
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  const ticker = (_time: number, dtMs: number) => {
    const dt = Math.min(dtMs, 50) / 1000;
    for (const m of scraps) {
      const u = m.userData as { vx: number; vy: number; vz: number };
      m.rotation.x += u.vx * dt;
      m.rotation.y += u.vy * dt;
      m.rotation.z += u.vz * dt;
    }
    renderer.render(scene, cam);
  };

  gsap.ticker.add(ticker);

  // Pause ticker when tab is hidden to save battery/resources
  const onVisibilityChange = () => {
    if (document.hidden) {
      gsap.ticker.remove(ticker);
    } else {
      gsap.ticker.add(ticker);
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    gsap.ticker.remove(ticker);
    scrollTriggerInstance.kill();
    renderer.dispose();
    geo.dispose();
    mats.forEach((m) => m.dispose());
  };
}
