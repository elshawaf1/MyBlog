'use client';

import { useMemo, useState } from 'react';
import { Bold, Italic, Strikethrough, Highlighter, Link2, ImagePlus, Table, ListChecks, Code2, Eye, PenLine } from 'lucide-react';

function wrap(value: string, selStart: number, selEnd: number, before: string, after = ''): { text: string; start: number; end: number } {
  const sel = value.slice(selStart, selEnd) || 'text';
  const text = value.slice(0, selStart) + before + sel + after + value.slice(selEnd);
  const start = selStart + before.length;
  return { text, start, end: start + sel.length };
}

/** Markdown-first editor: toolbar + edit/preview tabs. Files stay portable Markdown. */
export default function MarkdownEditor({
  value,
  onChange,
  previewHtml,
}: {
  value: string;
  onChange: (v: string) => void;
  previewHtml: (md: string) => string;
}) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [area, setArea] = useState<HTMLTextAreaElement | null>(null);

  const apply = (fn: (v: string, s: number, e: number) => { text: string; start: number; end: number }) => {
    if (!area) return;
    const { text, start, end } = fn(value, area.selectionStart, area.selectionEnd);
    onChange(text);
    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(start, end);
    });
  };

  const tools: { icon: React.ReactNode; label: string; fn: () => void }[] = [
    { icon: <Bold size={15} />, label: 'Bold', fn: () => apply((v, s, e) => wrap(v, s, e, '**', '**')) },
    { icon: <Italic size={15} />, label: 'Italic', fn: () => apply((v, s, e) => wrap(v, s, e, '*', '*')) },
    { icon: <Strikethrough size={15} />, label: 'Strikethrough', fn: () => apply((v, s, e) => wrap(v, s, e, '~~', '~~')) },
    { icon: <Highlighter size={15} />, label: 'Highlight', fn: () => apply((v, s, e) => wrap(v, s, e, '==', '==')) },
    { icon: <Link2 size={15} />, label: 'Link', fn: () => apply((v, s, e) => wrap(v, s, e, '[', '](https://)')) },
    { icon: <ImagePlus size={15} />, label: 'Image', fn: () => apply((v, s, e) => wrap(v, s, e, '![', '](images/)')) },
    { icon: <Table size={15} />, label: 'Table', fn: () => apply((v, s, e) => wrap(v, s, e, '\n| A | B |\n|---|---|\n| 1 | 2 |\n', '')) },
    { icon: <ListChecks size={15} />, label: 'Task list', fn: () => apply((v, s, e) => wrap(v, s, e, '\n- [ ] ', '')) },
    { icon: <Code2 size={15} />, label: 'Code block', fn: () => apply((v, s, e) => wrap(v, s, e, '\n```\n', '\n```\n')) },
  ];

  const html = useMemo(() => (tab === 'preview' ? previewHtml(value) : ''), [tab, value, previewHtml]);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-base-input">
      <div className="flex flex-wrap items-center gap-1 border-b border-white/[0.06] p-2">
        {tools.map((t) => (
          <button key={t.label} title={t.label} onClick={t.fn} className="rounded-lg p-2 text-ink-muted hover:bg-white/[0.06] hover:text-ink transition-all duration-200">
            {t.icon}
          </button>
        ))}
        <div className="ml-auto flex gap-1">
          <button onClick={() => setTab('write')} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs ${tab === 'write' ? 'bg-white/[0.08] text-ink' : 'text-ink-muted hover:text-ink'}`}>
            <PenLine size={13} /> Write
          </button>
          <button onClick={() => setTab('preview')} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs ${tab === 'preview' ? 'bg-white/[0.08] text-ink' : 'text-ink-muted hover:text-ink'}`}>
            <Eye size={13} /> Preview
          </button>
        </div>
      </div>
      {tab === 'write' ? (
        <>
          <textarea
            ref={setArea}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={18}
            spellCheck={false}
            placeholder="Write in Markdown… link notes with [[slug]]."
            className="w-full bg-transparent p-5 font-mono text-sm leading-relaxed text-gray-100 placeholder:text-gray-600 focus:outline-none"
          />
          <div className="border-t border-white/[0.06] px-5 py-2 font-mono text-[11px] text-ink-subtle">
            MARKDOWN · [[slug]] LINKS NOTES · ==highlight== · $math$ · ```code
          </div>
        </>
      ) : (
        <div className="prose-vault max-h-[560px] overflow-y-auto p-5" dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </div>
  );
}
