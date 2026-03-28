import { getSupabaseAdmin } from '../supabaseClient';
import type { FilterState } from '../types';

const supabaseAdmin = getSupabaseAdmin();

type SearchParams = {
    q?: string;
    page?: number;
    limit?: number;
    filters?: FilterState;
};

export async function searchFish({ q, page = 1, limit = 12, filters = {} }: SearchParams) {
    try {
        const offset = (page - 1) * limit;

        let query = supabaseAdmin
            .from('fish')
            .select(`
        id, name, slug, latin_name, common_other_names,
        image_url_main, 
        size_cm_min, size_cm_max, 
        water_temperature_min_c, water_temperature_max_c,
        water_ph_min, water_ph_max,
        water_hardness_dh_min, water_hardness_dh_max,
        aquarium_min_liters, aquarium_min_edge_length_cm,
        lifespan_years_min, lifespan_years_max,
        description_general,
        primary_habitat:habitats (id, name),
        fish_origins:fish_origins!inner (origin:origins!inner (name)),
        fish_keeping_types:fish_keeping_types!inner (keeping_type:keeping_types!inner (name)),
        fish_feeding_categories_map:fish_feeding_categories_map!inner (feeding_category:feeding_categories!inner (name)),
        fish_swimming_zones:fish_swimming_zones!inner (swimming_zone:swimming_zones!inner (zone_name))
      `, { count: 'exact' })
            .eq('is_published', true);

        // Text Search
        if (q && q.trim()) {
            // Remove characters that might break PostgREST .or() syntax like commas
            const searchTerm = q.trim().replace(/,/g, ' ');
            // We use ILIKE for partial name matching (now blazing fast because of GIN Trigram indexes on name and latin_name)
            // and we use Web-FTS (wfts) on the search_vector (GIN indexed) for deep descriptions and full text.
            query = query.or(
                `name.ilike.%${searchTerm}%,latin_name.ilike.%${searchTerm}%,search_vector.wfts.${searchTerm}`
            );
        }

        // Filters
        if (filters.haltung && filters.haltung.length > 0) {
            const quoted = filters.haltung.map(val => `"${val.replace(/"/g, '""')}"`);
            query = query.filter('fish_keeping_types.keeping_type.name', 'in', `(${quoted.join(',')})`);
        }
        if (filters.ernahrung && filters.ernahrung.length > 0) {
            const quoted = filters.ernahrung.map(val => `"${val.replace(/"/g, '""')}"`);
            query = query.filter('fish_feeding_categories_map.feeding_category.name', 'in', `(${quoted.join(',')})`);
        }
        if (filters.herkunft && filters.herkunft.length > 0) {
            // Expand selected origins to include all children
            const allOriginIds = new Set<number>();

            // We need to fetch children for each selected ID
            // Since we can't do this easily in one query without a complex custom RPC taking an array,
            // we'll execute parallel RPC calls. It's not ideal for massive scale but fine here.
            await Promise.all(filters.herkunft.map(async (idStr) => {
                const id = parseInt(idStr);
                if (!isNaN(id)) {
                    const { data, error } = await supabaseAdmin.rpc('get_child_origin_ids', { root_id: id });
                    if (!error && data) {
                        data.forEach((row: any) => allOriginIds.add(row.id));
                    } else {
                        // Fallback: at least include the selected ID itself in case RPC fails/missing
                        allOriginIds.add(id);
                    }
                }
            }));

            if (allOriginIds.size > 0) {
                const idsParam = `(${Array.from(allOriginIds).join(',')})`;
                // We filter on the intermediate table `fish_origins` which links fish and origins.
                // Assuming column `origin_id` exists in `fish_origins`.
                query = query.filter('fish_origins.origin_id', 'in', idsParam);
            }
        }
        if (filters.schwimmhoehe && filters.schwimmhoehe.length > 0) {
            const quoted = filters.schwimmhoehe.map(val => `"${val.replace(/"/g, '""')}"`);
            query = query.filter('fish_swimming_zones.swimming_zone.zone_name', 'in', `(${quoted.join(',')})`);
        }

        // Temp Range
        if (filters.temperatur) {
            // filter.min <= fish.max AND filter.max >= fish.min
            query = query.lte('water_temperature_min_c', filters.temperatur.max)
                .gte('water_temperature_max_c', filters.temperatur.min);
        }

        // pH Range
        if (filters.phWert) {
            query = query.lte('water_ph_min', filters.phWert.max)
                .gte('water_ph_max', filters.phWert.min);
        }

        // Hardness Range
        if (filters.hardness) {
            query = query.lte('water_hardness_dh_min', filters.hardness.max)
                .gte('water_hardness_dh_max', filters.hardness.min);
        }

        // Liters (Min Tank Size) - Filter: Show fish that fit in an aquarium of X liters (fish min requirement <= X)
        if (filters.liters !== undefined) {
            query = query.lte('aquarium_min_liters', filters.liters);
        }

        // Edge Length (Min Length) - Filter: Show fish that fit in an aquarium of X cm length (fish min requirement <= X)
        if (filters.length !== undefined) {
            query = query.lte('aquarium_min_edge_length_cm', filters.length);
        }

        // Sorting & Pagination
        query = query.order('name', { ascending: true }).range(offset, offset + limit - 1);

        const { data: fishListFromDb, error: searchError, count: totalResults } = await query;

        if (searchError) {
            console.error('[searchFish] Supabase search error:', searchError);
            throw searchError;
        }

        const getArrayOfNames = (arr: any[] | undefined, subObjectKey: string, nameKey: string = 'name') => {
            if (Array.isArray(arr) && arr.length > 0) {
                return arr.map(item => item[subObjectKey]?.[nameKey]).filter(Boolean);
            }
            return [];
        };

        const transformedFishList = fishListFromDb?.map(fishFromDb => {
            // Format Helper
            const formatRange = (min: number | null, max: number | null, unit: string) => {
                if (min != null && max != null) return `${min} - ${max} ${unit}`;
                if (min != null) return `ab ${min} ${unit}`;
                if (max != null) return `bis ${max} ${unit}`;
                return 'N/A';
            };

            const sizeStr = formatRange(fishFromDb.size_cm_min, fishFromDb.size_cm_max, 'cm');
            const tempStr = formatRange(fishFromDb.water_temperature_min_c, fishFromDb.water_temperature_max_c, '°C');
            const phStr = formatRange(fishFromDb.water_ph_min, fishFromDb.water_ph_max, ''); // pH has no unit symbol usually
            const hardnessStr = formatRange(fishFromDb.water_hardness_dh_min, fishFromDb.water_hardness_dh_max, 'dH');
            const litersStr = fishFromDb.aquarium_min_liters ? `ab ${fishFromDb.aquarium_min_liters} Liter` : 'N/A';
            const lengthStr = fishFromDb.aquarium_min_edge_length_cm ? `ab ${fishFromDb.aquarium_min_edge_length_cm} cm` : 'N/A';
            const lifespanStr = formatRange(fishFromDb.lifespan_years_min, fishFromDb.lifespan_years_max, 'Jahre');

            return {
                id: fishFromDb.id,
                name: fishFromDb.name,
                slug: fishFromDb.slug,
                latin_name: fishFromDb.latin_name,
                image_url_main: fishFromDb.image_url_main,
                description_general: fishFromDb.description_general,
                habitat: (fishFromDb as any).primary_habitat?.name || null,
                herkunft: getArrayOfNames((fishFromDb as any).fish_origins, 'origin'),
                haltung: getArrayOfNames((fishFromDb as any).fish_keeping_types, 'keeping_type'),
                ernahrung: getArrayOfNames((fishFromDb as any).fish_feeding_categories_map, 'feeding_category'),
                schwimmhoehe: getArrayOfNames((fishFromDb as any).fish_swimming_zones, 'swimming_zone', 'zone_name'),
                size: sizeStr,
                temperatur: tempStr,
                // Add new fields
                phWert: phStr !== 'N/A' ? phStr : undefined,
                hardness: hardnessStr !== 'N/A' ? hardnessStr : undefined,
                min_tank_size: litersStr !== 'N/A' ? litersStr : undefined,
                min_tank_length: lengthStr !== 'N/A' ? lengthStr : undefined,
                lifespan: lifespanStr !== 'N/A' ? lifespanStr : undefined,
                common_names: (fishFromDb.common_other_names && Array.isArray(fishFromDb.common_other_names))
                    ? fishFromDb.common_other_names.join(', ')
                    : undefined,
            };
        }) || [];

        return {
            data: transformedFishList,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil((totalResults || 0) / limit),
                totalResults: totalResults || 0,
                limit: limit,
            },
        };

    } catch (error: any) {
        console.error("[searchFish] General Error:", error);
        throw new Error(error.message || "Failed to perform search");
    }
}
