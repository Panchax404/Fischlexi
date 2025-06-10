// components/FilterBar.tsx
'use client';
import React, { useState, Fragment, useEffect } from 'react';
import { Transition } from '@headlessui/react'; // Für schöne Animationen (npm install @headlessui/react)
import { ChevronDownIcon, XCircleIcon } from '@heroicons/react/24/solid'; // Optionale Icons

import Slider from 'rc-slider'; // Nur 'Slider' importieren
import 'rc-slider/assets/index.css'; // Importiere das Standard-CSS für rc-slider
  
export type FilterState = {
  haltung?: string[];       // Array!
  ernahrung?: string[];     // Array!
  temperatur?: { min: number; max: number }; 
  schwimmhoehe?: string[];  // Array!
  herkunft?: string[];      // Array!
};

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
  filterKey: keyof Omit<FilterState, 'temperatur'>;
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
  const [isOpen, setIsOpen] = useState(false); // Initial geschlossen
  const [showAll, setShowAll] = useState(false);
  const initialVisibleCount = 5; // Oder eine andere Zahl deiner Wahl
  const visibleOptions = showAll ? options : options.slice(0, initialVisibleCount);

  if (!options || options.length === 0) return null;

  const numSelected = selectedValues.length;

  return (
    <div className="w-full"> {/* Kein Rahmen/Schatten hier direkt */}
      {/* Header der Sektion zum Klicken */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-700 
                    hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75
                    transition-colors duration-150
                    ${isOpen ? 'bg-gray-100 rounded-t-lg' : 'bg-gray-50 rounded-lg shadow-sm hover:shadow-md'}`} // Dynamisches Styling für Header
      >
        <span>
          {title}
          {numSelected > 0 && (
            <span className={`ml-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold 
                              ${isOpen ? 'bg-blue-200 text-blue-800' : 'bg-blue-100 text-blue-700'}`}>
              {numSelected} ausgewählt
            </span>
          )}
        </span>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Aufklappbarer Inhalt mit Animation */}
      <Transition
        as={Fragment}
        show={isOpen}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 -translate-y-1" // Leichte Animation von oben
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-1"
      >
        <div className="px-4 pt-3 pb-4 border border-t-0 border-gray-200 rounded-b-lg shadow-sm bg-white"> {/* Kein bg-white hier, da Elternelement es hat */}
          {numSelected > 0 && (
             <button
              type="button"
              onClick={() => onResetFilter(filterKey)}
              className="mb-3 text-xs text-red-600 hover:text-red-800 flex items-center"
              disabled={disabled}
            >
              <XCircleIcon className="w-4 h-4 mr-1" />
              Filter zurücksetzen
            </button>
          )}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {visibleOptions.map(opt => (
              <div key={opt} className="flex items-center">
                <input
                  id={`${filterKey}-${opt.replace(/\s+/g, '-')}`}
                  name={`${filterKey}-${opt.replace(/\s+/g, '-')}`}
                  type="checkbox"
                  checked={selectedValues.includes(opt)}
                  onChange={() => onCheckboxChange(filterKey, opt)}
                  disabled={disabled}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`${filterKey}-${opt.replace(/\s+/g, '-')}`} className="ml-3 block text-sm text-gray-800 select-none cursor-pointer">
                  {opt}
                </label>
              </div>
            ))}
          </div>
          {options.length > initialVisibleCount && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="mt-3 text-xs text-blue-600 hover:text-blue-800"
              disabled={disabled}
            >
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

  // Effekt, um den lokalen Slider-State zu aktualisieren, wenn sich der globale Filter ändert (z.B. durch URL)
  useEffect(() => {
    setTempRange([
      filter.temperatur?.min ?? GLOBAL_MIN_TEMP,
      filter.temperatur?.max ?? GLOBAL_MAX_TEMP,
    ]);
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

  const handleResetAllFilters = () => {
    const tempFilterValue = filter.temperatur; // Behalte ggf. den Temperaturfilter
    const newFilterState: Partial<FilterState> = {}; // Partial, da nicht alle Keys gesetzt sein müssen
    if (tempFilterValue) {
        newFilterState.temperatur = tempFilterValue;
    }
    setFilter(newFilterState as FilterState); // Cast, da wir wissen, dass es gültig ist
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
      // Nur aktualisieren, wenn sich der Bereich tatsächlich von den globalen Grenzen unterscheidet
      // oder wenn der Filter vorher schon aktiv war (und jetzt vielleicht auf globale Grenzen zurückgesetzt wurde)
      if ((min === GLOBAL_MIN_TEMP && max === GLOBAL_MAX_TEMP) && filter.temperatur) {
        // Wenn auf globale Grenzen zurückgesetzt, aber vorher ein Filter aktiv war -> Filter entfernen
        setFilter(prev => {
            const { temperatur, ...rest } = prev;
            return rest;
        });
      } else if (min !== GLOBAL_MIN_TEMP || max !== GLOBAL_MAX_TEMP) {
        // Wenn von globalen Grenzen abweichend -> Filter setzen/aktualisieren
        setFilter(prev => ({ ...prev, temperatur: { min, max } }));
      } else if (!filter.temperatur && (min !== GLOBAL_MIN_TEMP || max !== GLOBAL_MAX_TEMP)) {
        // Wenn vorher kein Filter, aber jetzt einer gesetzt wird (der nicht global ist)
        setFilter(prev => ({ ...prev, temperatur: { min, max } }));
      }
      // Kein else-Block nötig, wenn der Slider auf globalen Grenzen ist UND vorher kein Filter aktiv war.
    }
  };

  const resetTemperatureFilter = () => {
    setTempRange([GLOBAL_MIN_TEMP, GLOBAL_MAX_TEMP]); // Lokalen State zurücksetzen
    setFilter(prev => { // Globalen Filter zurücksetzen
      const { temperatur, ...rest } = prev;
      return rest;
    });
  };

  return (
    <div className="bg-gray-100 p-4 md:p-6 rounded-xl shadow-lg"> {/* Hintergrund und Padding für die gesamte Leiste */}
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800">Filteroptionen</h3>
        {(hasActiveMultiFilters || filter.temperatur) && ( // Auch Temperaturfilter berücksichtigen
            <button
                type="button"
                onClick={() => {
                    handleResetAllFilters(); // Setzt Checkboxen zurück
                    resetTemperatureFilter(); // Setzt Temperatur zurück
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

        
        {/* Temperatur-Filter mit Range Slider */}
        <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white col-span-1 sm:col-span-2 md:col-span-1">
            <div className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">
                <span>
                    Wassertemperatur
                    {/* Zeige Badge nur an, wenn der Filter aktiv ist (d.h. nicht den globalen Grenzen entspricht) */}
                    {(filter.temperatur && (filter.temperatur.min !== GLOBAL_MIN_TEMP || filter.temperatur.max !== GLOBAL_MAX_TEMP)) && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {tempRange[0]}°C - {tempRange[1]}°C
                    </span>
                    )}
                </span>
                {/* Zeige Reset-Button nur an, wenn der Filter aktiv ist */}
                {(filter.temperatur && (filter.temperatur.min !== GLOBAL_MIN_TEMP || filter.temperatur.max !== GLOBAL_MAX_TEMP)) && (
                    <button
                        type="button"
                        onClick={resetTemperatureFilter}
                        className="text-xs text-red-600 hover:text-red-800 flex items-center p-1 rounded-full hover:bg-red-100" // Etwas Styling für den Button
                        disabled={disabled}
                        aria-label="Temperaturfilter zurücksetzen"
                        >
                        <XCircleIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
            <div className="px-6 pt-4 pb-6 border-t border-gray-200">
                {/* TypeScript-Warnungen für die folgenden Props können ignoriert werden, wenn die Funktionalität gegeben ist */}
                {/* @ts-ignore ts(6385) */}
                <Slider
                    range
                    min={GLOBAL_MIN_TEMP}
                    max={GLOBAL_MAX_TEMP}
                    step={TEMP_STEP}
                    value={tempRange}
                    onChange={handleTemperatureChange}
                    onChangeComplete={handleTemperatureAfterChange} // Behalte dies, wenn es funktioniert
                    allowCross={false}
                    disabled={disabled}
                    className="mb-2"
                    // @ts-ignore ts(6385)
                    handleStyle={[
                        { borderColor: '#3B82F6', backgroundColor: 'white', borderWidth: 2, height: 18, width: 18, marginTop: -7, opacity: 1 },
                        { borderColor: '#3B82F6', backgroundColor: 'white', borderWidth: 2, height: 18, width: 18, marginTop: -7, opacity: 1 },
                    ]}
                    // @ts-ignore ts(6385)
                    trackStyle={[{ backgroundColor: '#3B82F6', height: 4 }]}
                    // @ts-ignore ts(6385)
                    railStyle={{ backgroundColor: '#E5E7EB', height: 4 }}
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{tempRange[0]}°C</span>
                    <span>{tempRange[1]}°C</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;