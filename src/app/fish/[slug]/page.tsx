import React from 'react';
import { Fish } from '../../../../lib/types';
import Link from 'next/link';
import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import { ArrowLeftIcon, MapPinIcon, BeakerIcon, ScaleIcon, FireIcon, CubeIcon, ClockIcon } from '@heroicons/react/24/outline'; // Updated icons
import { clsx } from 'clsx'; // Assuming clsx is installed or available via lib/utils

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
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params: paramsProp }: FishDetailPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await paramsProp;
  const fish = await getFishData(params.slug);

  if (!fish) {
    return {
      title: 'Fisch nicht gefunden - Fischlexikon',
      description: 'Der gesuchte Fisch konnte leider nicht gefunden werden.',
    };
  }

  const metaDescriptionContent = fish.description_general && typeof fish.description_general === 'string'
    ? fish.description_general.substring(0, 150) + '...'
    : 'Erfahren Sie mehr über diesen faszinierenden Fisch.';

  return {
    title: `${fish.name} (${fish.latin_name}) - Fischlexikon`,
    description: metaDescriptionContent,
  };
}

const DetailRow = ({ label, value, icon }: { label: string, value: string | React.ReactNode, icon?: React.ReactNode }) => (
  <div className="flex items-start py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors px-2 rounded-lg">
    <div className="flex items-center w-32 min-w-[128px] shrink-0 text-sm font-medium text-muted-foreground mr-4">
      {icon && <span className="mr-2 text-primary">{icon}</span>}
      {label}
    </div>
    <div className="flex-1 text-sm font-semibold text-foreground break-words">{value}</div>
  </div>
);

const SectionCard = ({ title, content }: { title: string, content: string }) => {
  if (!content || content.includes("Keine")) return null;
  return (
    <section className="mb-8 p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-all">
      <h2 className="text-xl font-bold text-foreground mb-3 flex items-center">
        <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
        {title}
      </h2>
      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
        {content}
      </div>
    </section>
  );
};

export default async function FishDetailPage({ params: paramsProp, searchParams: searchParamsProp }: FishDetailPageProps) {
  const params = await paramsProp;
  const searchParams = await searchParamsProp;
  const fish = await getFishData(params.slug);

  if (!fish) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <h1 data-testid="fish-not-found" className="text-3xl font-bold text-foreground mb-4">Fisch nicht gefunden 🐡</h1>
        <p className="text-muted-foreground mb-8">
          Der gesuchte Fisch "{decodeURIComponent(params.slug)}" konnte nicht gefunden werden.
        </p>
        <Link href="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium">
          Zurück zur Suche
        </Link>
      </div>
    );
  }

  // Construct back link
  const queryBuilder = new URLSearchParams();
  for (const key in searchParams) {
    const value = searchParams[key];
    if (value !== undefined) {
      if (Array.isArray(value)) value.forEach(v => queryBuilder.append(key, v));
      else queryBuilder.append(key, value as string);
    }
  }
  const backToSearchHref = `/?${queryBuilder.toString()}`;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">

      {/* Navigation Header */}
      <div className="mb-8 pt-4">
        <Link
          href={backToSearchHref}
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Zurück zur Übersicht
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-8">

          {/* Header Section */}
          <div>
            <h1 data-testid="fish-detail-name" className="text-4xl md:text-5xl font-extrabold text-foreground mb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              {fish.name}
            </h1>
            <p className="text-xl md:text-2xl text-primary font-serif italic opacity-90">
              {fish.latin_name}
            </p>
          </div>

          {/* Mobile Image (shown only on small screens) */}
          <div className="lg:hidden rounded-2xl overflow-hidden shadow-xl aspect-video relative ring-1 ring-border/50">
            <Image
              src={fish.image_url_main || '/placeholder-fish.jpg'}
              alt={fish.name}
              fill
              sizes="(max-width: 1024px) 100vw, 800px"
              className="object-cover"
              priority
            />
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            <SectionCard title="Allgemeines & Aussehen" content={fish.description_general || ''} />
            <SectionCard title="Verhalten & Lebensraum" content={fish.description_habitat_details || fish.description_social_behavior || ''} />
            <SectionCard title="Pflege & Haltung" content={fish.description_care_aquarium || ''} />
            <SectionCard title="Zucht & Vermehrung" content={fish.description_breeding || ''} />
          </div>

        </div>

        {/* Sidebar / Steckbrief Column */}
        <aside className="lg:col-span-4 space-y-6">

          {/* Desktop Image (Sticky) */}
          <div className="hidden lg:block relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] ring-1 ring-border/50 hover:ring-primary/50 transition-all duration-500 group">
            <Image
              src={fish.image_url_main || '/placeholder-fish.jpg'}
              alt={fish.name}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <span className="inline-block px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-xs text-white border border-white/20">
                📸 {fish.name}
              </span>
            </div>
          </div>

          {/* Steckbrief Card */}
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-lg sticky top-24">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center uppercase tracking-wider text-xs">
              <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
              Steckbrief
            </h3>

            <div className="space-y-1">
              <DetailRow label="Latein" value={fish.latin_name || '-'} />
              <DetailRow label="Größe" icon={<ScaleIcon className="w-4 h-4" />} value={fish.size || '-'} />
              <DetailRow label="Temperatur" icon={<FireIcon className="w-4 h-4" />} value={fish.temperatur || '-'} />
              <DetailRow label="pH-Wert" icon={<BeakerIcon className="w-4 h-4" />} value={fish.phWert || '-'} />
              <DetailRow label="Wasserhärte" icon={<span className="text-xs">💧</span>} value={fish.hardness || '-'} />
              <DetailRow label="Aquarium" icon={<CubeIcon className="w-4 h-4" />} value={
                <div className="flex flex-col">
                  <span>{fish.min_tank_size || '-'}</span>
                  {fish.min_tank_length && <span className="text-xs text-muted-foreground">Kantenlänge: {fish.min_tank_length}</span>}
                </div>
              } />
              <DetailRow label="Lebenserwartung" icon={<ClockIcon className="w-4 h-4" />} value={fish.lifespan || '-'} />
              <DetailRow label="Herkunft" icon={<MapPinIcon className="w-4 h-4" />} value={fish.herkunft?.join(', ') || '-'} />
              <DetailRow label="Ernährung" icon={<span className="text-xs">🍽️</span>} value={fish.ernahrung?.join(', ') || '-'} />
              <DetailRow label="Haltung" icon={<span className="text-xs">🏠</span>} value={fish.haltung?.join(', ') || '-'} />
              <DetailRow label="Schwimmhöhe" icon={<span className="text-xs">↕️</span>} value={fish.schwimmhoehe?.join(', ') || '-'} />
              {fish.difficulty && <DetailRow label="Schwierigkeit" icon={<span className="text-xs">⭐</span>} value={fish.difficulty} />}
              {fish.common_names && <div className="pt-2 mt-2 border-t border-border/50">
                <span className="block text-xs font-medium text-muted-foreground mb-1">Andere Namen:</span>
                <span className="text-xs italic text-foreground/80">{fish.common_names}</span>
              </div>}
            </div>

            {/* Call to Action or extra badge */}
            <div className="mt-8 pt-6 border-t border-border/50 text-center">
              <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                🌊 Perfekt für dein Aquarium?
              </span>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}