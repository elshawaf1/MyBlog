import Link from 'next/link';
import { site } from '@/config/site';
import ProfilePhoto from '@/components/ProfilePhoto';
import SlugBand from '@/components/SlugBand';
import Reveal from '@/components/Reveal';

export type RowPost = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  mins: number;
};

export default function PostRow({ p, index }: { p: RowPost; index: number }) {
  return (
    <Reveal delay={Math.min(index, 5) * 60}>
      <Link href={`/blog/${p.slug}`} className="feed-row" style={{ textDecoration: 'none' }}>
        <div className="txt">
          <div className="who-mini">
            <ProfilePhoto src={site.photo} alt={site.name} />
            <span>{site.name}</span>
            <span>·</span>
            <span>{p.date}</span>
          </div>
          <h3>{p.title}</h3>
          <div className="excerpt">{p.summary}</div>
          <div className="feed-meta">
            <span>{p.mins} min read</span>
            {p.tags[0] && <span className="tag-pill">{p.tags[0]}</span>}
            <span className="feed-arrow">→</span>
          </div>
        </div>
        <SlugBand seed={p.slug} />
      </Link>
    </Reveal>
  );
}
