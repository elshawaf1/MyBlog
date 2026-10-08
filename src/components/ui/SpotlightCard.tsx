'use client';

import { useRef, useState } from 'react';

/** Glass card with mouse-tracking spotlight + top glow line. */
export default function SpotlightCard({
  children,
  className = '',
  spotlight = true,
}: {
  children: React.ReactNode;
  className?: string;
  spotlight?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -300, y: -300, on: false });

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        if (!spotlight || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top, on: true });
      }}
      onMouseLeave={() => setPos((p) => ({ ...p, on: false }))}
      className={`relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.08] to-white/[0.02] shadow-card hover:shadow-card-hover hover:border-white/10 hover:-translate-y-1 transition-all duration-200 ease-out ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      {spotlight && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
          style={{
            opacity: pos.on ? 1 : 0,
            background: `radial-gradient(300px circle at ${pos.x}px ${pos.y}px, rgba(94,106,210,0.15), transparent 70%)`,
          }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
