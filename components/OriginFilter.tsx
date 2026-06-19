'use client';

import React, { useState, useMemo, useCallback, useEffect, Fragment } from 'react';
import { Origin, OriginCrossRef } from '../lib/types';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ChevronDownIcon, ChevronRightIcon, CheckIcon, MinusIcon } from '@heroicons/react/24/solid';

interface OriginFilterProps {
    options: Origin[];
    crossRefs: OriginCrossRef[];
    selectedValues: string[] | undefined;
    onCheckboxChange?: (value: string) => void;
    onMultipleChange?: (values: string[]) => void;
    onResetFilter: () => void;
    disabled?: boolean;
}

type CheckState = 'checked' | 'unchecked' | 'indeterminate';

const TYPE_CONFIG: Record<string, { icon: string; label: string }> = {
    continent: { icon: '🌍', label: 'Kontinent' },
    country: { icon: '🏳️', label: 'Land' },
    region: { icon: '📍', label: 'Region' },
    waterbody: { icon: '💧', label: 'Gewässer' },
    other: { icon: '📌', label: 'Sonstiges' },
};



export default function OriginFilter({
    options,
    crossRefs,
    selectedValues = [],
    onMultipleChange,
    onCheckboxChange,
    onResetFilter,
    disabled
}: OriginFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    
    // Draft-Zustand, solange das Modal offen ist
    const [draftSelected, setDraftSelected] = useState<Set<string>>(new Set());
    const [expandedNodeIds, setExpandedNodeIds] = useState<Set<number>>(new Set());

    const joinedSelected = (selectedValues || []).join(',');

    // Synchronisiere den Draft-Status, beim Öffnen
    useEffect(() => {
        if (isOpen) {
            setDraftSelected(new Set(joinedSelected ? joinedSelected.split(',') : []));
        }
    }, [isOpen, joinedSelected]);

    // Graph Construction logic (wie bisher, sehr bewährt)
    const { childrenMap, roots, allDescendantSlugs } = useMemo(() => {
        const originById = new Map<number, Origin>();
        const childrenMap = new Map<number, Origin[]>();
        const roots: Origin[] = [];

        options.forEach(opt => {
            originById.set(opt.id, opt);
            if (opt.parent_id) {
                if (!childrenMap.has(opt.parent_id)) childrenMap.set(opt.parent_id, []);
                childrenMap.get(opt.parent_id)!.push(opt);
            } else if (opt.type !== 'waterbody') {
                roots.push(opt);
            }
        });

        // Resolve cross references
        crossRefs.forEach(cr => {
            const origin = originById.get(cr.origin_id);
            if (origin) {
                if (!childrenMap.has(cr.also_appears_under_id)) childrenMap.set(cr.also_appears_under_id, []);
                const existing = childrenMap.get(cr.also_appears_under_id)!;
                if (!existing.find(o => o.id === origin.id)) existing.push(origin);
            }
        });

        childrenMap.forEach(children => children.sort((a, b) => a.name.localeCompare(b.name, 'de')));

        const allDescendantSlugs = new Map<string, Set<string>>();
        const computeDescendants = (node: Origin): Set<string> => {
            if (allDescendantSlugs.has(node.slug)) return allDescendantSlugs.get(node.slug)!;
            const descendants = new Set<string>();
            const children = childrenMap.get(node.id) || [];
            for (const child of children) {
                descendants.add(child.slug);
                for (const d of computeDescendants(child)) descendants.add(d);
            }
            allDescendantSlugs.set(node.slug, descendants);
            return descendants;
        };
        options.forEach(o => computeDescendants(o));

        return { childrenMap, roots, allDescendantSlugs };
    }, [options, crossRefs]);

    const getCheckState = useCallback((node: Origin): CheckState => {
        if (draftSelected.has(node.slug)) return 'checked';

        const children = childrenMap.get(node.id) || [];
        if (children.length === 0) return 'unchecked';

        const childStates = children.map(c => getCheckState(c));
        const allChecked = childStates.every(s => s === 'checked');
        const someChecked = childStates.some(s => s === 'checked' || s === 'indeterminate');

        if (allChecked) return 'checked';
        if (someChecked) return 'indeterminate';
        return 'unchecked';
    }, [draftSelected, childrenMap]);

    const handleSelect = useCallback((node: Origin) => {
        setDraftSelected(prev => {
            const next = new Set(prev);
            const currentState = getCheckState(node);
            const descendants = allDescendantSlugs.get(node.slug) || new Set();

            if (currentState === 'unchecked' || currentState === 'indeterminate') {
                for (const d of Array.from(descendants)) next.delete(d);
                next.add(node.slug);
            } else {
                next.delete(node.slug);
                for (const d of Array.from(descendants)) next.delete(d);
            }
            return next;
        });
    }, [getCheckState, allDescendantSlugs]);

    const toggleExpand = useCallback((id: number) => {
        setExpandedNodeIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleApply = () => {
        if (onMultipleChange) {
            onMultipleChange(Array.from(draftSelected));
        } else if (onCheckboxChange) {
            onResetFilter();
            draftSelected.forEach(slug => onCheckboxChange(slug));
        }
        setIsOpen(false);
    };

    const renderCheckbox = (state: CheckState) => {
        const base = 'w-5 h-5 flex items-center justify-center rounded-[4px] border transition-all duration-150 flex-shrink-0 cursor-pointer';
        switch (state) {
            case 'checked':
                return (
                    <div className={`${base} bg-primary border-primary text-white shadow-sm`}>
                        <CheckIcon className="w-3.5 h-3.5 font-bold" />
                    </div>
                );
            case 'indeterminate':
                return (
                    <div className={`${base} bg-primary border-primary text-white shadow-sm`}>
                        <MinusIcon className="w-3.5 h-3.5" strokeWidth={3} />
                    </div>
                );
            default:
                return <div className={`${base} bg-input border-border/80 group-hover:border-primary/50`} />;
        }
    };

    const renderNode = (node: Origin, depth: number = 0) => {
        const children = childrenMap.get(node.id) || [];
        const hasChildren = children.length > 0;
        const isExpanded = expandedNodeIds.has(node.id);
        const state = getCheckState(node);
        const isRoot = depth === 0;

        return (
            <div key={node.id} className="flex flex-col">
                <div 
                    className={`flex items-center min-h-[44px] group hover:bg-muted/40 transition-colors 
                               ${depth === 0 ? 'border-b border-border/40' : ''}`}
                    style={{ paddingLeft: `${depth * 1.5 + 1.5}rem`, paddingRight: '1.5rem' }}
                >
                    {/* Expand/Collapse (Pfeil) */}
                    {hasChildren ? (
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
                            className="p-1 mr-1.5 -ml-1 rounded-md hover:bg-muted text-muted-foreground/50 hover:text-foreground flex-shrink-0"
                            aria-label="Aufklappen"
                        >
                            <ChevronRightIcon className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                    ) : (
                        <div className="w-6 flex-shrink-0 mr-1 -ml-1" /> // Platzhalter für Einrückung
                    )}

                    {/* Checkbox */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(node);
                            if (hasChildren) {
                                const willBeChecked = (state === 'unchecked' || state === 'indeterminate');
                                if (willBeChecked && !isExpanded) toggleExpand(node.id); // Aufklappen wenn Haken reinkommt
                                else if (!willBeChecked && isExpanded) toggleExpand(node.id); // Zuklappen wenn Haken rausgeht
                            }
                        }}
                        className="p-1 flex-shrink-0 outline-none"
                    >
                        {renderCheckbox(state)}
                    </button>

                    {/* Region-Name (klickbar um aufzuklappen UND selektieren) */}
                    <div 
                        className="flex items-center flex-grow cursor-pointer select-none py-3 ml-2 min-w-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(node);
                            if (hasChildren) {
                                const willBeChecked = (state === 'unchecked' || state === 'indeterminate');
                                if (willBeChecked && !isExpanded) toggleExpand(node.id); // Aufklappen wenn Haken reinkommt
                                else if (!willBeChecked && isExpanded) toggleExpand(node.id); // Zuklappen wenn Haken rausgeht
                            }
                        }}
                    >
                        <span className={`text-[15px] truncate ${state === 'checked' ? 'font-semibold text-foreground' : 'text-foreground/90'}`}>
                            {node.name}
                        </span>
                        
                        {/* Willhaben-Style: Counts nur für die Top-Level Kategorien anzeigen */}
                        <span className="ml-2 text-[13px] text-muted-foreground font-medium">
                            {node.fishCount || 0}
                        </span>
                    </div>
                </div>

                {/* Sub-Regionen */}
                {hasChildren && isExpanded && (
                    <div className="flex flex-col mt-0.5 mb-1 opacity-100">
                        {children.map(child => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full">
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                disabled={disabled}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold 
                           bg-card text-card-foreground border border-border rounded-xl hover:border-primary/50 hover:shadow-sm transition-all duration-200"
            >
                <span className="flex items-center gap-2">
                    <span>🌍</span>
                    <span>Region auswählen</span>
                    {selectedValues.length > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-primary">
                            {selectedValues.length}
                        </span>
                    )}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
            </button>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={() => setIsOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-full sm:translate-y-4 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-full sm:translate-y-4 sm:scale-95"
                            >
                                <Dialog.Panel className="relative w-full sm:max-w-[560px] h-[95vh] sm:h-[85vh] max-h-[850px] 
                                                         bg-card sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                                    
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shadow-sm z-10">
                                        <Dialog.Title className="text-xl font-bold text-foreground">
                                            Region auswählen
                                        </Dialog.Title>
                                        <button
                                            type="button"
                                            className="p-2 -mr-2 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40 text-muted-foreground transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <XMarkIcon className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {/* Modal Body */}
                                    <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2 pb-4 scrollbar-thin scrollbar-thumb-muted">
                                        {roots.length === 0 ? (
                                            <div className="p-8 text-center text-muted-foreground">Keine Regionen verfügbar</div>
                                        ) : (
                                            <div className="flex flex-col">
                                                {roots.map(root => renderNode(root, 0))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Modal Footer */}
                                    <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card z-10">
                                        <button
                                            type="button"
                                            className="text-[15px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted px-4 py-2.5 rounded-xl transition-all"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Abbrechen
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold px-10 py-3 rounded-xl shadow-lg transition-colors text-[16px]"
                                            onClick={handleApply}
                                        >
                                            Fertig
                                        </button>
                                    </div>
                                    
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
