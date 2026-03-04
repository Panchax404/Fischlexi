'use client';

import React, { useState, Fragment, useMemo } from 'react';
import { Transition } from '@headlessui/react';
import { ChevronDownIcon, XCircleIcon, CheckIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { Origin } from '../lib/types';

interface OriginFilterProps {
    options: Origin[];
    selectedValues: string[] | undefined; // IDs as strings
    onCheckboxChange: (value: string) => void;
    onResetFilter: () => void;
    disabled?: boolean;
}

type Tab = 'ort' | 'gebiet';

const OriginFilter: React.FC<OriginFilterProps> = ({
    options,
    selectedValues = [],
    onCheckboxChange,
    onResetFilter,
    disabled
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('ort');
    const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

    // Helper to toggle node expansion
    const toggleExpand = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Build Tree
    const { rootsOrt, rootsGebiet, childrenMap } = useMemo(() => {
        const rootsOrt: Origin[] = [];
        const rootsGebiet: Origin[] = [];
        const childrenMap = new Map<number, Origin[]>();

        options.forEach(opt => {
            if (opt.parent_id) {
                if (!childrenMap.has(opt.parent_id)) childrenMap.set(opt.parent_id, []);
                childrenMap.get(opt.parent_id)!.push(opt);
            } else {
                // Root nodes - usually Continents
                // We put Continents in BOTH tabs? Or split logic?
                // User wanted "Ort" (Europe -> Germany) and "Gebiet" (S.America -> Amazon)
                // Usually Continents are the root for both.
                // We will show Continents in both, but filter CHILDREN based on type.
                rootsOrt.push(opt);
                rootsGebiet.push(opt);
            }
        });

        return { rootsOrt, rootsGebiet, childrenMap };
    }, [options]);

    // Recursive Tree Node Renderer
    const renderNode = (node: Origin, depth = 0) => {
        const children = childrenMap.get(node.id) || [];

        // FILTER CHILDREN driven by Tab?
        // Ort Tab: Show Countries, Continents. Hide Region/Waterbody?
        // Gebiet Tab: Show Region, Waterbody, Continents. Hide Country?

        // Logic:
        // Tab 'ort': Show if type is 'continent' or 'country' or 'other'.
        // Tab 'gebiet': Show if type is 'continent' or 'region' or 'waterbody' or 'other'.

        const relevantChildren = children.filter(child => {
            if (activeTab === 'ort') return child.type === 'country' || child.type === 'continent'; // Continent children of continent? unlikely.
            if (activeTab === 'gebiet') return child.type === 'region' || child.type === 'waterbody';
            return true;
        });

        // If leaf node and not relevant to current tab, typically we shouldn't even render it?
        // But what if a 'country' has 'regions'? (e.g. USA -> Florida Everglades)
        // Complex. Let's stick to the user's simpler request: 
        // Ort: Europe -> Germany
        // Gebiet: SouthAmerica -> Amazon

        // If a node is a COMPATIBLE type for the tab, we show it.
        // Roots (Continents) are always shown.

        const isRelevantForTab = (
            node.type === 'continent' ||
            (activeTab === 'ort' && node.type === 'country') ||
            (activeTab === 'gebiet' && (node.type === 'region' || node.type === 'waterbody'))
        );

        if (!isRelevantForTab) return null;

        const hasChildren = relevantChildren.length > 0;
        const isExpanded = expandedNodes.has(node.id);
        const isSelected = selectedValues.includes(String(node.id));

        return (
            <div key={node.id} className="select-none">
                <div
                    className={`flex items-center py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${depth > 0 ? 'ml-3 border-l border-border/40 pl-3' : ''}`}
                    onClick={() => onCheckboxChange(String(node.id))}
                >
                    {/* Checkbox */}
                    <div className={`w-4 h-4 mr-3 flex items-center justify-center rounded border transition-all ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background'}`}>
                        {isSelected && <CheckIcon className="w-3 h-3" />}
                    </div>

                    {/* Label */}
                    <span className={`text-sm flex-grow ${isSelected ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {node.name}
                        {/* Debug Type Badge? No, clear enough by tab */}
                    </span>

                    {/* Expand Button */}
                    {hasChildren && (
                        <button
                            type="button"
                            onClick={(e) => toggleExpand(node.id, e)}
                            className="p-1 rounded-md hover:bg-muted text-muted-foreground"
                        >
                            <ChevronRightIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                    )}
                </div>

                {/* Children Recursion */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    {hasChildren && (
                        <div className="mt-1">
                            {relevantChildren.map(child => renderNode(child, depth + 1))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const currentRoots = activeTab === 'ort' ? rootsOrt : rootsGebiet;
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
                    Herkunft
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
                <div className="border-x border-b border-border rounded-b-xl bg-card shadow-sm overflow-hidden">

                    {/* Tabs Header */}
                    <div className="flex border-b border-border bg-muted/30">
                        <button
                            onClick={() => setActiveTab('ort')}
                            className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors relative
                        ${activeTab === 'ort' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            📍 Orte
                            {activeTab === 'ort' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                        <div className="w-px bg-border" />
                        <button
                            onClick={() => setActiveTab('gebiet')}
                            className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors relative
                        ${activeTab === 'gebiet' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            🗺️ Gebiete
                            {activeTab === 'gebiet' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                    </div>

                    <div className="px-4 py-3">
                        {numSelected > 0 && (
                            <button type="button" onClick={onResetFilter} className="mb-3 text-xs text-destructive hover:text-destructive/80 flex items-center font-medium" disabled={disabled}>
                                <XCircleIcon className="w-4 h-4 mr-1" />
                                Zurücksetzen
                            </button>
                        )}

                        <div className="max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                            {/* Render Roots */}
                            {currentRoots.map(root => renderNode(root))}
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
    );
};

export default OriginFilter;
