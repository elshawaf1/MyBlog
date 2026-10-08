import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const STYLES: Record<Variant, string> = {
  primary:
    'bg-accent hover:bg-accent-bright text-white shadow-cta active:scale-[0.98] transition-all duration-200 ease-out',
  secondary:
    'bg-surface hover:bg-surface-hover text-ink shadow-inner border border-white/[0.06] hover:border-white/10 active:scale-[0.98] transition-all duration-200 ease-out',
  ghost: 'bg-transparent text-ink-muted hover:bg-surface hover:text-ink transition-all duration-200 ease-out',
  danger:
    'bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20 active:scale-[0.98] transition-all duration-200 ease-out',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export default function Button({ variant = 'secondary', className = '', ...rest }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${STYLES[variant]} ${className}`}
      {...rest}
    />
  );
}
