import React from 'react';
import { Fish } from '../../../../lib/types'; // Pfad anpassen
import Link from 'next/link';
import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image'; // Für optimierte Bilder
import { ArrowLeftIcon } from '@heroicons/react/24/solid'; // Optional

type DescriptionSection = {
  title: string;
  content: string | null; // Erlaube null, falls content optional ist oder leer sein kann
};
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function getFishData(slugParam: string): Promise<Fish | null> {
  try {
    const absoluteApiUrl = `${APP_BASE_URL}/api/fish/details/${encodeURIComponent(slugParam)}`;
    const res = await fetch(absoluteApiUrl, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`[getFishData] Error for slug "${slugParam}":`, error);
    return null;
  }
}

type FishDetailPageProps = {
  // Die Props 'params' und 'searchParams' sind jetzt Promises, die aufgelöst werden müssen
  params: { slug: string }; // Typ für die Struktur nach dem Await
  searchParams: { [key: string]: string | string[] | undefined }; // Typ für die Struktur nach dem Await
};

export async function generateMetadata(
  { params: paramsProp }: FishDetailPageProps, // paramsProp ist das Promise
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await paramsProp; // PARAMS AUFLÖSEN
  const slug = params.slug;
  console.log(`[generateMetadata] Awaited slug: ${slug}`);
  const fish = await getFishData(slug);

  if (!fish) {
    return {
      title: 'Fisch nicht gefunden - Fischlexikon',
      description: 'Der gesuchte Fisch konnte leider nicht gefunden werden.', // Sicherer Fallback
    };
  }

  // Sicherer Zugriff auf description_general
  const metaDescriptionContent = fish.description_general && typeof fish.description_general === 'string'
    ? fish.description_general.substring(0, 100) + '...'
    : 'Erfahren Sie mehr über diesen faszinierenden Fisch.'; // Allgemeiner Fallback

  const pageTitle = fish.name && fish.latin_name
    ? `${fish.name} (${fish.latin_name}) - Fischlexikon`
    : (fish.name ? `${fish.name} - Fischlexikon` : 'Fischdetails - Fischlexikon');

  return {
    title: pageTitle,
    description: `Alle Informationen über den ${fish.name || 'diesen Fisch'}: Lebensraum, Haltung, Ernährung, Größe und mehr. ${metaDescriptionContent}`,
    openGraph: {
      title: pageTitle, // Verwende den gleichen Titel
      description: metaDescriptionContent, // Verwende den gleichen sicheren Beschreibungsinhalt
      // images: [ /* ... */ ],
      type: 'article',
    },
  };
}


