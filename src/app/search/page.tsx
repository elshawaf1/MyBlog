import { listPublicNotes } from '@/lib/vault/content';
import { toCardNote } from '@/lib/vault/types';
import SearchPage from '@/components/blog/SearchPage';

export default async function Search() {
  const notes = await listPublicNotes();
  return <SearchPage notes={notes.map(toCardNote)} />;
}
