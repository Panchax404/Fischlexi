// components/FilterBar.tsx
'use client';
import React, { useState, Fragment, useEffect } from 'react';
import type { FilterState } from '../lib/types';
import { Transition } from '@headlessui/react'; // Für schöne Animationen (npm install @headlessui/react)
import { ChevronDownIcon, XCircleIcon } from '@heroicons/react/24/solid'; // Optionale Icons

import Slider from 'rc-slider'; // Nur 'Slider' importieren
import 'rc-slider/assets/index.css'; // Importiere das Standard-CSS für rc-slider
import '../src/app/styles/rc-slider-overrides.css'; 

type FilterBarProps = {
  filter: FilterState;
  setFilter: (f: FilterState | ((prevState: FilterState) => FilterState)) => void;
  options: {
    haltung: string[];
    ernahrung: string[];
    temperatur: string[]; // Bleibt als Select oder wird auch ein Accordion für Bereiche
    schwimmhoehe: string[];
    herkunft: string[];
  };
  disabled?: boolean;
};

// Komponente für eine einzelne aufklappbare Filtersektion
interface AccordionFilterSectionProps {
  title: string;
  filterKey: keyof Omit<FilterState, 'temperatur'>; // Keys für Checkbox-Filter
  options: string[];
  selectedValues: string[] | undefined;
  onCheckboxChange: (filterKey: keyof Omit<FilterState, 'temperatur'>, value: string) => void;
  onResetFilter: (filterKey: keyof Omit<FilterState, 'temperatur'>) => void;
  disabled?: boolean;
}

const GLOBAL_MIN_TEMP = 0;  // Globale Untergrenze für den Slider (z.B. 0°C)
const GLOBAL_MAX_TEMP = 40; // Globale Obergrenze für den Slider (z.B. 40°C)
const TEMP_STEP = 1;        // Schrittweite des Sliders (z.B. 1°C)

