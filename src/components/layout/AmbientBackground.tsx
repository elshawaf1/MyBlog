/** Fixed 4-layer ambient background: base gradient + blobs + grid + noise. */
export default function AmbientBackground() {
  return (
    <div className="scene" aria-hidden>
      <div
        className="blob animate-float"
        style={{
          top: '-10%',
          left: '50%',
          width: 900,
          height: 1400,
          transform: 'translateX(-50%)',
          background: 'rgba(94,106,210,0.25)',
        }}
      />
      <div
        className="blob animate-float-slow"
        style={{
          top: '20%',
          left: '-10%',
          width: 600,
          height: 800,
          background: 'rgba(168,85,247,0.15)',
        }}
      />
      <div
        className="blob animate-float-slow"
        style={{
          top: '35%',
          right: '-8%',
          width: 500,
          height: 700,
          background: 'rgba(59,130,246,0.12)',
          animationDelay: '-4s',
        }}
      />
      <div
        className="blob animate-pulse"
        style={{
          bottom: '-5%',
          left: '30%',
          width: 700,
          height: 400,
          background: 'rgba(94,106,210,0.10)',
          animationDuration: '8s',
        }}
      />
      <div className="scene-grid" />
      <div className="scene-noise" />
    </div>
  );
}
