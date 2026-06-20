import { MetadataRoute } from 'next';

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://fischlexi.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${APP_BASE_URL}/de`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: {
          'de': `${APP_BASE_URL}/de`,
          'en': `${APP_BASE_URL}/en`,
        },
      },
    },
    {
      url: `${APP_BASE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: {
          'de': `${APP_BASE_URL}/de`,
          'en': `${APP_BASE_URL}/en`,
        },
      },
    },
  ];

  // Note: For a production app, we would query the `fish_translations` table here
  // to dynamically generate the sitemap for all localized fish URLs and pair them.
  // E.g. /de/fische/clownfisch <-> /en/fishes/clownfish

  return routes;
}
