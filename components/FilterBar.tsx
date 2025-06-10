// components/FilterBar.tsx
'use client';
import React, { useState, Fragment, useEffect } from 'react';
import type { FilterState } from '../lib/types';
import { Transition } from '@headlessui/react'; // Für schöne Animationen (npm install @headlessui/react)
import { ChevronDownIcon, XCircleIcon } from '@heroicons/react/24/solid'; // Optionale Icons

import Slider from 'rc-slider'; // Nur 'Slider' importieren
import 'rc-slider/assets/index.css'; // Importiere das Standard-CSS für rc-slider

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
  const [isTempAccordionOpen, setIsTempAccordionOpen] = useState(false); // State für Temperatur-Akkordeon

  useEffect(() => {
    const newMin = filter.temperatur?.min ?? GLOBAL_MIN_TEMP;
    const newMax = filter.temperatur?.max ?? GLOBAL_MAX_TEMP;
    setTempRange([newMin, newMax]);
    // Öffne das Akkordeon, wenn ein Temperaturfilter aktiv ist (außer den globalen Grenzen)
    if (newMin !== GLOBAL_MIN_TEMP || newMax !== GLOBAL_MAX_TEMP) {
        setIsTempAccordionOpen(true);
    }
  }, [filter.temperatur]);

  const handleCheckboxChange = (filterKey: keyof Omit<FilterState, 'temperatur'>, value: string) => {
    setFilter(prevFilter => {
      const currentValues = (prevFilter[filterKey] as string[] | undefined) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      const updatedFilter = { ...prevFilter };
      if (newValues.length === 0) {
        delete updatedFilter[filterKey];
      } else {
        updatedFilter[filterKey] = newValues;
      }
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
  
  const hasActiveMultiFilters = Object.keys(filter).some(key => key !== 'temperatur' && Array.isArray(filter[key as keyof FilterState]) && (filter[key as keyof FilterState] as string[]).length > 0);

  const handleTemperatureChange = (value: number | number[]) => {
    // value ist hier [min, max] vom Range Slider
    if (Array.isArray(value) && value.length === 2) {
      setTempRange([value[0], value[1]]);
    }
  };

  const handleTemperatureAfterChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      const [min, max] = value;
      if ((min === GLOBAL_MIN_TEMP && max === GLOBAL_MAX_TEMP)) {
        // Wenn auf globale Grenzen zurückgesetzt -> Filter entfernen
        // Nur entfernen, wenn vorher ein Filter aktiv war, um unnötige Updates zu vermeiden
        if (filter.temperatur) {
            setFilter(prev => {
                const { temperatur, ...rest } = prev;
                return rest;
            });
        }
      } else {
        // Wenn von globalen Grenzen abweichend -> Filter setzen/aktualisieren
        setFilter(prev => ({ ...prev, temperatur: { min, max } }));
      }
    }
  };

  const resetTemperatureFilter = () => {
    setTempRange([GLOBAL_MIN_TEMP, GLOBAL_MAX_TEMP]);
    setFilter(prev => {
      const { temperatur, ...rest } = prev;
      return rest;
    });
    setIsTempAccordionOpen(false); // Optional: Akkordeon schließen beim Reset
  };
  const isTempFilterActive = filter.temperatur && (filter.temperatur.min !== GLOBAL_MIN_TEMP || filter.temperatur.max !== GLOBAL_MAX_TEMP);
  
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
                onClick={() => setIsTempAccordionOpen(!isTempAccordionOpen)}
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
                    {tempRange[0]}°C - {tempRange[1]}°C
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
                <div className="px-6 pt-4 pb-6 border border-t-0 border-gray-200 rounded-b-lg shadow-sm bg-white">
                    {isTempFilterActive && (
                        <button
                            type="button"
                            onClick={resetTemperatureFilter}
                            className="mb-3 text-xs text-red-600 hover:text-red-800 flex items-center"
                            disabled={disabled}
                            >
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            Temperaturfilter zurücksetzen
                        </button>
                    )}
                    {/* @ts-ignore */}
                    <Slider
                        range
                        min={GLOBAL_MIN_TEMP}
                        max={GLOBAL_MAX_TEMP}
                        step={TEMP_STEP}
                        value={tempRange}
                        onChange={handleTemperatureChange}
                        onChangeComplete={handleTemperatureAfterChange} // Geändert von onAfterChange
                        allowCross={false}
                        disabled={disabled}
                        className="mb-2 rc-slider-tailwind" // Eigene Klasse für potenzielles Override-Styling
                        handleStyle={[
                            { borderColor: '#3B82F6', backgroundColor: 'white', borderWidth: 2, height: 18, width: 18, marginTop: -7, opacity: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
                            { borderColor: '#3B82F6', backgroundColor: 'white', borderWidth: 2, height: 18, width: 18, marginTop: -7, opacity: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
                        ]}
                        trackStyle={[{ backgroundColor: '#3B82F6', height: 6 }]} // Etwas dicker für bessere Klickbarkeit
                        railStyle={{ backgroundColor: '#E5E7EB', height: 6 }}
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                        <span>{tempRange[0]}°C</span>
                        <span>{tempRange[1]}°C</span>
                    </div>
                </div>
            </Transition>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;