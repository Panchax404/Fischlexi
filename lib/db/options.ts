import { getSupabaseAdmin } from '../supabaseClient'; // Pfad ggf. anpassen, je nachdem wo die Datei landet

const supabaseAdmin = getSupabaseAdmin();

export async function getFilterOptions() {
    try {
        const results = await Promise.all([
            supabaseAdmin.from('keeping_types').select('name').order('name', { ascending: true }),
            supabaseAdmin.from('feeding_categories').select('name').order('name', { ascending: true }),
            supabaseAdmin.from('origins').select('id, name, origin_type, parent_id, slug').order('name', { ascending: true }),
            supabaseAdmin.from('swimming_zones').select('zone_name').order('zone_name', { ascending: true }),

            supabaseAdmin.from('fish').select('water_temperature_min_c').not('water_temperature_min_c', 'is', null).order('water_temperature_min_c', { ascending: true }).limit(1).single(),
            supabaseAdmin.from('fish').select('water_temperature_max_c').not('water_temperature_max_c', 'is', null).order('water_temperature_max_c', { ascending: false }).limit(1).single(),

            supabaseAdmin.from('fish').select('water_ph_min').not('water_ph_min', 'is', null).order('water_ph_min', { ascending: true }).limit(1).single(),
            supabaseAdmin.from('fish').select('water_ph_max').not('water_ph_max', 'is', null).order('water_ph_max', { ascending: false }).limit(1).single(),

            supabaseAdmin.from('fish').select('water_hardness_dh_min').not('water_hardness_dh_min', 'is', null).order('water_hardness_dh_min', { ascending: true }).limit(1).single(),
            supabaseAdmin.from('fish').select('water_hardness_dh_max').not('water_hardness_dh_max', 'is', null).order('water_hardness_dh_max', { ascending: false }).limit(1).single(),

            supabaseAdmin.from('fish').select('aquarium_min_liters').not('aquarium_min_liters', 'is', null).order('aquarium_min_liters', { ascending: true }).limit(1).single(),
            supabaseAdmin.from('fish').select('aquarium_min_liters').not('aquarium_min_liters', 'is', null).order('aquarium_min_liters', { ascending: false }).limit(1).single(),

            supabaseAdmin.from('fish').select('aquarium_min_edge_length_cm').not('aquarium_min_edge_length_cm', 'is', null).order('aquarium_min_edge_length_cm', { ascending: true }).limit(1).single(),
            supabaseAdmin.from('fish').select('aquarium_min_edge_length_cm').not('aquarium_min_edge_length_cm', 'is', null).order('aquarium_min_edge_length_cm', { ascending: false }).limit(1).single()
        ]);

        const keepingTypesRes = results[0];
        const feedingCategoriesRes = results[1];
        const originsRes = results[2];
        const swimmingZonesRes = results[3];

        // Helper to extract value or default
        const getVal = (res: any, key: string, def: number) => res.data?.[key] ?? def;

        // Results array mapping (offset by 4 fixed queries)
        const minTempRes = results[4];
        const maxTempRes = results[5];
        const minPhRes = results[6];
        const maxPhRes = results[7];
        const minHardnessRes = results[8];
        const maxHardnessRes = results[9];
        const minLitersRes = results[10];
        const maxLitersRes = results[11];
        const minLengthRes = results[12];
        const maxLengthRes = results[13];

        const haltung = keepingTypesRes.data?.map(kt => kt.name) || [];
        const ernahrung = feedingCategoriesRes.data?.map(fc => fc.name) || [];

        // Map DB result to Origin type
        const herkunft = originsRes.data?.map(o => ({
            id: o.id,
            name: o.name,
            type: o.origin_type as any, // Cast specific text to union type
            parent_id: o.parent_id,
            slug: o.slug
        })) || [];

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
            bounds
        };

    } catch (error: any) {
        console.error("[getFilterOptions] Error:", error);
        throw new Error(error.message || "Failed to fetch filter options");
    }
}
