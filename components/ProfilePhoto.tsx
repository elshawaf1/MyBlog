'use client';

export default function ProfilePhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      className="profile"
      src={src}
      alt={alt}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}
