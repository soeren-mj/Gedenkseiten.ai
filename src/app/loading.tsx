export default function Loading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-foreground-interactiv-accents-orange"></div>
        <p className="mt-4 text-foreground-secondary">Laden...</p>
      </div>
    </div>
  );
} 