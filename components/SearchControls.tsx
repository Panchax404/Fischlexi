'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FilterBar from "./FilterBar";
import type { FilterState } from '../lib/types';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Need check if available, assuming yes

// Constants
const GLOBAL_MIN_TEMP = 0;
const GLOBAL_MAX_TEMP = 40;
const GLOBAL_MIN_PH = 0.0;
const GLOBAL_MAX_PH = 14.0;

type SearchControlsProps = {
    initialOptions: any;
    initialFilters: FilterState;
    initialQuery: string;
};

const buildUrlQueryString = (
    currentSearchTerm: string,
    currentFilters: FilterState,
): string => {
    const paramsForUrl = new URLSearchParams();
    if (currentSearchTerm.trim()) paramsForUrl.set("q", currentSearchTerm.trim());

    (Object.keys(currentFilters) as Array<keyof FilterState>).forEach(key => {
        const value = currentFilters[key];
        if (value !== undefined) {
            if (key === 'temperatur' && currentFilters.temperatur) {
                if (currentFilters.temperatur.min !== undefined) paramsForUrl.set("temp_min", String(currentFilters.temperatur.min));
                if (currentFilters.temperatur.max !== undefined) paramsForUrl.set("temp_max", String(currentFilters.temperatur.max));
            } else if (key === 'phWert' && currentFilters.phWert) {
                if (currentFilters.phWert.min !== undefined) paramsForUrl.set("ph_min", currentFilters.phWert.min.toFixed(1));
                if (currentFilters.phWert.max !== undefined) paramsForUrl.set("ph_max", currentFilters.phWert.max.toFixed(1));
            } else if (key === 'hardness' && currentFilters.hardness) {
                if (currentFilters.hardness.min !== undefined) paramsForUrl.set("hardness_min", String(currentFilters.hardness.min));
                if (currentFilters.hardness.max !== undefined) paramsForUrl.set("hardness_max", String(currentFilters.hardness.max));
            } else if (key === 'liters' && typeof currentFilters.liters === 'number') {
                paramsForUrl.set("liters_min", String(currentFilters.liters));
            } else if (key === 'length' && typeof currentFilters.length === 'number') {
                paramsForUrl.set("length_min", String(currentFilters.length));
            } else if (Array.isArray(value)) {
                if (value.length > 0) {
                    value.forEach(v => paramsForUrl.append(key, v));
                }
            }
        }
    });
    return paramsForUrl.toString();
};

export default function SearchControls({ initialOptions, initialFilters, initialQuery }: SearchControlsProps) {
    const router = useRouter();

    const [searchQueryInput, setSearchQueryInput] = useState(initialQuery);
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [debouncedSearchQueryInput, setDebouncedSearchQueryInput] = useState(initialQuery);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQueryInput(searchQueryInput);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchQueryInput]);

    useEffect(() => {
        const queryString = buildUrlQueryString(debouncedSearchQueryInput, filters);
        const newPath = `/${queryString ? `?${queryString}` : ''}`;
        router.push(newPath, { scroll: false });
    }, [debouncedSearchQueryInput, filters]);

    const handleFilterChange = (newFilterOrUpdater: FilterState | ((prevState: FilterState) => FilterState)) => {
        setFilters(newFilterOrUpdater);
    };

    const handleSearchFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setDebouncedSearchQueryInput(searchQueryInput);
    };

    return (
        <form onSubmit={handleSearchFormSubmit} className="mb-12" data-testid="search-form">
            <div className="relative max-w-2xl mx-auto mb-8">
                <label htmlFor="search-input" className="sr-only">Fisch suchen</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <input
                        id="search-input"
                        data-testid="search-input"
                        type="text"
                        className="block w-full pl-12 pr-4 py-4 border-2 border-border/50 rounded-full bg-card/80 backdrop-blur-sm text-lg text-foreground placeholder:text-muted-foreground shadow-lg focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 ease-out hover:bg-card"
                        placeholder="Suche nach Name, Art oder Merkmal..."
                        value={searchQueryInput}
                        onChange={e => setSearchQueryInput(e.target.value)}
                    />
                </div>
            </div>

            <FilterBar
                filter={filters}
                setFilter={handleFilterChange}
                options={initialOptions}
            />
        </form>
    );
}
