'use client';

import React, { useState, Fragment, useEffect } from 'react';
import OriginFilter from './OriginFilter';
import { FilterState, FilterOptions } from '../lib/types';
import { Transition } from '@headlessui/react';
import { ChevronDownIcon, XCircleIcon } from '@heroicons/react/24/solid';
import RangeFilterSection from './RangeFilterSection';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import '../src/app/styles/rc-slider-overrides.css';

type FilterBarProps = {
  filter: FilterState;
  setFilter: (f: FilterState | ((prevState: FilterState) => FilterState)) => void;
  options: FilterOptions;
  disabled?: boolean;
};



type CheckboxFilterKeys = keyof Omit<FilterState, 'temperatur' | 'phWert' | 'hardness' | 'liters' | 'length'>;

interface AccordionFilterSectionProps {
  title: string;
  filterKey: CheckboxFilterKeys;
  options: string[];
  selectedValues: string[] | undefined;
  onCheckboxChange: (filterKey: CheckboxFilterKeys, value: string) => void;
  onResetFilter: (filterKey: CheckboxFilterKeys) => void;
  disabled?: boolean;
}

// Global constants
const GLOBAL_MIN_TEMP = 0;
const GLOBAL_MAX_TEMP = 40;
const TEMP_STEP = 1;

const GLOBAL_MIN_PH = 0.0;
const GLOBAL_MAX_PH = 14.0;
const PH_STEP = 0.1;

const GLOBAL_MIN_HARDNESS = 0;
const GLOBAL_MAX_HARDNESS = 50;
const HARDNESS_STEP = 1;

const GLOBAL_MIN_LITERS = 0;
const GLOBAL_MAX_LITERS = 1000;
const LITERS_STEP = 10;

const GLOBAL_MIN_LENGTH = 0;
const GLOBAL_MAX_LENGTH = 300;
const LENGTH_STEP = 10;

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
        className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold transition-all duration-200
                    ${isOpen ? 'bg-accent text-accent-foreground rounded-t-xl' : 'bg-card text-card-foreground border border-border rounded-xl hover:border-primary/50 hover:shadow-sm'}`}
      >
        <span>
          {title}
          {numSelected > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-primary">
              {numSelected}
            </span>
          )}
        </span>
        <ChevronDownIcon className={`w-4 h-4 text-muted-foreground transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <Transition
        as={Fragment}
        show={isOpen}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-2"
      >
        <div className="px-4 pt-3 pb-4 border-x border-b border-border rounded-b-xl bg-card shadow-sm">
          {numSelected > 0 && (
            <button type="button" onClick={() => onResetFilter(filterKey)} className="mb-3 text-xs text-destructive hover:text-destructive/80 flex items-center font-medium" disabled={disabled}>
              <XCircleIcon className="w-4 h-4 mr-1" />
              Zurücksetzen
            </button>
          )}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            {visibleOptions.map(opt => (
              <label key={opt} className="flex items-center py-1 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(opt)}
                    onChange={() => onCheckboxChange(filterKey, opt)}
                    disabled={disabled}
                    className="checkbox-custom h-4 w-4 text-primary bg-background border-input rounded focus:ring-primary"
                  />
                </div>
                <span className="ml-3 text-sm text-foreground group-hover:text-primary transition-colors select-none">
                  {opt}
                </span>
              </label>
            ))}
          </div>
          {options.length > initialVisibleCount && (
            <button type="button" onClick={() => setShowAll(!showAll)} className="mt-3 text-xs font-medium text-primary hover:text-primary/80" disabled={disabled}>
              {showAll ? 'Weniger anzeigen' : `Alle ${options.length} anzeigen`}
            </button>
          )}
        </div>
      </Transition>
    </div>
  );
};


interface SingleSliderFilterSectionProps {
  title: string;
  minValue: number;
  maxValue: number;
  step: number;
  currentValue: number | undefined;
  onChange: (value: number | undefined) => void;
  unit?: string;
  disabled?: boolean;
}

