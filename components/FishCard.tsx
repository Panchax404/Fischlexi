'use client';

import React from 'react';
import { Fish } from '../lib/types'; // Pfad zu deinem Fish-Typ anpassen
import Link from 'next/link';
import { InformationCircleIcon } from '@heroicons/react/24/outline'; // Optionales Icon

type FishCardProps = {
  fish: Fish;
  searchQueryFromCaller?: string; // Neuer Prop
};

// Hilfsfunktion zum Kürzen von Array-basierten Infos für die Karte
const getShortInfo = (items: string[], maxLength: number = 2): string => {
  if (items.length === 0) return 'N/A';
  if (items.length <= maxLength) return items.join(', ');
  return `${items.slice(0, maxLength).join(', ')}, ...`;
};

const FishCard: React.FC<FishCardProps> = ({ fish, searchQueryFromCaller }) => {
  const slug = fish.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const detailPageHref = `/fish/${slug}${searchQueryFromCaller ? `?${searchQueryFromCaller}` : ''}`;

  return (
     <Link href={detailPageHref} className="block group h-full">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col group-hover:shadow-xl transition-shadow duration-300">
        {/* Optional: Bild des Fisches - für mehr Platz auf der Karte ggf. weglassen oder kleiner machen */}
        {/* <img src={`https://placeholder.com/300x150?text=${encodeURIComponent(fish.name)}`} alt={fish.name} className="w-full h-32 sm:h-40 object-cover" /> */}
        
        <div className="p-4 sm:p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-blue-600 group-hover:text-blue-700 mb-1 transition-colors truncate">
            {fish.name}
          </h3>
          <p className="text-xs text-gray-400 italic mb-3 truncate">{fish.latin_name}</p>

          {/* Stichpunkte anstelle der Beschreibung */}
          <div className="space-y-1.5 text-xs text-gray-600 mb-4 flex-grow">
          {/* <p><strong>Habitat:</strong> <span className="font-normal">{fish.habitat || 'N/A'}</span></p> */}
            <p><strong>Herkunft:</strong> <span className="font-normal">{(Array.isArray(fish.herkunft) && fish.herkunft.length > 0) ? fish.herkunft.join(', ') : 'N/A'}</span></p>
            <p><strong>Größe:</strong> <span className="font-normal">{fish.size || 'N/A'}</span></p>
            <p><strong>Haltung:</strong> <span className="font-normal">{(Array.isArray(fish.haltung) && fish.haltung.length > 0) ? fish.haltung.join(', ') : 'N/A'}</span></p>
            <p><strong>Ernährung:</strong> <span className="font-normal">{(Array.isArray(fish.ernahrung) && fish.ernahrung.length > 0) ? fish.ernahrung.join(', ') : 'N/A'}</span></p>
            <p><strong>Temperatur:</strong> <span className="font-normal">{fish.temperatur || 'N/A'}</span></p>
            <p><strong>Schwimmhöhe:</strong> <span className="font-normal">{(Array.isArray(fish.schwimmhoehe) && fish.schwimmhoehe.length > 0) ? fish.schwimmhoehe.join(', ') : 'N/A'}</span></p>
          </div>

          {/* "Mehr Infos klicken" Text */}
          <div className="mt-auto pt-2 border-t border-gray-100 text-center">
            <p className="text-xs text-blue-500 group-hover:text-blue-600 font-medium flex items-center justify-center">
              <InformationCircleIcon className="h-4 w-4 mr-1" /> {/* Optionales Icon */}
              Mehr Infos & Details
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FishCard;