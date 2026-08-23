'use client';

import { useEffect } from 'react';

export default function SearchSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook für Sentry/OTel. Der Digest korreliert Client-Report und Serverlog.
    console.error('[segment-error]', { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <div
      role="alert"
      data-testid="segment-error"
      className="text-center py-20 bg-card border border-border rounded-3xl shadow-sm"
    >
      <span className="text-6xl mb-4 block">🌊</span>
      <h2 className="text-xl font-bold text-foreground mb-2">
        Die Suche ist gerade abgetaucht
      </h2>
      <p className="text-base text-muted-foreground mb-6">
        Wir konnten die Ergebnisse nicht laden. Header und Navigation bleiben nutzbar.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium"
        >
          Erneut versuchen
        </button>
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-muted-foreground/70">
          Referenz: <code>{error.digest}</code>
        </p>
      )}
    </div>
  );
}
