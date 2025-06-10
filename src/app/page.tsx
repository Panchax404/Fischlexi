// app/page.tsx
'use client';

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FilterBar from "../../components/FilterBar"; // Dein Pfad
import type { FilterState } from "../../components/FilterBar"; // Importiere FilterState von FilterBar oder lib/types
import FishCard from "../../components/FishCard"; // Dein Pfad
import Pagination from "../../components/Pagination"; // Dein Pfad

// Dein Fish-Typ
export type Fish = {
  id: number;
  name: string;
  slug: string;
  latin_name: string;
  habitat?: string | null;
  size: string;
  description_general?: string | null;
  haltung: string[];
  ernahrung: string[];
  temperatur: string; // Kommt als String von der Such-API für die Card
  schwimmhoehe: string[];
  herkunft: string[];
  image_url_main?: string | null;
};

type FilterOptions = {
  haltung: string[];
  ernahrung: string[];
  // Temperatur-Optionen werden jetzt nicht mehr für ein Select gebraucht,
  // könnten aber für Min/Max-Grenzen des Sliders von der API kommen.
  // Für dieses Beispiel lassen wir es als string[], falls du es doch noch brauchst.
  temperatur: string[];
  schwimmhoehe: string[];
  herkunft: string[];
};

const API_BASE_URL = "/api/fish";
const RESULTS_PER_PAGE = 12;

// Konstanten für den Temperaturslider (jetzt auch hier definiert)
const GLOBAL_MIN_TEMP = 0;
const GLOBAL_MAX_TEMP = 40;
// const TEMP_STEP = 1; // Wird in FilterBar.tsx verwendet, hier nicht direkt nötig

function LoadingSpinner() {
    return (
        <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Lade...</p>
        </div>
    );
}

// Hilfsfunktion zum Parsen von wiederholten URL-Parametern
const getArrayFromRepeatedParams = (searchParams: URLSearchParams, paramName: string): string[] | undefined => {
  const values = searchParams.getAll(paramName);
  return values.length > 0 ? values.filter(Boolean) : undefined;
};

// Hilfsfunktion zum Erstellen eines FilterState-Objekts aus searchParams
const buildFilterStateFromParams = (searchParams: URLSearchParams): FilterState => {
  const filters: Partial<FilterState> = {}; // Beginne mit Partial, um optionale Keys zu erlauben

  filters.haltung = getArrayFromRepeatedParams(searchParams, 'haltung');
  filters.ernahrung = getArrayFromRepeatedParams(searchParams, 'ernahrung');
  filters.schwimmhoehe = getArrayFromRepeatedParams(searchParams, 'schwimmhoehe');
  filters.herkunft = getArrayFromRepeatedParams(searchParams, 'herkunft');

  const tempMinParam = searchParams.get('temp_min');
  const tempMaxParam = searchParams.get('temp_max');

  if (tempMinParam !== null && tempMaxParam !== null) {
    const min = parseInt(tempMinParam, 10);
    const max = parseInt(tempMaxParam, 10);
    if (!isNaN(min) && !isNaN(max)) {
      filters.temperatur = { min, max };
    }
  } else if (tempMinParam !== null) { // Nur temp_min ist gesetzt
    const min = parseInt(tempMinParam, 10);
    if(!isNaN(min)) filters.temperatur = { min, max: GLOBAL_MAX_TEMP }; // Max auf global setzen
  } else if (tempMaxParam !== null) { // Nur temp_max ist gesetzt
    const max = parseInt(tempMaxParam, 10);
    if(!isNaN(max)) filters.temperatur = { min: GLOBAL_MIN_TEMP, max }; // Min auf global setzen
  }
  // Wenn keine Temperaturparameter gesetzt sind, bleibt filters.temperatur undefined

  // Entferne undefined Keys für einen sauberen State
  (Object.keys(filters) as Array<keyof FilterState>).forEach(key => {
    if (filters[key] === undefined) {
      delete filters[key];
    }
  });
  return filters as FilterState; // Cast zu FilterState, da wir undefinierte entfernt haben
};


