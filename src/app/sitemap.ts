import { MetadataRoute } from 'next';
import { getSupabasePublic } from '../../lib/supabaseClient';

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${APP_BASE_URL}/de`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: {
          de: `${APP_BASE_URL}/de`,
          en: `${APP_BASE_URL}/en`,
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
          de: `${APP_BASE_URL}/de`,
          en: `${APP_BASE_URL}/en`,
        },
      },
    },
    {
      url: `${APP_BASE_URL}/de/karte`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          de: `${APP_BASE_URL}/de/karte`,
          en: `${APP_BASE_URL}/en/karte`,
        },
      },
    },
    {
      url: `${APP_BASE_URL}/en/karte`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          de: `${APP_BASE_URL}/de/karte`,
          en: `${APP_BASE_URL}/en/karte`,
        },
      },
    },
  ];

  try {
    const supabase = getSupabasePublic();
    const { data: fishTranslations, error } = await supabase
      .from('fish_translations')
      .select('slug, language_code, updated_at, fish!inner(is_published)')
      .eq('fish.is_published', true);

    if (error || !fishTranslations) {
      console.error('[sitemap] Failed to fetch fish translations:', error);
      return staticRoutes;
    }

    const dynamicRoutes: MetadataRoute.Sitemap = fishTranslations.map((item: any) => {
      const lang = item.language_code || 'de';
      const altLang = lang === 'de' ? 'en' : 'de';
      return {
        url: `${APP_BASE_URL}/${lang}/fish/${item.slug}`,
        lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: {
          languages: {
            [lang]: `${APP_BASE_URL}/${lang}/fish/${item.slug}`,
            [altLang]: `${APP_BASE_URL}/${altLang}/fish/${item.slug}`,
          },
        },
      };
    });

    return [...staticRoutes, ...dynamicRoutes];
  } catch (err) {
    console.error('[sitemap] Unexpected error generating dynamic routes:', err);
    return staticRoutes;
  }
}
