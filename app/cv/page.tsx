import { site } from '@/config/site';

export default function CV() {
  return (
    <>
      <h2>CV</h2>
      <p>Replace <code>public/cv.pdf</code> with your real CV, then this button works.</p>
      <p><a className="btn solid" href={site.cvPath}>Download CV (PDF)</a></p>
    </>
  );
}
