'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon, MapPinIcon } from '@heroicons/react/24/outline';
import type { Fish, FilterState } from '../lib/types';

type FishCardProps = {
  fish: Fish;
  lang: string;
  activeFilters?: FilterState;
  searchQueryFromCaller?: string;
};

// Helper: safe join
const safeJoin = (arr: string[] | undefined, limit = 2) => {
  if (!arr || arr.length === 0) return 'Unbekannt';
  if (arr.length <= limit) return arr.join(', ');
  return arr.slice(0, limit).join(', ') + '...';
};

const FishCard: React.FC<FishCardProps> = ({ fish, lang, activeFilters, searchQueryFromCaller }) => {
  const query = searchQueryFromCaller ? `?${searchQueryFromCaller}` : '';
  const detailPageHref = `/${lang}/fish/${fish.slug}${query}`;

  // Helper to determine if a filter is active
  const isFilterActive = (key: keyof FilterState) => {
    return activeFilters && activeFilters[key] !== undefined;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Link href={detailPageHref} className="block group h-full" data-testid="fish-card-link">
        <div data-testid="fish-card" className="h-full flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 relative">

          <div className="h-44 bg-muted relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
            {fish.image_url_main ? (
              <img src={fish.image_url_main} alt={fish.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground text-4xl">
                🐠
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Contextual Badges (e.g. Origin matches) could go here */}
          </div>

          <div className="p-5 flex flex-col flex-grow">
            <div className="mb-3">
              <h3 data-testid="fish-name" className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1" title={fish.name}>
                {fish.name}
              </h3>
              <p className="text-sm text-muted-foreground italic font-medium line-clamp-1">{fish.latin_name}</p>
            </div>

            {/* Badges/Tags - Clean Look with Conditional Highlights */}
            <div className="flex flex-wrap gap-2 mb-4">
              {/* Size Badge */}
              {fish.size && (
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 border border-blue-200 dark:border-blue-900">
                  📏 {fish.size}
                </span>
              )}

              {/* Temp Badge - Highlight if filtered */}
              {fish.temperatur && (
                <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full border transition-colors
                  ${isFilterActive('temperatur')
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm ring-1 ring-primary/50'
                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200 border-orange-200 dark:border-orange-900'
                  }`}>
                  🌡️ {fish.temperatur}
                </span>
              )}

              {/* pH Badge - Highlight if filtered */}
              {fish.phWert && (
                <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full border transition-colors
                  ${isFilterActive('phWert')
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm ring-1 ring-primary/50'
                    : 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200 border-teal-200 dark:border-teal-900'
                  }`}>
                  💧 {fish.phWert}
                </span>
              )}

              {/* Hardness Badge - Show only if filtered or available, Highlight if filtered */}
              {(isFilterActive('hardness') && fish.hardness) && (
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-primary text-primary-foreground border border-primary shadow-sm ring-1 ring-primary/50">
                  🪨 {fish.hardness}
                </span>
              )}
              {/* Show hardness standard if not filtered? User asked to make filtered values visible. 
                   If not filtered, maybe we don't show it to keep card clean, OR we show it neutral. 
                   Let's stick to "If Filtered -> Highlight/Show". If not filtered, maybe hide to save space unless standard logic applies.
                   For now: Only extra show if filtered.
               */}

              {/* Aquarium Size - Show if filtered */}
              {(isFilterActive('liters') && fish.min_tank_size) && (
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-primary text-primary-foreground border border-primary shadow-sm ring-1 ring-primary/50">
                  🛁 {fish.min_tank_size}
                </span>
              )}

              {/* Edge Length - Show if filtered */}
              {(isFilterActive('length') && fish.min_tank_length) && (
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-primary text-primary-foreground border border-primary shadow-sm ring-1 ring-primary/50">
                  📏 {fish.min_tank_length}
                </span>
              )}

            </div>

            {/* Detailed Info Grid */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-4 text-xs text-muted-foreground">
              <div className="col-span-2 flex items-start">
                <MapPinIcon className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                <span className={`truncate ${isFilterActive('herkunft') ? 'text-primary font-bold' : ''}`} title={safeJoin(fish.herkunft, 5)}>
                  {safeJoin(fish.herkunft)}
                </span>
              </div>
              <div className="col-span-2 flex items-start">
                <span className="mr-1">🍽️</span>
                <span className={`truncate ${isFilterActive('ernahrung') ? 'text-primary font-bold' : ''}`} title={safeJoin(fish.ernahrung, 5)}>
                  {safeJoin(fish.ernahrung)}
                </span>
              </div>
              <div className="col-span-2 flex items-start">
                <span className="mr-1">🏠</span>
                <span className={`truncate ${isFilterActive('haltung') ? 'text-primary font-bold' : ''}`}>
                  {safeJoin(fish.haltung)}
                </span>
              </div>
              {isFilterActive('schwimmhoehe') && (
                <div className="col-span-2 flex items-start">
                  <span className="mr-1">🌊</span>
                  <span className="text-primary font-bold truncate">
                    {safeJoin(fish.schwimmhoehe)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-auto pt-3 border-t border-border flex justify-between items-center">
              <span className="text-xs font-semibold text-primary/80 group-hover:text-primary tracking-wide uppercase">Mehr Infos & Details</span>
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <ArrowRightIcon className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default FishCard;