import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
    >
      &larr; Back
    </button>
  );
}
