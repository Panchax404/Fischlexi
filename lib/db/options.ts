import { getSupabasePublic } from '../supabaseClient'; // Pfad ggf. anpassen, je nachdem wo die Datei landet
import { unstable_cache } from 'next/cache';

const supabasePublic = getSupabasePublic();

export const getFilterOptions = unstable_cache(async () => {
    try {
        const results = await Promise.all([
            supabasePublic.from('keeping_types').select('name').order('name', { ascending: true }),
            supabasePublic.from('feeding_categories').select('name').order('name', { ascending: true }),
            supabasePublic.from('origins').select('id, name, origin_type, parent_id, slug, path').order('name', { ascending: true }),
            supabasePublic.from('swimming_zones').select('zone_name').order('zone_name', { ascending: true }),
            // M:N Beziehungen für Gewässer (Ebene 3) -> Länder (Ebene 2)
            supabasePublic.from('waterbody_countries').select('waterbody_id, country_id'),

            supabasePublic.from('fish').select('water_temperature_min_c').not('water_temperature_min_c', 'is', null).order('water_temperature_min_c', { ascending: true }).limit(1).single(),
            supabasePublic.from('fish').select('water_temperature_max_c').not('water_temperature_max_c', 'is', null).order('water_temperature_max_c', { ascending: false }).limit(1).single(),

            supabasePublic.from('fish').select('water_ph_min').not('water_ph_min', 'is', null).order('water_ph_min', { ascending: true }).limit(1).single(),
            supabasePublic.from('fish').select('water_ph_max').not('water_ph_max', 'is', null).order('water_ph_max', { ascending: false }).limit(1).single(),

            supabasePublic.from('fish').select('water_hardness_dh_min').not('water_hardness_dh_min', 'is', null).order('water_hardness_dh_min', { ascending: true }).limit(1).single(),
            supabasePublic.from('fish').select('water_hardness_dh_max').not('water_hardness_dh_max', 'is', null).order('water_hardness_dh_max', { ascending: false }).limit(1).single(),

            supabasePublic.from('fish').select('aquarium_min_liters').not('aquarium_min_liters', 'is', null).order('aquarium_min_liters', { ascending: true }).limit(1).single(),
            supabasePublic.from('fish').select('aquarium_min_liters').not('aquarium_min_liters', 'is', null).order('aquarium_min_liters', { ascending: false }).limit(1).single(),

            supabasePublic.from('fish').select('aquarium_min_edge_length_cm').not('aquarium_min_edge_length_cm', 'is', null).order('aquarium_min_edge_length_cm', { ascending: true }).limit(1).single(),
            supabasePublic.from('fish').select('aquarium_min_edge_length_cm').not('aquarium_min_edge_length_cm', 'is', null).order('aquarium_min_edge_length_cm', { ascending: false }).limit(1).single(),
            // Zähler aus der Materialized View
            supabasePublic.from('origin_fish_counts').select('origin_id, published_fish_count')
        ]);

        const keepingTypesRes = results[0];
        const feedingCategoriesRes = results[1];
        const originsRes = results[2];
        const swimmingZonesRes = results[3];
        const crossRefsRes = results[4];

        // Helper to extract value or default
        const getVal = (res: any, key: string, def: number) => res.data?.[key] ?? def;

        // Results array mapping (offset by 5 fixed queries)
        const minTempRes = results[5];
        const maxTempRes = results[6];
        const minPhRes = results[7];
        const maxPhRes = results[8];
        const minHardnessRes = results[9];
        const maxHardnessRes = results[10];
        const minLitersRes = results[11];
        const maxLitersRes = results[12];
        const minLengthRes = results[13];
        const maxLengthRes = results[14];
        const originCountsRes = results[15];

        const haltung = keepingTypesRes.data?.map(kt => kt.name) || [];
        const ernahrung = feedingCategoriesRes.data?.map(fc => fc.name) || [];

        // Map DB result to Origin type + anheften der fishCounts
        const originCountsMap = new Map((originCountsRes?.data || []).map((row: any) => [row.origin_id, row.published_fish_count]));

        const herkunft = originsRes.data?.map(o => ({
            id: o.id,
            name: o.name,
            type: o.origin_type as any, // Cast specific text to union type
            parent_id: o.parent_id,
            slug: o.slug || '',
            path: (o.path as string) || '', // ltree path as string
            fishCount: originCountsMap.get(o.id) || 0
        })) || [];

        // Cross-references: waterbodies an Länder binden
        const crossRefs = (crossRefsRes.data || []).map((cr: any) => ({
            origin_id: cr.waterbody_id as number,
            also_appears_under_id: cr.country_id as number
        }));

        const schwimmhoehe = swimmingZonesRes.data?.map(sz => sz.zone_name) || [];

        const bounds = {
            temperatur: {
                min: getVal(minTempRes, 'water_temperature_min_c', 0),
                max: getVal(maxTempRes, 'water_temperature_max_c', 35)
            },
            phWert: {
                min: getVal(minPhRes, 'water_ph_min', 4),
                max: getVal(maxPhRes, 'water_ph_max', 9)
            },
            hardness: {
                min: getVal(minHardnessRes, 'water_hardness_dh_min', 0),
                max: getVal(maxHardnessRes, 'water_hardness_dh_max', 30)
            },
            liters: {
                min: getVal(minLitersRes, 'aquarium_min_liters', 10),
                max: getVal(maxLitersRes, 'aquarium_min_liters', 1000)
            },
            length: {
                min: getVal(minLengthRes, 'aquarium_min_edge_length_cm', 20),
                max: getVal(maxLengthRes, 'aquarium_min_edge_length_cm', 200)
            }
        };

        // Legacy fallback
        const temperaturOptions = [`${bounds.temperatur.min}-${bounds.temperatur.max}°C`];

        return {
            haltung,
            ernahrung,
            temperatur: temperaturOptions,
            schwimmhoehe,
            herkunft,
            crossRefs,
            bounds
        };

    } catch (error: any) {
        console.error("[getFilterOptions] Error:", error);
        throw new Error(error.message || "Failed to fetch filter options");
    }
}, ['filter-options-cache'], { revalidate: 3600, tags: ['filter-options'] });
