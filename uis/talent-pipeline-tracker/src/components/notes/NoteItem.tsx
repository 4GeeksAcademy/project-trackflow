import Button from '../ui/Button';

export default function NoteItem({ note, onDelete }: {
  note: { id: number; content: string; created_at: string };
  onDelete: (id: number) => void;
}) {
  return (
    <div className="border rounded p-2 flex justify-between items-center">
      <div>
        <div className="text-sm">{note.content}</div>
        <div className="text-xs text-gray-500">{new Date(note.created_at).toLocaleString()}</div>
      </div>
      <Button type="button" onClick={() => {
        if (window.confirm('Delete this note?')) onDelete(note.id);
      }} className="bg-red-500 hover:bg-red-600 px-2 py-1 text-xs">Delete</Button>
    </div>
  );
}