function FishSearchPageContent() {
  const router = useRouter();
  const searchParamsHook = useSearchParams();

  const [searchQueryInput, setSearchQueryInput] = useState(() => searchParamsHook.get('q') || "");
  const [filters, setFilters] = useState<FilterState>(() => buildFilterStateFromParams(searchParamsHook));
  const [currentPage, setCurrentPage] = useState(() => parseInt(searchParamsHook.get('page') || '1', 10));

  const [results, setResults] = useState<Fish[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    haltung: [], ernahrung: [], temperatur: [], schwimmhoehe: [], herkunft: []
  });
  const [hasFetchedInitialOptions, setHasFetchedInitialOptions] = useState(false);
  const [hasPerformedFirstSearch, setHasPerformedFirstSearch] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/filter-options`);
        if (!res.ok) throw new Error("Filteroptionen konnten nicht geladen werden.");
        const data = await res.json();
        setFilterOptions(data);
        setHasFetchedInitialOptions(true);
      } catch (e: any) {
        console.error("Fehler beim Laden der Filteroptionen:", e);
        setError("Filteroptionen konnten nicht geladen werden.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const buildUrlQueryString = useCallback((
    currentSearchTerm: string,
    currentFilters: FilterState,
    currentPageNum: number
  ): string => {
    const paramsForUrl = new URLSearchParams();
    if (currentSearchTerm.trim()) paramsForUrl.set("q", currentSearchTerm.trim());

    (Object.keys(currentFilters) as Array<keyof FilterState>).forEach(key => {
      const value = currentFilters[key];
      if (value !== undefined) {
        if (key === 'temperatur') {
          const tempValue = value as { min: number; max: number }; // Type assertion
          // Nur hinzufügen, wenn es nicht den globalen Grenzen entspricht
          if (tempValue.min !== GLOBAL_MIN_TEMP) {
            paramsForUrl.set("temp_min", String(tempValue.min));
          }
          if (tempValue.max !== GLOBAL_MAX_TEMP) {
            paramsForUrl.set("temp_max", String(tempValue.max));
          }
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            value.forEach(v => paramsForUrl.append(key, v)); // Wiederholte Parameter
          }
        }
        // String-Werte für Filter (falls es welche gäbe außer Temperatur)
        // else if (typeof value === 'string' && value.trim()){
        //   paramsForUrl.set(key, value);
        // }
      }
    });

    if (currentPageNum > 1) paramsForUrl.set("page", String(currentPageNum));
    return paramsForUrl.toString();
  }, []);

  const [debouncedSearchQueryInput, setDebouncedSearchQueryInput] = useState(searchQueryInput);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQueryInput(searchQueryInput);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQueryInput]);

  useEffect(() => {
    const queryString = buildUrlQueryString(debouncedSearchQueryInput, filters, currentPage);
    const newPath = `/${queryString ? `?${queryString}` : ''}`;
    
    const currentWindowQuery = window.location.search;
    const newWindowQuery = queryString ? `?${queryString}` : '';

    if (newWindowQuery !== currentWindowQuery) {
        router.push(newPath, { scroll: false });
    }
  }, [debouncedSearchQueryInput, filters, currentPage, buildUrlQueryString, router]);

  useEffect(() => {
    const qFromUrl = searchParamsHook.get('q') || "";
    const pageFromUrl = parseInt(searchParamsHook.get('page') || '1', 10);
    const filtersFromUrl = buildFilterStateFromParams(searchParamsHook);

    if (qFromUrl !== searchQueryInput) {
      setSearchQueryInput(qFromUrl);
    }
    // Nur setFilters aufrufen, wenn sich der Wert tatsächlich geändert hat
    if (JSON.stringify(filtersFromUrl) !== JSON.stringify(filters)) {
      setFilters(filtersFromUrl);
    }
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }

    const shouldSearch = qFromUrl.trim() || Object.values(filtersFromUrl).some(val => 
        (Array.isArray(val) && val.length > 0) || 
        (typeof val === 'object' && val !== null && ( (val as any).min !== undefined || (val as any).max !== undefined))
    );

    if (!shouldSearch && Object.keys(filtersFromUrl).length === 0 && !qFromUrl.trim()) { // Zusätzliche Prüfung für leere Filter
      setResults([]);
      setTotalPages(0);
      setTotalResults(0);
      if(hasPerformedFirstSearch && !isLoading) setIsLoading(false);
      return;
    }

    const performFetch = async () => {
      setIsLoading(true);
      setError(null);
      if (!hasPerformedFirstSearch) setHasPerformedFirstSearch(true);

      // API Parameter String basierend auf filtersFromUrl und qFromUrl
      const apiQueryString = buildUrlQueryString(qFromUrl, filtersFromUrl, pageFromUrl);
      const finalApiParams = new URLSearchParams(apiQueryString);
      finalApiParams.set('limit', String(RESULTS_PER_PAGE));
      // page ist schon in apiQueryString durch buildUrlQueryString, falls > 1

      try {
        const res = await fetch(`${API_BASE_URL}/search?${finalApiParams.toString()}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: `HTTP error! status: ${res.status}` }));
          throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setResults(data.data || []);
        setTotalPages(data.pagination?.totalPages || 0);
        setTotalResults(data.pagination?.totalResults || 0);
      } catch (e: any) {
        console.error("Fehler bei der Suche:", e);
        setError(e.message || "Ein Fehler ist aufgetreten.");
        setResults([]);
        setTotalPages(0);
        setTotalResults(0);
      } finally {
        setIsLoading(false);
      }
    };

    if (hasFetchedInitialOptions) {
        performFetch();
    }
  // Wichtig: searchQueryInput, filters, currentPage als Abhängigkeiten entfernen, da sie von searchParamsHook abgeleitet werden.
  // Sonst entstehen Schleifen.
  }, [searchParamsHook, hasFetchedInitialOptions]);


  const handleFilterChange = (newFilterOrUpdater: FilterState | ((prevState: FilterState) => FilterState)) => {
    setFilters(newFilterOrUpdater);
    setCurrentPage(1);
  };

  const handleSearchFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDebouncedSearchQueryInput(searchQueryInput);
    setCurrentPage(1);
  };
  
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const resultsElement = document.getElementById('search-results-container');
    if (resultsElement) {
        setTimeout(() => resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  };
  
  return (
    <div className="space-y-10 md:space-y-12">
      <form onSubmit={handleSearchFormSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
        <div className="mb-6 relative">
          <label htmlFor="search-input" className="sr-only">Fisch suchen</label>
          <input
            id="search-input"
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm pr-10"
            placeholder="🔍 Fische suchen..."
            value={searchQueryInput}
            onChange={e => setSearchQueryInput(e.target.value)}
            disabled={!hasFetchedInitialOptions && isLoading} // Disable, wenn Optionen laden
          />
          {isLoading && searchQueryInput && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
          )}
        </div>
        
        <FilterBar
          filter={filters}
          setFilter={handleFilterChange}
          options={filterOptions}
          disabled={!hasFetchedInitialOptions || isLoading}
        />
      </form>

      <div id="search-results-container">
        {/* ... (Rest der JSX-Struktur für Ergebnisse, Ladeanzeigen etc.) ... */}
         {error && !isLoading && <p className="text-red-500 text-center bg-red-100 p-4 rounded-md">{error}</p>}
        {isLoading && results.length === 0 && hasFetchedInitialOptions && <LoadingSpinner />}

        {!isLoading && !error && hasPerformedFirstSearch && results.length === 0 && (
          <p className="text-gray-600 text-center bg-yellow-100 p-4 rounded-md">
              Keine Fische gefunden.
          </p>
        )}
        
        {results.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                Zeige {results.length} von {totalResults} Ergebnissen (Seite {currentPage} von {totalPages})
                </p>
                {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map(fish => (
                 <FishCard
                 key={fish.id}
                 fish={fish}
                  searchQueryFromCaller={searchParamsHook.toString()}
                />
              ))}
            </div>
            {totalPages > 1 && (
                <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                />
            )}
          </>
        )}

        {!isLoading && !error && !hasPerformedFirstSearch && hasFetchedInitialOptions && (
           <div className="text-center py-10">
              <svg /* ... */ >{/* ... */}</svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Starten Sie Ihre Suche</h3>
              <p className="mt-1 text-sm text-gray-500">Geben Sie einen Suchbegriff ein oder verwenden Sie die Filter.</p>
          </div>
        )}
         {!hasFetchedInitialOptions && !error && <LoadingSpinner />}
      </div>
    </div>
  );
}

export default function Page() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <FishSearchPageContent />
        </Suspense>
    );
}