const AccordionFilterSection: React.FC<AccordionFilterSectionProps> = ({
  title,
  filterKey,
  options,
  selectedValues = [],
  onCheckboxChange,
  onResetFilter,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const initialVisibleCount = 5;
  const visibleOptions = showAll ? options : options.slice(0, initialVisibleCount);
  if (!options || options.length === 0) return null;
  const numSelected = selectedValues.length;

  return (
    <div className="w-full">
    <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-700 
                    hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75
                    transition-colors duration-150
                    ${isOpen ? 'bg-gray-100 rounded-t-lg' : 'bg-gray-50 rounded-lg shadow-sm hover:shadow-md'}`}
    >
            <span>
            {title}
            {numSelected > 0 && (
                <span className={`ml-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${isOpen ? 'bg-blue-200 text-blue-800' : 'bg-blue-100 text-blue-700'}`}>
                {numSelected} ausgewählt
                </span>
            )}
            </span>
            <ChevronDownIcon className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

      {/* Aufklappbarer Inhalt mit Animation */}
      <Transition
            as={Fragment}
            show={isOpen}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 -translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-1"
        >
            <div className="px-4 pt-3 pb-4 border border-t-0 border-gray-200 rounded-b-lg shadow-sm bg-white">
            {numSelected > 0 && (
                <button type="button" onClick={() => onResetFilter(filterKey)} className="mb-3 text-xs text-red-600 hover:text-red-800 flex items-center" disabled={disabled}>
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    Filter zurücksetzen
                </button>
            )}            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {visibleOptions.map(opt => (
            <div key={opt} className="flex items-center py-1">
                <input id={`${filterKey}-${opt.replace(/\s+/g, '-')}`} name={`${filterKey}-${opt.replace(/\s+/g, '-')}`} type="checkbox" checked={selectedValues.includes(opt)} onChange={() => onCheckboxChange(filterKey, opt)} disabled={disabled} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor={`${filterKey}-${opt.replace(/\s+/g, '-')}`} className="ml-3 block text-sm text-gray-800 select-none cursor-pointer">{opt}</label>
            </div>
            ))}
        </div>
        {options.length > initialVisibleCount && (
            <button type="button" onClick={() => setShowAll(!showAll)} className="mt-3 text-xs text-blue-600 hover:text-blue-800" disabled={disabled}>
            {showAll ? 'Weniger anzeigen' : `Alle ${options.length} anzeigen`}
            </button>
        )}
        </div>
    </Transition>
    </div>
);
};


const FilterBar: React.FC<FilterBarProps> = ({ filter, setFilter, options, disabled }) => {
  const initialTempMin = filter.temperatur?.min ?? GLOBAL_MIN_TEMP;
  const initialTempMax = filter.temperatur?.max ?? GLOBAL_MAX_TEMP;

  const [tempRange, setTempRange] = useState<[number, number]>([initialTempMin, initialTempMax]);
  const [isTempAccordionOpen, setIsTempAccordionOpen] = useState(false);

  // State für das einzelne Temperatur-Input-Feld
  const [singleTempInput, setSingleTempInput] = useState<string>('');

  useEffect(() => {
    const globalMin = filter.temperatur?.min ?? GLOBAL_MIN_TEMP;
    const globalMax = filter.temperatur?.max ?? GLOBAL_MAX_TEMP;

    if (globalMin !== tempRange[0] || globalMax !== tempRange[1]) {
      setTempRange([globalMin, globalMax]);
    }
    // Wenn ein exakter Filter (min === max) gesetzt ist, zeige diesen im Input-Feld
    if (filter.temperatur && filter.temperatur.min === filter.temperatur.max) {
        if (String(filter.temperatur.min) !== singleTempInput) {
            setSingleTempInput(String(filter.temperatur.min));
        }
    } else if (!filter.temperatur && singleTempInput !== '') { // Wenn Filter entfernt wurde, leere Input
        setSingleTempInput('');
    }

  }, [filter.temperatur]);

  const handleCheckboxChange = (filterKey: keyof Omit<FilterState, 'temperatur'>, value: string) => {
    setFilter(prevFilter => {
      const currentValues = (prevFilter[filterKey] as string[] | undefined) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      const updatedFilter = { ...prevFilter };
      if (newValues.length === 0) { delete updatedFilter[filterKey]; }
      else { updatedFilter[filterKey] = newValues; }
      return updatedFilter;
    });
  };

  const handleResetFilter = (filterKey: keyof Omit<FilterState, 'temperatur'>) => {
    setFilter(prevFilter => {
      const updatedFilter = { ...prevFilter };
      delete updatedFilter[filterKey];
      return updatedFilter;
    });
  };

  const handleResetAllCheckboxFilters  = () => {
    const tempFilterValue = filter.temperatur;
    const newFilterState: Partial<FilterState> = {};
    if (tempFilterValue) {
        newFilterState.temperatur = tempFilterValue;
    }
    setFilter(newFilterState as FilterState);
  };
  
  const hasActiveMultiFilters = Object.keys(filter).some(key =>  key !== 'temperatur' && Array.isArray(filter[key as keyof FilterState]) && (filter[key as keyof FilterState] as string[]).length > 0);
  // Wird aufgerufen, WÄHREND der Nutzer den Slider zieht. Aktualisiert nur den lokalen State.
  const handleTemperatureRangeChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setTempRange([value[0], value[1]]);
      // Wenn der Slider bewegt wird und einen Bereich darstellt, leere das Single-Input-Feld,
      // da es nur für einen exakten Wert gedacht ist.
      if (value[0] !== value[1] && singleTempInput !== '') {
        setSingleTempInput('');
      }
    }
  };

  const handleTemperatureRangeChangeComplete = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      const [min, max] = value;
      updateGlobalTemperatureFilter(min, max);
    }
  };
  const updateGlobalTemperatureFilter = (min: number, max: number) => {
    // Wenn min und max gleich sind, und der singleTempInput diesen Wert nicht schon reflektiert,
    // dann setze den singleTempInput.
    if (min === max && String(min) !== singleTempInput) {
        setSingleTempInput(String(min));
    }

    if (min === GLOBAL_MIN_TEMP && max === GLOBAL_MAX_TEMP) {
      if (filter.temperatur) {
        setFilter(prev => { const { temperatur, ...rest } = prev; return rest; });
      }
    } else {
      setFilter(prev => ({ ...prev, temperatur: { min, max } }));
    }
  };

  // Handler für Änderungen im einzelnen Input-Feld
  const handleSingleTempInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSingleTempInput(e.target.value);
  };

  // Anwendung des Werts aus dem einzelnen Input-Feld
  const applySingleTempInput = () => {
    let tempValue = parseInt(singleTempInput, 10);

    if (isNaN(tempValue)) { // Wenn ungültig, Filter ggf. zurücksetzen oder nichts tun
      if (singleTempInput === '' && filter.temperatur) { // Wenn Feld geleert wurde, Filter entfernen
        resetTemperatureFilter();
      }
      return;
    }

    tempValue = Math.max(GLOBAL_MIN_TEMP, Math.min(tempValue, GLOBAL_MAX_TEMP));

    setTempRange([tempValue, tempValue]); // Slider auf exakten Wert setzen
    setSingleTempInput(String(tempValue)); // Normalisiere Input-Anzeige
    updateGlobalTemperatureFilter(tempValue, tempValue); // Globalen Filter auf exakten Wert
  };

  const resetTemperatureFilter = () => {
    setTempRange([GLOBAL_MIN_TEMP, GLOBAL_MAX_TEMP]);
    setSingleTempInput(''); // Leere das einzelne Input-Feld
    setFilter(prev => {
      const { temperatur, ...rest } = prev;
      return rest;
    });
  };

  const isTempFilterActive = filter.temperatur && (filter.temperatur.min !== GLOBAL_MIN_TEMP || filter.temperatur.max !== GLOBAL_MAX_TEMP);

  // Verbessertes Styling für den Slider
  const sliderHandleStyle = {
    borderColor: 'var(--color-primary-500, #3B82F6)', // Tailwind blue-500 oder CSS Variable
    backgroundColor: '#fff',
    width: 22,
    height: 22,
    marginTop: -9, // (22 - 4) / 2 = 9  (HandleHeight - TrackHeight) / 2
    borderWidth: 3,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)', // Leichter Schatten
    opacity: 1, // Sicherstellen, dass es sichtbar ist
  };
  const sliderTrackStyle = {
    backgroundColor: 'var(--color-primary-500, #3B82F6)',
    height: 4, // Dünnerer, moderner Track
    borderRadius: 2,
  };
  const sliderRailStyle = {
    backgroundColor: '#E5E7EB', // Tailwind gray-300
    height: 4,
    borderRadius: 2,
  };  

  return (
    <div className="bg-gray-100 p-4 md:p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800">Filteroptionen</h3>
        {(hasActiveMultiFilters || isTempFilterActive) && (
            <button
            type="button"
            onClick={() => {
                handleResetAllCheckboxFilters();
                resetTemperatureFilter();
            }}
            className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center"
            disabled={disabled}
        >
            <XCircleIcon className="w-4 h-4 mr-1" />
            Alle Filter zurücksetzen
        </button>
    )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
        <AccordionFilterSection
          title="Haltung"
          filterKey="haltung"
          options={options.haltung || []}
          selectedValues={filter.haltung}
          onCheckboxChange={handleCheckboxChange}
          onResetFilter={handleResetFilter}
          disabled={disabled}
        />
        <AccordionFilterSection
          title="Ernährung"
          filterKey="ernahrung"
          options={options.ernahrung || []}
          selectedValues={filter.ernahrung}
          onCheckboxChange={handleCheckboxChange}
          onResetFilter={handleResetFilter}
          disabled={disabled}
        />
        <AccordionFilterSection
          title="Schwimmhöhe"
          filterKey="schwimmhoehe"
          options={options.schwimmhoehe || []}
          selectedValues={filter.schwimmhoehe}
          onCheckboxChange={handleCheckboxChange}
          onResetFilter={handleResetFilter}
          disabled={disabled}
        />
        <AccordionFilterSection
          title="Herkunft"
          filterKey="herkunft"
          options={options.herkunft || []}
          selectedValues={filter.herkunft}
          onCheckboxChange={handleCheckboxChange}
          onResetFilter={handleResetFilter}
          disabled={disabled}
        />

        
        {/* Temperatur-Filter als Akkordeon */}
        <div className="w-full">
            <button
                type="button"
                onClick={() => {
                    console.log('Toggling temp accordion, current state:', isTempAccordionOpen);
                    setIsTempAccordionOpen(!isTempAccordionOpen);
                }}
                disabled={disabled}
                className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-700 
                            hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75
                            transition-colors duration-150
                            ${isTempAccordionOpen ? 'bg-gray-100 rounded-t-lg' : 'bg-gray-50 rounded-lg shadow-sm hover:shadow-md'}`}
            >
<span>
                Wassertemperatur
                {isTempFilterActive && (
                    <span className={`ml-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${isTempAccordionOpen ? 'bg-blue-200 text-blue-800' : 'bg-blue-100 text-blue-700'}`}>
                    {/* Zeige den Bereich oder den einzelnen Wert an */}
                    {filter.temperatur?.min === filter.temperatur?.max 
                        ? `${filter.temperatur.min}°C` 
                        : `${filter.temperatur?.min ?? tempRange[0]}°C - ${filter.temperatur?.max ?? tempRange[1]}°C`}
                    </span>
                )}
                </span>
                <ChevronDownIcon className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isTempAccordionOpen ? 'rotate-180' : ''}`} />
            </button>
            <Transition
                as={Fragment}
                show={isTempAccordionOpen}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 -translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 -translate-y-1"
            >
                <div className="px-4 sm:px-6 pt-4 pb-6 border border-t-0 border-gray-200 rounded-b-lg shadow-sm bg-white">
                    {isTempFilterActive && (
                        <button
                            type="button"
                            onClick={resetTemperatureFilter}
                            className="mb-4 text-xs text-red-600 hover:text-red-800 flex items-center"
                            disabled={disabled}
                            >
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            Temperaturfilter zurücksetzen
                        </button>
                    )}
                    {/* Input-Feld für exakte Temperatur */}
                    <div className="mb-4">
                        <label htmlFor="single-temp-input" className="block text-xs font-medium text-gray-700 mb-1">
                            Exakte Temperatur (oder Bereich mit Slider):
                        </label>
                        <div className="flex items-center">
                            <input
                                type="number"
                                id="single-temp-input"
                                aria-label="Exakte Temperatur"
                                placeholder="z.B. 25"
                                value={singleTempInput}
                                onChange={handleSingleTempInputChange}
                                onBlur={applySingleTempInput}
                                onKeyDown={(e) => e.key === 'Enter' && applySingleTempInput()}
                                disabled={disabled}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                                min={GLOBAL_MIN_TEMP}
                                max={GLOBAL_MAX_TEMP}
                            />
                             <span className="ml-2 text-gray-700">°C</span>
                        </div>
                    </div>

                    {/* Range Slider */}
                    <div className="px-2 pt-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Bereich Min: {tempRange[0]}°C</span>
                            <span>Bereich Max: {tempRange[1]}°C</span>
                        </div>
                        {/* @ts-ignore */}
                        <Slider
                            range
                            min={GLOBAL_MIN_TEMP}
                            max={GLOBAL_MAX_TEMP}
                            step={TEMP_STEP}
                            value={tempRange}
                            onChange={handleTemperatureRangeChange}
                            onChangeComplete={handleTemperatureRangeChangeComplete}
                            allowCross={false}
                            disabled={disabled}
                            className="mb-3 custom-rc-slider"
                            // @ts-ignore
                            handleStyle={[sliderHandleStyle, sliderHandleStyle]}
                            // @ts-ignore
                            trackStyle={[sliderTrackStyle]}
                            // @ts-ignore
                            railStyle={sliderRailStyle}
                        />
                    </div>
                </div>
            </Transition>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;