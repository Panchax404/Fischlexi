import type { Metadata } from 'next';
import { Suspense } from 'react';
import SearchControls from '../../components/SearchControls';
import FishCard from '../../components/FishCard';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import HeroSection from '../../components/HeroSection';
import { getFilterOptions } from '../../lib/db/options';
import { searchFish } from '../../lib/db/fish';
import { parseSearchParams } from '../../lib/searchParamsUtils';

export const metadata: Metadata = {
  title: 'Fischlexikon - Suche',
  description: 'Finde den passenden Fisch für dein Aquarium.',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const filters = parseSearchParams(resolvedParams);
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : '';
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page, 10) : 1;

  // Parallel data fetching
  const [filterOptionsData, searchResult] = await Promise.all([
    getFilterOptions(),
    searchFish({ q, page, limit: 12, filters }),
  ]);

  const { data: fishList, pagination } = searchResult;

  // Reconstruct base URL for pagination
  const params = new URLSearchParams();
  Object.entries(resolvedParams).forEach(([key, value]) => {
    if (key !== 'page' && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else {
        params.append(key, value);
      }
    }
  });
  const baseUrl = `/?${params.toString()}`;

  return (
    <>
      <HeroSection />

      <div className="space-y-10 md:space-y-12">
        <Suspense fallback={<LoadingSpinner />}>
          <SearchControls
            initialOptions={filterOptionsData}
            initialFilters={filters}
            initialQuery={q}
          />
        </Suspense>

        <div id="search-results-container" className="scroll-mt-24">
          {fishList.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border rounded-3xl shadow-sm">
              <span className="text-6xl mb-4 block">🐡</span>
              <p className="text-xl text-muted-foreground">
                Keine Fische gefunden. <br />
                <span className="text-base text-muted-foreground/80">Versuche, deine Filter anzupassen.</span>
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6 pl-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Zeige <span className="text-foreground font-bold">{fishList.length}</span> von {pagination.totalResults} Ergebnissen
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {fishList.map(fish => (
                  <FishCard
                    key={fish.id}
                    fish={fish}
                    activeFilters={filters}
                    searchQueryFromCaller={params.toString()}
                  />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="pt-10">
                  <Pagination
                    currentPage={page}
                    totalPages={pagination.totalPages}
                    baseUrl={baseUrl}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}