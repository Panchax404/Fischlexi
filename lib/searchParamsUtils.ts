import type { FilterState } from './types';

export const parseSearchParams = (
    searchParams: { [key: string]: string | string[] | undefined }
): FilterState => {

    const getArray = (key: string): string[] | undefined => {
        const val = searchParams[key];
        if (Array.isArray(val)) return val.filter(Boolean);
        if (typeof val === 'string' && val.length > 0) return [val];
        return undefined;
    };

    const getNumber = (key: string): number | null => {
        const raw = searchParams[key];
        const val = Array.isArray(raw) ? raw[0] : raw;
        if (typeof val !== 'string') return null;
        const parsed = Number.parseFloat(val);
        return Number.isFinite(parsed) ? parsed : null;
    };

    // Kanonische Repräsentation: ein Schlüssel existiert NUR, wenn der Filter
    // tatsächlich gesetzt ist. Eine Zuweisung von undefined würde die Property
    // anlegen und Object.keys(filter).length verfälschen (siehe FilterBar).
    const filters: FilterState = {};

    const haltung = getArray('haltung');
    if (haltung?.length) filters.haltung = haltung;

    const ernahrung = getArray('ernahrung');
    if (ernahrung?.length) filters.ernahrung = ernahrung;

    const schwimmhoehe = getArray('schwimmhoehe');
    if (schwimmhoehe?.length) filters.schwimmhoehe = schwimmhoehe;

    const herkunft = getArray('herkunft');
    if (herkunft?.length) filters.herkunft = herkunft;

    // Bereichsfilter: halboffene Bereiche werden als halboffen repräsentiert.
    // Ein Auffüllen mit hartkodierten Konstanten (vorher 0..40 / 0..14) driftet
    // zwangsläufig von den echten DB-Grenzen ab und führt zu Badges mit Werten,
    // die der Slider nicht darstellen kann.
    const assignRange = (
        key: 'temperatur' | 'phWert' | 'hardness',
        minKey: string,
        maxKey: string
    ) => {
        const min = getNumber(minKey);
        const max = getNumber(maxKey);
        if (min === null && max === null) return;

        // Vertauschte Grenzen normalisieren, statt eine leere Menge zu erzeugen.
        const lo = min ?? max!;
        const hi = max ?? min!;
        filters[key] = lo <= hi ? { min: lo, max: hi } : { min: hi, max: lo };
    };

    assignRange('temperatur', 'temp_min', 'temp_max');
    assignRange('phWert', 'ph_min', 'ph_max');
    assignRange('hardness', 'hardness_min', 'hardness_max');

    const liters = getNumber('liters_min');
    if (liters !== null && liters >= 0) filters.liters = liters;

    const length = getNumber('length_min');
    if (length !== null && length >= 0) filters.length = length;

    return filters;
};

/**
 * Prüft wertbasiert, ob mindestens ein Filter aktiv ist.
 *
 * Bewusst NICHT über Object.keys(...).length: eine Property mit dem Wert
 * undefined existiert in JS und hätte dieselbe Regression zur Folge, die
 * FilterBar.tsx:357 zeigte (Button permanent sichtbar).
 */
export const hasAnyActiveFilter = (filters: Partial<FilterState> | undefined | null): boolean => {
    if (!filters) return false;
    return Object.values(filters).some((v) => {
        if (v === undefined || v === null) return false;
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === 'object') {
            return Object.values(v).some((innerVal) => innerVal !== undefined && innerVal !== null);
        }
        return true;
    });
};
