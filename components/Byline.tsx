import { site } from '@/config/site';
import ProfilePhoto from '@/components/ProfilePhoto';

export default function Byline({ date, mins, big }: { date: string; mins: number; big?: boolean }) {
  return (
    <div className="byline">
      <ProfilePhoto src={site.photo} alt={site.name} />
      <div className="who">
        <b>{site.name}</b>
        <div className="sub">{date} · {mins} min read</div>
      </div>
      {!big && (
        <a className="follow-btn ghost" href={`mailto:${site.email}`}>
          Follow
        </a>
      )}
    </div>
  );
}
