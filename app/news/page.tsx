import { getNews } from '@/lib/content';

export default function News() {
  const news = getNews();
  return (
    <>
      <h2>News</h2>
      <p><small className="muted">Edit <code>content/news.json</code>. Set <code>"published": false</code> to hide.</small></p>
      <ul className="clean">
        {news.map((n, i) => (
          <li key={i}><span className="meta">{n.date} — </span>{n.text}</li>
        ))}
      </ul>
    </>
  );
}
