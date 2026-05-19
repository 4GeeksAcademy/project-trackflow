import NoteItem from './NoteItem';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';

export default function NotesList({ notes, loading, onDelete }: {
  notes: { id: number; content: string; created_at: string }[];
  loading: boolean;
  onDelete: (id: number) => void;
}) {
  if (loading) return <Spinner />;
  if (!notes.length) return <EmptyState message="No notes yet." />;
  return (
    <div className="space-y-2">
      {notes.map(note => (
        <NoteItem key={note.id} note={note} onDelete={onDelete} />
      ))}
    </div>
  );
}
