export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-4 px-4 py-8 sm:px-6">
      <div className="h-8 w-48 rounded-lg bg-line" />
      <div className="h-24 rounded-xl bg-line/70" />
      <div className="h-36 rounded-xl bg-line/50" />
      <div className="h-36 rounded-xl bg-line/50" />
    </div>
  );
}
