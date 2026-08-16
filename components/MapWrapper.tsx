'use client';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20 rounded-2xl border border-border/40">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <p className="text-muted-foreground animate-pulse">Karte wird geladen...</p>
    </div>
  ),
});

export default function MapWrapper() {
  return <Map />;
}
