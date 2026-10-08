import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const BASE =
  'w-full rounded-lg border border-white/10 bg-base-input px-3.5 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none transition-all duration-200';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${BASE} ${props.className ?? ''}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${BASE} ${props.className ?? ''}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${BASE} ${props.className ?? ''}`} />;
}
