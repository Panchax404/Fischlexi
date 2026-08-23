'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="de">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '4rem 1rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Unerwarteter Fehler
        </h1>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          Die Anwendung konnte nicht geladen werden.
        </p>
        <button
          onClick={reset}
          style={{ padding: '0.75rem 1.5rem', borderRadius: 9999, border: '1px solid #cbd5e1', cursor: 'pointer' }}
        >
          Neu laden
        </button>
        {error.digest && (
          <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            Referenz: {error.digest}
          </p>
        )}
      </body>
    </html>
  );
}
