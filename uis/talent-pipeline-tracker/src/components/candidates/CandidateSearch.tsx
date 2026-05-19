import { useState } from 'react';

export default function CandidateSearch({ value, onChange }: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [input, setInput] = useState(value);

  return (
    <input
      type="search"
      placeholder="Search by name or email"
      value={input}
      onChange={e => {
        setInput(e.target.value);
        onChange(e.target.value);
      }}
      className="border rounded px-2 py-1 w-full md:w-64"
    />
  );
}
