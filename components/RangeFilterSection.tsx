// components/RangeFilterSection.tsx
'use client';

import React, { useState, Fragment, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { ChevronDownIcon, XCircleIcon } from '@heroicons/react/24/solid';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import '../src/app/styles/rc-slider-overrides.css';

interface RangeFilterSectionProps {
    title: string;
    minValue: number;
    maxValue: number;
    step: number;
    currentValue: { min: number; max: number } | undefined;
    onChange: (value: { min: number; max: number } | undefined) => void;
    unit?: string;
    disabled?: boolean;
}

const RangeFilterSection: React.FC<RangeFilterSectionProps> = ({
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

    // Default to 'range'
    const [mode, setMode] = useState<'range' | 'single'>('range');

    const [localRange, setLocalRange] = useState<[number, number]>([minValue, maxValue]);
    const [singleValue, setSingleValue] = useState<number>(minValue);

    // Inputs
    const [minInput, setMinInput] = useState<string>('');
    const [maxInput, setMaxInput] = useState<string>('');
    const [singleInput, setSingleInput] = useState<string>('');

    const isActive = currentValue !== undefined && (currentValue.min !== minValue || currentValue.max !== maxValue);

    const formatValue = (val: number) => Number.isInteger(step) ? String(val) : val.toFixed(1);

    // Sync from Props
    useEffect(() => {
        const min = currentValue?.min ?? minValue;
        const max = currentValue?.max ?? maxValue;

        setLocalRange([min, max]);
        setMinInput(formatValue(min));
        setMaxInput(formatValue(max));

        const single = min;
        setSingleValue(single);
        setSingleInput(formatValue(single));
    }, [currentValue, minValue, maxValue, step]);

    // Slider Handlers
    const handleRangeSliderChange = (value: number | number[]) => {
        if (Array.isArray(value) && value.length === 2) {
            setLocalRange([value[0], value[1]]);
            setMinInput(formatValue(value[0]));
            setMaxInput(formatValue(value[1]));
        }
    };

    const handleSingleSliderChange = (value: number | number[]) => {
        if (typeof value === 'number') {
            setSingleValue(value);
            setSingleInput(formatValue(value));
        }
    };

    // Commits
    const handleRangeCommit = (value: number | number[]) => {
        if (Array.isArray(value) && value.length === 2) {
            updateParent(value[0], value[1]);
        }
    };

    const handleSingleCommit = (value: number | number[]) => {
        if (typeof value === 'number') {
            updateParent(value, value);
        }
    };

    // Input Apps
    const applyRangeInputs = () => {
        let min = parseFloat(minInput);
        let max = parseFloat(maxInput);
        if (isNaN(min)) min = minValue;
        if (isNaN(max)) max = maxValue;

        min = Math.max(minValue, Math.min(min, maxValue));
        max = Math.max(minValue, Math.min(max, maxValue));
        if (min > max) { const t = min; min = max; max = t; }

        if (step >= 1) { min = Math.round(min); max = Math.round(max); }
        else { min = parseFloat(min.toFixed(1)); max = parseFloat(max.toFixed(1)); }

        setLocalRange([min, max]);
        setMinInput(formatValue(min));
        setMaxInput(formatValue(max));
        updateParent(min, max);
    };

    const applySingleInputVal = () => {
        let val = parseFloat(singleInput);
        if (isNaN(val)) val = minValue;
        val = Math.max(minValue, Math.min(val, maxValue));
        if (step >= 1) val = Math.round(val);
        else val = parseFloat(val.toFixed(1));

        setSingleValue(val);
        setSingleInput(formatValue(val));
        updateParent(val, val);
    };

    const updateParent = (min: number, max: number) => {
        if (min === minValue && max === maxValue) {
            onChange(undefined);
        } else {
            onChange({ min, max });
        }
    };

    const handleReset = () => {
        setLocalRange([minValue, maxValue]);
        setSingleValue(minValue);
        setMinInput(formatValue(minValue));
        setMaxInput(formatValue(maxValue));
        setSingleInput(formatValue(minValue));
        onChange(undefined);
    };

    // Styles
    const sliderHandleStyle = {
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsl(var(--background))',
        width: 20,
        height: 20,
        marginTop: -8,
        borderWidth: 2,
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        opacity: 1,
        zIndex: 10,
    };
    const sliderTrackStyle = {
        backgroundColor: 'hsl(var(--primary))',
        height: 4,
        borderRadius: 2,
    };
    const sliderRailStyle = {
        backgroundColor: 'hsl(var(--muted))',
        height: 4,
        borderRadius: 2,
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
                            {currentValue!.min === currentValue!.max
                                ? `${formatValue(currentValue!.min)}${unit}`
                                : `${formatValue(currentValue!.min)}${unit} - ${formatValue(currentValue!.max)}${unit}`}
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

                    <div className="flex justify-between items-center mb-4">
                        <div className="flex space-x-1 bg-muted/50 p-1 rounded-lg">
                            <button
                                onClick={() => setMode('single')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === 'single' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Exakt
                            </button>
                            <button
                                onClick={() => setMode('range')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === 'range' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Bereich
                            </button>
                        </div>

                        {isActive && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="text-xs text-destructive hover:text-destructive/80 flex items-center font-medium"
                                disabled={disabled}
                            >
                                Zurücksetzen
                            </button>
                        )}
                    </div>

                    {mode === 'single' ? (
                        <>
                            <div className="mb-4">
                                <label htmlFor={`single-input-${title}`} className="block text-xs font-medium text-muted-foreground mb-1">Wert ({unit})</label>
                                <input
                                    type="number"
                                    id={`single-input-${title}`}
                                    value={singleInput}
                                    onChange={(e) => setSingleInput(e.target.value)}
                                    onBlur={applySingleInputVal}
                                    onKeyDown={(e) => e.key === 'Enter' && applySingleInputVal()}
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
                                    value={singleValue}
                                    onChange={handleSingleSliderChange}
                                    onChangeComplete={handleSingleCommit}
                                    disabled={disabled}
                                    className="mb-3 custom-rc-slider"
                                    // @ts-ignore
                                    handleStyle={sliderHandleStyle}
                                    // @ts-ignore
                                    trackStyle={sliderTrackStyle}
                                    // @ts-ignore
                                    railStyle={sliderRailStyle}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="flex-1">
                                    <label htmlFor={`min-input-${title}`} className="block text-xs font-medium text-muted-foreground mb-1">Min ({unit})</label>
                                    <input
                                        type="number"
                                        id={`min-input-${title}`}
                                        value={minInput}
                                        onChange={(e) => setMinInput(e.target.value)}
                                        onBlur={applyRangeInputs}
                                        onKeyDown={(e) => e.key === 'Enter' && applyRangeInputs()}
                                        disabled={disabled}
                                        className="w-full h-9 px-3 border border-border bg-input rounded-md text-sm shadow-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                        step={step}
                                    />
                                </div>
                                <div className="pt-5 text-muted-foreground">-</div>
                                <div className="flex-1">
                                    <label htmlFor={`max-input-${title}`} className="block text-xs font-medium text-muted-foreground mb-1">Max ({unit})</label>
                                    <input
                                        type="number"
                                        id={`max-input-${title}`}
                                        value={maxInput}
                                        onChange={(e) => setMaxInput(e.target.value)}
                                        onBlur={applyRangeInputs}
                                        onKeyDown={(e) => e.key === 'Enter' && applyRangeInputs()}
                                        disabled={disabled}
                                        className="w-full h-9 px-3 border border-border bg-input rounded-md text-sm shadow-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                        step={step}
                                    />
                                </div>
                            </div>
                            <div className="px-2 pt-2 pb-1">
                                {/* @ts-ignore */}
                                <Slider
                                    range
                                    min={minValue}
                                    max={maxValue}
                                    step={step}
                                    value={localRange}
                                    onChange={handleRangeSliderChange}
                                    onChangeComplete={handleRangeCommit}
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
                        </>
                    )}

                    <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
                        <span>{minValue}{unit}</span>
                        <span>{maxValue}{unit}</span>
                    </div>
                </div>
            </Transition>
        </div>
    );
};

export default RangeFilterSection;
