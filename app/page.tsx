import Link from 'next/link';
import { site } from '@/config/site';
import { visibility } from '@/config/visibility';
import { getPosts, getProjects, getPublications } from '@/lib/content';
import NeuralCanvas from '@/components/NeuralCanvas';
import Reveal from '@/components/Reveal';
import Byline from '@/components/Byline';
import PostRow from '@/components/PostRow';
import SlugBand from '@/components/SlugBand';

export default async function Home() {
  const posts = await getPosts();
  const projects = await getProjects();
  const pubs = getPublications();
  const hero = posts.find((p) => p.featured) ?? posts[0];
  const trending = posts.filter((p) => p !== hero).slice(0, 3);
  const tags = [...new Set(posts.flatMap((p) => p.tags))].slice(0, 10);

  return (
    <>
      <header className="hero-lab">
        <NeuralCanvas seed="ahmed-yasser-lab" />
        <div className="hero-inner">
          <span className="hero-watermark" aria-hidden>LAB</span>
          <div className="kicker">AI research · builds · essays</div>
          <h1>
            AHMED<br />
            <span className="thin">YASSER◆</span>
          </h1>
          <p className="hero-lede">{site.bio}</p>
          <div className="hero-cta">
            <a className="btn solid" href="/blog">Read the stories</a>
            <a className="btn" href={site.github}>GitHub</a>
            <a className="btn" href={site.scholar}>Scholar</a>
            <a className="btn" href={site.cvPath}>CV ↓</a>
          </div>
          <div className="stats">
            <span><strong>{pubs.length}</strong>papers</span>
            <span><strong>{projects.length}</strong>builds</span>
            <span><strong>{posts.length}</strong>stories</span>
          </div>
        </div>
      </header>

      {hero && visibility.blog && (
        <Reveal>
          <div className="sec-head">
            <span className="sec-num">00</span>
            <span className="sec-title">Featured transmission</span>
            <Link className="sec-link" href={`/blog/${hero.slug}`}>Open →</Link>
          </div>
          <Link href={`/blog/${hero.slug}`} style={{ textDecoration: 'none' }}>
            <SlugBand seed={hero.slug} tall />
          </Link>
          <h2 className="sec" style={{ marginTop: 20 }}>
            <Link href={`/blog/${hero.slug}`} style={{ textDecoration: 'none' }}>{hero.title}</Link>
          </h2>
          <p className="sec-sub" style={{ fontSize: 17 }}>{hero.summary}</p>
          <Byline date={hero.date} mins={hero.mins} big />
        </Reveal>
      )}

      {trending.length > 0 && (
        <section className="trend">
          <div className="trend-head">◈ Trending in the lab</div>
          <div className="trend-grid">
            {trending.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <div className="trend-item">
                  <span className="trend-num">0{i + 1}</span>
                  <div>
                    <div className="meta">{p.mins} min read</div>
                    <h4>
                      <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                    </h4>
                    <div className="meta">{p.date}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <div className="m-cols">
        <div>
          <div className="sec-head">
            <span className="sec-num">01</span>
            <span className="sec-title">Latest stories</span>
            <Link className="sec-link" href="/blog">All →</Link>
          </div>
          {visibility.blog && posts.map((p, i) => <PostRow key={p.slug} p={p} index={i} />)}
        </div>
        <aside className="side">
          <div className="side-block">
            <h5>◈ The researcher</h5>
            <p className="side-bio">{site.bio}</p>
            <Link href="/about">Open dossier →</Link>
          </div>
          {visibility.projects && projects.length > 0 && (
            <div className="side-block">
              <h5>◈ Selected builds</h5>
              {projects.filter((x) => x.featured).slice(0, 3).map((pr) => (
                <div className="card" key={pr.slug}>
                  <h3 style={{ fontSize: 17 }}>{pr.title}</h3>
                  <p><small className="muted">{pr.summary}</small></p>
                </div>
              ))}
              <small><Link href="/projects">All builds →</Link></small>
            </div>
          )}
          {visibility.publications && pubs.length > 0 && (
            <div className="side-block">
              <h5>◈ Latest papers</h5>
              {pubs.slice(0, 3).map((p) => (
                <div className="card" key={p.title}>
                  <h3 style={{ fontSize: 16 }}>{p.title}</h3>
                  <div className="meta">{p.authors} · {p.venue} {p.year}</div>
                </div>
              ))}
              <small><Link href="/publications">All papers →</Link></small>
            </div>
          )}
          {tags.length > 0 && (
            <div className="side-block">
              <h5>◈ Frequencies</h5>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {tags.map((t) => (
                  <Link key={t} className="tag-pill" href="/blog">{t}</Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
