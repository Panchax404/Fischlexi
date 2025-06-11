// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import React from 'react';
import Link from 'next/link'; // Importiere Link
//import './styles/rc-slider-overrides.css'; 

export const metadata: Metadata = {
  title: 'Fischlexikon',
  description: 'Das große Nachschlagewerk für Fische.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-gray-100 font-sans text-gray-800 flex flex-col">
        <header className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link href="/" className="text-blue-700 hover:text-blue-800 transition-colors"> {/* Link hinzugefügt */}
                <h1 className="text-3xl font-bold">Fischlexikon</h1>
              </Link>
              <p className="text-gray-600 text-sm mt-1">Das große Nachschlagewerk für Fische.</p>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
          {children}
        </main>
        <footer className="text-center text-gray-500 text-xs py-6 mt-auto">
          © {new Date().getFullYear()} Fischlexikon
        </footer>
      </body>
    </html>
  );
}