import { getPublications } from '@/lib/content';
import PubFilter from '@/components/PubFilter';

export default function Publications() {
  const pubs = getPublications();
  return (
    <>
      <h2>Publications</h2>
      <PubFilter pubs={pubs} />
    </>
  );
}
