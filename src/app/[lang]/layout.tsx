import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import '../globals.css';
import { ThemeProvider } from '../../../components/ThemeProvider';
import { ThemeSwitcher } from '../../../components/ThemeSwitcher';
import { LanguageSwitcher } from '../../../components/LanguageSwitcher';
import Link from 'next/link';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Fischlexikon',
  description: 'Dein modernes Nachschlagewerk für die Aquaristik.',
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <html lang={lang} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${outfit.variable} font-sans min-h-screen bg-background text-foreground antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem themes={['light', 'dark']}>

          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <Link href={`/${lang}`} className="flex items-center space-x-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                  Fischlexi
                </span>
              </Link>

              <div className="flex items-center space-x-4">
                <Link 
                  href={`/${lang}/karte`} 
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                >
                  Karte
                </Link>
                <LanguageSwitcher />
                <ThemeSwitcher />
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            {children}
          </main>

          <footer className="border-t border-border mt-20 py-10 bg-muted/30">
            <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} Fischlexi. Designed with Oceanic Elegance.
            </div>
          </footer>

        </ThemeProvider>
      </body>
    </html>
  );
}