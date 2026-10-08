'use client';

import { useEffect, useRef } from 'react';

// Generative particle constellation. Pauses off-screen / hidden tab,
// renders a static gradient when reduced-motion is preferred. Zero deps.
export default function NeuralCanvas({ seed = 'lab' }: { seed?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let seedN = 0;
    for (let i = 0; i < seed.length; i++) seedN = (seedN * 31 + seed.charCodeAt(i)) >>> 0;
    const rand = () => {
      seedN = (seedN * 1664525 + 1013904223) >>> 0;
      return seedN / 0xffffffff;
    };

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let pts: P[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(1, Math.floor(rect.width * dpr));
      h = Math.max(1, Math.floor(rect.height * dpr));
      canvas.width = w;
      canvas.height = h;
      const n = Math.min(90, Math.floor((rect.width * rect.height) / 14000));
      pts = Array.from({ length: n }, () => ({
        x: rand() * w,
        y: rand() * h,
        vx: (rand() - 0.5) * 0.35 * dpr,
        vy: (rand() - 0.5) * 0.35 * dpr,
        r: (0.8 + rand() * 1.6) * dpr,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      // depth orbs
      const g1 = ctx.createRadialGradient(w * 0.8, h * 0.15, 0, w * 0.8, h * 0.15, w * 0.5);
      g1.addColorStop(0, 'rgba(122,108,255,0.20)');
      g1.addColorStop(1, 'rgba(122,108,255,0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);
      const g2 = ctx.createRadialGradient(w * 0.12, h * 0.9, 0, w * 0.12, h * 0.9, w * 0.45);
      g2.addColorStop(0, 'rgba(125,240,192,0.10)');
      g2.addColorStop(1, 'rgba(125,240,192,0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      const dark = document.documentElement.dataset.theme !== 'light';
      const dot = dark ? '125,240,192' : '26,137,23';
      const line = dark ? '122,108,255' : '26,137,23';
      const max = w * 0.09;

      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.hypot(dx, dy);
          if (d < max) {
            ctx.strokeStyle = `rgba(${line},${(1 - d / max) * 0.35})`;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        const pulse = 0.55 + 0.45 * Math.sin(t / 900 + p.x / 60);
        ctx.fillStyle = `rgba(${dot},${0.5 * pulse + 0.2})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (t: number) => {
      if (!running) return;
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);

    if (reduced) {
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (reduced) return;
        if (e.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(loop);
        } else if (!e.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const onVis = () => {
      if (reduced) return;
      if (document.hidden && running) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!document.hidden && !running) {
        const r = canvas.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) {
          running = true;
          raf = requestAnimationFrame(loop);
        }
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
      io.disconnect();
    };
  }, [seed]);

  return <canvas ref={ref} className="neural" aria-hidden />;
}
