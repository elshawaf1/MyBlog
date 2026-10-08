import Link from 'next/link';
import { site } from '@/config/site';
import ProfilePhoto from '@/components/ProfilePhoto';
import Thumb from '@/components/Thumb';

export type RowPost = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  mins: number;
};

export default function PostRow({ p }: { p: RowPost }) {
  return (
    <div className="feed-row">
      <div className="txt">
        <div className="who-mini">
          <ProfilePhoto src={site.photo} alt={site.name} />
          <span>{site.name}</span>
        </div>
        <h3>
          <Link href={`/blog/${p.slug}`}>{p.title}</Link>
        </h3>
        <div className="excerpt">{p.summary}</div>
        <div className="feed-meta">
          <span>{p.date}</span>
          <span>·</span>
          <span>{p.mins} min read</span>
          {p.tags[0] && (
            <span className="tag-pill">{p.tags[0]}</span>
          )}
        </div>
      </div>
      <Thumb seed={p.slug} letter={p.title.charAt(0) || 'A'} />
    </div>
  );
}
