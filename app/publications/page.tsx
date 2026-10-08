import { getPublications } from '@/lib/content';
import PubFilter from '@/components/PubFilter';

export default function Publications() {
  const pubs = getPublications();
  return (
    <div className="narrow">
      <div className="kicker" style={{ marginTop: 56 }}>04 / Index</div>
      <h2 className="sec" style={{ marginTop: 0 }}>Published signals</h2>
      <p className="sec-sub">Papers and preprints — search, filter, copy BibTeX.</p>
      <PubFilter pubs={pubs} />
    </div>
  );
}