// Komponente für die Detail-Eigenschaften-Tabelle
const FishDetailTable: React.FC<{ fish: Fish }> = ({ fish }) => (
  <div className="bg-gray-50 p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold text-gray-700 mb-3">Steckbrief</h3>
    <table className="w-full text-sm">
      <tbody className="divide-y divide-gray-200">
        <tr className="hover:bg-gray-100">
          <td className="py-2 px-1 font-medium text-gray-600">Lateinischer Name</td>
          <td className="py-2 px-1 text-gray-800 italic">{fish.latin_name || 'N/A'}</td>
        </tr>
        <tr className="hover:bg-gray-100">
          <td className="py-2 px-1 font-medium text-gray-600">Habitat</td>
          <td className="py-2 px-1 text-gray-800">{fish.habitat || 'N/A'}</td>
        </tr>
        <tr className="hover:bg-gray-100">
          <td className="py-2 px-1 font-medium text-gray-600">Herkunft</td>
          {/* KORREKTUR HIER: .join(', ') anwenden */}
          <td className="py-2 px-1 text-gray-800">
            {(Array.isArray(fish.herkunft) && fish.herkunft.length > 0)
              ? fish.herkunft.join(', ')
              : 'N/A'}
          </td>
        </tr>
        <tr className="hover:bg-gray-100">
          <td className="py-2 px-1 font-medium text-gray-600">Größe</td>
          <td className="py-2 px-1 text-gray-800">{fish.size || 'N/A'}</td>
        </tr>
        <tr className="hover:bg-gray-100">
          <td className="py-2 px-1 font-medium text-gray-600">Haltung</td>
          {/* KORREKTUR HIER: .join(', ') anwenden */}
          <td className="py-2 px-1 text-gray-800">
            {(Array.isArray(fish.haltung) && fish.haltung.length > 0)
              ? fish.haltung.join(', ')
              : 'N/A'}
          </td>
        </tr>
        <tr className="hover:bg-gray-100">
          <td className="py-2 px-1 font-medium text-gray-600">Ernährung</td>
          {/* KORREKTUR HIER: .join(', ') anwenden */}
          <td className="py-2 px-1 text-gray-800">
            {(Array.isArray(fish.ernahrung) && fish.ernahrung.length > 0)
              ? fish.ernahrung.join(', ')
              : 'N/A'}
          </td>
        </tr>
        <tr className="hover:bg-gray-100">
          <td className="py-2 px-1 font-medium text-gray-600">Temperatur</td>
          <td className="py-2 px-1 text-gray-800">{fish.temperatur || 'N/A'}</td>
        </tr>
        <tr className="hover:bg-gray-100">
          <td className="py-2 px-1 font-medium text-gray-600">Schwimmhöhe</td>
          {/* KORREKTUR HIER: .join(', ') anwenden */}
          <td className="py-2 px-1 text-gray-800">
            {(Array.isArray(fish.schwimmhoehe) && fish.schwimmhoehe.length > 0)
              ? fish.schwimmhoehe.join(', ')
              : 'N/A'}
          </td>
        </tr>
        {/* Füge hier weitere relevante Felder hinzu, falls vorhanden, z.B. Schwierigkeitsgrad */}
        {fish.difficulty && (
            <tr className="hover:bg-gray-100">
            <td className="py-2 px-1 font-medium text-gray-600">Schwierigkeit</td>
            <td className="py-2 px-1 text-gray-800">{fish.difficulty}</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);


export default async function FishDetailPage({ params: paramsProp, searchParams: searchParamsProp }: FishDetailPageProps) {
  const params = await paramsProp; // PARAMS AUFLÖSEN
  const fishSlug = params.slug;
  console.log(`[FishDetailPage] Awaited fishSlug: ${fishSlug}`);

  const searchParams = await searchParamsProp;
  console.log(`[FishDetailPage] Awaited searchParams:`, searchParams);
  const fish = await getFishData(fishSlug);

  if (!fish) {
    return (
      <div className="text-center py-10 max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-700 mb-4">Fisch nicht gefunden</h1>
        <p className="text-gray-500">
          Der gesuchte Fisch "{decodeURIComponent(fishSlug)}" konnte nicht gefunden werden.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Zurück zur Suche
        </Link>
      </div>
    );
  }

  const descriptionSections: DescriptionSection[] = [ // Typ hier explizit setzen
    {
      title: "Allgemeines & Aussehen",
      content: fish.description_general || "Keine allgemeine Beschreibung verfügbar."
    },
    {
      title: "Verhalten & Lebensraum im Detail",
      content: fish.description_habitat_details || fish.description_social_behavior || "Keine detaillierten Informationen zu Verhalten und Lebensraum verfügbar."
    },
    {
      title: "Pflege & Haltung im Aquarium",
      content: fish.description_care_aquarium || "Keine spezifischen Pflegehinweise für das Aquarium verfügbar."
    },
    {
      title: "Zucht & Fortpflanzung",
      content: fish.description_breeding || "Keine Informationen zur Zucht verfügbar."
    },
  ];

  // ... (ggf. aquariumCareSection, feedingNotesSection) ...

  const finalDescriptionSections: DescriptionSection[] = descriptionSections.filter( // Typ auch hier für das Ergebnis des Filters
    section => section.content && // Stelle sicher, dass content nicht null oder leer ist
               section.content !== "Keine allgemeine Beschreibung verfügbar." &&
               section.content !== "Keine detaillierten Informationen zu Verhalten und Lebensraum verfügbar." &&
               section.content !== "Keine spezifischen Pflegehinweise für das Aquarium verfügbar." &&
               section.content !== "Keine Informationen zur Zucht verfügbar."
  );

  const queryBuilder = new URLSearchParams();
  // Iteriere über die aufgelösten searchParams
  for (const key in searchParams) {
    if (Object.prototype.hasOwnProperty.call(searchParams, key)) {
      const value = searchParams[key];
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => queryBuilder.append(key, v));
        } else {
          queryBuilder.append(key, value as string);
        }
      }
    }
  }
  const backToSearchQueryString = queryBuilder.toString();
  const backToSearchHref = `/${backToSearchQueryString ? `?${backToSearchQueryString}` : ''}`;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="lg:flex lg:gap-8">
        <div className="lg:w-2/3 prose prose-blue max-w-none dark:prose-invert">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <h1 className="text-3xl md:text-4xl font-bold !text-blue-700 !no-underline">
              {fish.name}
            </h1>
            <Link
              href={backToSearchHref} // Verwende den konstruierten Href
              className="mt-2 sm:mt-0 sm:ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors no-underline"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1.5" />
              Zurück zur Suche
            </Link>
          </div>
          <p className="text-lg text-gray-500 italic lead !mt-0">
            {fish.latin_name}
          </p>

          <div className="lg:hidden mb-6">
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={fish.image_url_main || `https://source.unsplash.com/random/800x450/?${encodeURIComponent(fish.name || 'fish')},fish,underwater`}
                alt={`Bild von ${fish.name || 'Fisch'}`}
                fill
                style={{ objectFit: 'cover' }}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          </div>

          {finalDescriptionSections.map((section, index) => (
            <section key={index} className="mb-6">
              <h2 className="text-2xl font-semibold !text-gray-800 !no-underline">{section.title}</h2>
              <p className="text-gray-700 leading-relaxed">{section.content}</p>
            </section>
          ))}
        </div>

        <aside className="lg:w-1/3 mt-8 lg:mt-0">
          {/* Dieser Div wird sticky. KEINE max-h und kein overflow-y-auto hier. */}
          <div className="lg:sticky lg:top-24 space-y-6"> {/* Passe lg:top-24 an deine Headerhöhe an */}
            
            {/* Bild */}
            <div className="hidden lg:block rounded-lg overflow-hidden shadow-lg 
                            max-h-[30vh] sm:max-h-[40vh] md:max-h-[350px] lg:max-h-[400px] xl:max-h-[450px] {/* Optionale max. Bildhöhe */}
                            "> 
              <Image
                src={fish.image_url_main || `https://source.unsplash.com/random/600x400/?${encodeURIComponent(fish.name || 'fish')},fish,underwater`}
                alt={`Bild von ${fish.name || 'Fisch'}`}
                width={600} // Basisbreite
                height={400} // Basishöhe für Seitenverhältnis
                className="w-full h-full object-cover" // Wichtig: h-full, damit es den max-h Container füllt
                priority
              />
            </div>

            <FishDetailTable fish={fish} />
          </div>
        </aside>
      </div>
    </div>
  );
}