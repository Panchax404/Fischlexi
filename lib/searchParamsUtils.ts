import type { FilterState } from './types';

const GLOBAL_MIN_TEMP = 0;
const GLOBAL_MAX_TEMP = 40;
const GLOBAL_MIN_PH = 0.0;
const GLOBAL_MAX_PH = 14.0;

export const parseSearchParams = (searchParams: { [key: string]: string | string[] | undefined }): FilterState => {

    const getArray = (key: string): string[] | undefined => {
        const val = searchParams[key];
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') return [val];
        return undefined;
    };

    const getNumber = (key: string): number | null => {
        const val = searchParams[key];
        if (typeof val === 'string') {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? null : parsed;
        }
        return null;
    };

    const filters: Partial<FilterState> = {};

    filters.haltung = getArray('haltung');
    filters.ernahrung = getArray('ernahrung');
    filters.schwimmhoehe = getArray('schwimmhoehe');
    filters.herkunft = getArray('herkunft');

    // Temperature
    const tempMin = getNumber('temp_min');
    const tempMax = getNumber('temp_max');
    if (tempMin !== null || tempMax !== null) {
        filters.temperatur = {
            min: tempMin ?? GLOBAL_MIN_TEMP,
            max: tempMax ?? GLOBAL_MAX_TEMP
        };
    }

    // pH
    const phMin = getNumber('ph_min');
    const phMax = getNumber('ph_max');
    if (phMin !== null || phMax !== null) {
        filters.phWert = {
            min: phMin ?? GLOBAL_MIN_PH,
            max: phMax ?? GLOBAL_MAX_PH
        };
    }

    // Hardness
    const hardnessMin = getNumber('hardness_min');
    const hardnessMax = getNumber('hardness_max');
    if (hardnessMin !== null || hardnessMax !== null) {
        filters.hardness = {
            min: hardnessMin ?? 0,
            max: hardnessMax ?? 50
        };
    }

    // Liters
    const litersMin = getNumber('liters_min');
    if (litersMin !== null) {
        filters.liters = litersMin;
    }

    // Length
    const lengthMin = getNumber('length_min');
    if (lengthMin !== null) {
        filters.length = lengthMin;
    }

    return filters as FilterState;
};
