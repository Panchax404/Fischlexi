import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['de', 'en'];
const defaultLocale = 'de';

// Map localized category names to internal routes
const categoryMap: Record<string, Record<string, string>> = {
  de: {
    fische: 'fish',
  },
  en: {
    fishes: 'fish',
  },
};

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore API routes, public files, _next, etc.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/supabase')
  ) {
    return NextResponse.next();
  }

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Redirect if there is no locale
    request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // Handle category rewrites (e.g. /de/fische/... -> /de/fish/...)
  const pathParts = pathname.split('/').filter(Boolean);
  if (pathParts.length >= 2) {
    const locale = pathParts[0];
    const category = pathParts[1];
    
    if (categoryMap[locale] && categoryMap[locale][category]) {
      const internalCategory = categoryMap[locale][category];
      const newPathname = `/${locale}/${internalCategory}/${pathParts.slice(2).join('/')}`;
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = newPathname;
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next).*)',
  ],
};
