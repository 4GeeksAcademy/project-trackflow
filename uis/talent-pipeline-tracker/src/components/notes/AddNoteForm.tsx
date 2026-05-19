import { useState } from 'react';
import Button from '../ui/Button';

export default function AddNoteForm({ onAdd, loading }: {
  onAdd: (content: string) => Promise<void>;
  loading: boolean;
}) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!content.trim()) {
      setError('Note cannot be empty.');
      return;
    }
    try {
      await onAdd(content.trim());
      setContent('');
    } catch (e) {
      if (e instanceof Error) setError(e.message || 'Failed to add note');
      else setError('Failed to add note');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        type="text"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Add interview note..."
        className="border rounded px-2 py-1 flex-1"
        disabled={loading}
      />
      <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Note'}</Button>
      {error && <div className="text-red-600 text-xs ml-2">{error}</div>}
    </form>
  );
}