const SingleSliderFilterSection: React.FC<SingleSliderFilterSectionProps> = ({
  title,
  minValue,
  maxValue,
  step,
  currentValue,
  onChange,
  unit = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState<number>(minValue);
  const [inputValue, setInputValue] = useState<string>('');

  const isActive = currentValue !== undefined;

  const formatValue = (val: number) => Number.isInteger(step) ? String(val) : val.toFixed(1);

  useEffect(() => {
    const val = currentValue ?? minValue;
    setLocalValue(val);
    setInputValue(formatValue(val));
  }, [currentValue, minValue, step]);

  const handleSliderChange = (val: number | number[]) => {
    if (typeof val === 'number') {
      setLocalValue(val);
      setInputValue(formatValue(val));
    }
  };

  const handleCommit = (val: number | number[]) => {
    if (typeof val === 'number') {
      onChange(val === minValue ? undefined : val);
    }
  };

  const applyInput = () => {
    let val = parseFloat(inputValue);
    if (isNaN(val)) val = minValue;
    val = Math.max(minValue, Math.min(val, maxValue));
    if (step >= 1) val = Math.round(val);
    else val = parseFloat(val.toFixed(1));

    setLocalValue(val);
    setInputValue(formatValue(val));
    onChange(val === minValue ? undefined : val);
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold transition-all duration-200
                    ${isOpen ? 'bg-accent text-accent-foreground rounded-t-xl' : 'bg-card text-card-foreground border border-border rounded-xl hover:border-primary/50 hover:shadow-sm'}`}
      >
        <span>
          {title}
          {isActive && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-primary">
              ab {formatValue(currentValue!)}{unit}
            </span>
          )}
        </span>
        <ChevronDownIcon className={`w-4 h-4 text-muted-foreground transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <Transition
        as={Fragment}
        show={isOpen}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-2"
      >
        <div className="px-4 py-4 border-x border-b border-border rounded-b-xl bg-card shadow-sm">
          <div className="flex justify-end mb-2">
            {isActive && (
              <button
                type="button"
                onClick={() => onChange(undefined)}
                className="text-xs text-destructive hover:text-destructive/80 flex items-center font-medium"
                disabled={disabled}
              >
                <XCircleIcon className="w-4 h-4 mr-1" />
                Zurücksetzen
              </button>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Mindestwert ({unit})</label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={applyInput}
              onKeyDown={(e) => e.key === 'Enter' && applyInput()}
              disabled={disabled}
              className="w-full h-9 px-3 border border-border bg-input rounded-md text-sm shadow-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
              step={step}
            />
          </div>

          <div className="px-2 pt-2 pb-1">
            {/* @ts-ignore */}
            <Slider
              min={minValue}
              max={maxValue}
              step={step}
              value={localValue}
              onChange={handleSliderChange}
              onChangeComplete={handleCommit}
              disabled={disabled}
              className="mb-3 custom-rc-slider"
              // @ts-ignore
              handleStyle={{
                borderColor: 'hsl(var(--primary))',
                backgroundColor: 'hsl(var(--background))',
                width: 20,
                height: 20,
                marginTop: -8,
                borderWidth: 2,
                boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
                opacity: 1,
                zIndex: 10,
              }}
              // @ts-ignore
              trackStyle={{ backgroundColor: 'hsl(var(--primary))', height: 4, borderRadius: 2 }}
              // @ts-ignore
              railStyle={{ backgroundColor: 'hsl(var(--muted))', height: 4, borderRadius: 2 }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
            <span>{minValue}{unit}</span>
            <span>{maxValue}{unit}</span>
          </div>
        </div>
      </Transition>
    </div>
  );
};


const FilterBar: React.FC<FilterBarProps> = ({ filter, setFilter, options, disabled }) => {

  const handleCheckboxChange = (filterKey: CheckboxFilterKeys, value: string) => {
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

  const handleResetFilter = (filterKey: CheckboxFilterKeys) => {
    setFilter(prevFilter => {
      const updatedFilter = { ...prevFilter };
      delete updatedFilter[filterKey];
      return updatedFilter;
    });
  };

  const handleRangeChange = (key: 'temperatur' | 'phWert' | 'hardness', value: { min: number; max: number } | undefined) => {
    setFilter(prev => {
      const newFilter = { ...prev };
      if (value === undefined) {
        delete newFilter[key];
      } else {
        newFilter[key] = value;
      }
      return newFilter;
    });
  };

  const handleSingleChange = (key: 'liters' | 'length', value: number | undefined) => {
    setFilter(prev => {
      const newFilter = { ...prev };
      if (value === undefined) {
        delete newFilter[key];
      } else {
        newFilter[key] = value;
      }
      return newFilter;
    });
  };

  const hasActiveFilters = Object.keys(filter).length > 0;

  return (
    <div className="bg-background/50 backdrop-blur-md border border-border/50 p-6 rounded-3xl shadow-sm mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-foreground flex items-center">
          <span className="mr-2">🎛️</span> Filter
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => setFilter({})}
            className="px-3 py-1.5 text-xs font-medium bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors flex items-center"
            disabled={disabled}
          >
            <XCircleIcon className="w-4 h-4 mr-1" />
            Alle löschen
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          title="Kategorie"
          filterKey="schwimmhoehe"
          // Mapping "Schwimmhöhe" is weird contextually but keeping key as is, changing Title maybe? Or stick to domain.
          // Schwimmhöhe is actually Swimming Zone.
          options={options.schwimmhoehe || []}
          selectedValues={filter.schwimmhoehe}
          onCheckboxChange={handleCheckboxChange}
          onResetFilter={handleResetFilter}
          disabled={disabled}
        />
        <OriginFilter
          options={options.herkunft || []}
          selectedValues={filter.herkunft}
          onCheckboxChange={(val) => handleCheckboxChange('herkunft', val)}
          onResetFilter={() => handleResetFilter('herkunft')}
          disabled={disabled}
        />

        <RangeFilterSection
          title="Wassertemperatur"
          minValue={options.bounds?.temperatur.min ?? GLOBAL_MIN_TEMP}
          maxValue={options.bounds?.temperatur.max ?? GLOBAL_MAX_TEMP}
          step={TEMP_STEP}
          currentValue={filter.temperatur}
          onChange={(val) => handleRangeChange('temperatur', val)}
          unit="°C"
          disabled={disabled}
        />

        <RangeFilterSection
          title="pH-Wert"
          minValue={options.bounds?.phWert.min ?? GLOBAL_MIN_PH}
          maxValue={options.bounds?.phWert.max ?? GLOBAL_MAX_PH}
          step={PH_STEP}
          currentValue={filter.phWert}
          onChange={(val) => handleRangeChange('phWert', val)}
          disabled={disabled}
        />

        <RangeFilterSection
          title="Wasserhärte"
          minValue={options.bounds?.hardness?.min ?? GLOBAL_MIN_HARDNESS}
          maxValue={options.bounds?.hardness?.max ?? GLOBAL_MAX_HARDNESS}
          step={HARDNESS_STEP}
          currentValue={filter.hardness}
          onChange={(val) => handleRangeChange('hardness', val)}
          unit="dH"
          disabled={disabled}
        />

        <SingleSliderFilterSection
          title="Aquariumgröße"
          minValue={options.bounds?.liters?.min ?? GLOBAL_MIN_LITERS}
          maxValue={options.bounds?.liters?.max ?? GLOBAL_MAX_LITERS}
          step={LITERS_STEP}
          currentValue={filter.liters}
          onChange={(val) => handleSingleChange('liters', val)}
          unit="L"
          disabled={disabled}
        />

        <SingleSliderFilterSection
          title="Kantenlänge Aquarium"
          minValue={options.bounds?.length?.min ?? GLOBAL_MIN_LENGTH}
          maxValue={options.bounds?.length?.max ?? GLOBAL_MAX_LENGTH}
          step={LENGTH_STEP}
          currentValue={filter.length}
          onChange={(val) => handleSingleChange('length', val)}
          unit="cm"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default FilterBar;