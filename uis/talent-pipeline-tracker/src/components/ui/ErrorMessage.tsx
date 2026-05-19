export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-sm">
      {message}
    </div>
  );
}
