import { getSupabasePublic } from '../supabaseClient';
import type { FilterState } from '../types';
import { sanitizeSearchTerm, intersectAllowlist, toPostgrestInList } from './searchTerm';
import { getFilterOptions } from './options';

const supabasePublic = getSupabasePublic();

type SearchParams = {
    q?: string;
    lang?: string;
    page?: number;
    limit?: number;
    filters?: FilterState;
};

export async function getFishDetails(slug: string, lang: string = 'de') {
    try {
        const { data: fishDataRaw, error: fishError } = await supabasePublic
            .from('fish_translations')
            .select(`
                name, slug, common_other_names, description_general,
                description_habitat_details, description_care_aquarium,
                description_social_behavior, description_breeding,
                fish!inner(
                    id, latin_name, image_url_main, image_gallery_urls,
                    size_cm_min, size_cm_max, lifespan_years_min, lifespan_years_max,
                    water_temperature_min_c, water_temperature_max_c,
                    water_ph_min, water_ph_max, water_hardness_dh_min, water_hardness_dh_max,
                    aquarium_min_liters, aquarium_min_edge_length_cm,
                    is_published, author_notes, created_at, updated_at,
                    primary_habitat:habitats (id, name, description), 
                    difficulty_level:difficulty_levels (id, level_name, description),
                    fish_origins:fish_origins (origin:origins (id, name)),
                    fish_keeping_types:fish_keeping_types (keeping_type:keeping_types (id, name, min_group_size)),
                    fish_feeding_categories_map:fish_feeding_categories_map (feeding_category:feeding_categories (id, name)),
                    fish_food_types_suitability:fish_food_types_suitability (food_type:food_types (id, name)),
                    fish_swimming_zones:fish_swimming_zones (swimming_zone:swimming_zones (id, zone_name))
                )
            `)
            .eq('slug', slug.toLowerCase()) // FAST B-Tree Index! Ensure lowercase match.
            .eq('language_code', lang)
            .eq('fish.is_published', true)
            .maybeSingle();

        if (fishError) {
            console.error("[getFishDetails] SUPABASE DB ERROR:", JSON.stringify(fishError, null, 2));
            throw fishError;
        }
        if (!fishDataRaw) {
            console.error("[getFishDetails] No data returned for slug:", slug, "lang:", lang);
            return null;
        }

        const f: any = fishDataRaw.fish;
        
        return {
            id: f.id,
            name: fishDataRaw.name,
            slug: fishDataRaw.slug,
            latin_name: f.latin_name,
            image_url_main: f.image_url_main,
            image_gallery_urls: f.image_gallery_urls,
            description_general: fishDataRaw.description_general,
            description_habitat_details: fishDataRaw.description_habitat_details,
            description_care_aquarium: fishDataRaw.description_care_aquarium,
            description_social_behavior: fishDataRaw.description_social_behavior,
            description_breeding: fishDataRaw.description_breeding,
            
            habitat: Array.isArray(f.primary_habitat) ? f.primary_habitat[0]?.name : f.primary_habitat?.name || null,
            difficulty: Array.isArray(f.difficulty_level) ? f.difficulty_level[0]?.level_name : f.difficulty_level?.level_name || null,
            herkunft: f.fish_origins?.map((join: any) => join.origin?.name).filter(Boolean) || [],
            haltung: f.fish_keeping_types?.map((join: any) => join.keeping_type?.name).filter(Boolean) || [],
            
            ernahrung_kategorien: f.fish_feeding_categories_map?.map((join: any) => join.feeding_category?.name).filter(Boolean) || [],
            futter_arten: f.fish_food_types_suitability?.map((join: any) => join.food_type?.name).filter(Boolean) || [],
            ernahrung: [
                ...new Set([
                    ...(f.fish_feeding_categories_map || []).map((join: any) => join.feeding_category?.name).filter(Boolean),
                    ...(f.fish_food_types_suitability || []).map((join: any) => join.food_type?.name).filter(Boolean)
                ])
            ],
            schwimmhoehe: f.fish_swimming_zones?.map((join: any) => join.swimming_zone?.zone_name).filter(Boolean) || [],

            temperatur: (f.water_temperature_min_c && f.water_temperature_max_c)
                ? `${f.water_temperature_min_c}°C - ${f.water_temperature_max_c}°C`
                : (f.water_temperature_min_c ? `${f.water_temperature_min_c}°C` : 'N/A'),

            size: (f.size_cm_min && f.size_cm_max)
                ? `${f.size_cm_min} - ${f.size_cm_max} cm`
                : (f.size_cm_max ? `bis ${f.size_cm_max} cm` : 'N/A'),

            phWert: (f.water_ph_min && f.water_ph_max)
                ? `${f.water_ph_min} - ${f.water_ph_max}`
                : (f.water_ph_min ? `ab ${f.water_ph_min}` : 'N/A'),

            hardness: (f.water_hardness_dh_min && f.water_hardness_dh_max)
                ? `${f.water_hardness_dh_min} - ${f.water_hardness_dh_max} dH`
                : (f.water_hardness_dh_min ? `ab ${f.water_hardness_dh_min} dH` : 'N/A'),

            min_tank_size: f.aquarium_min_liters ? `ab ${f.aquarium_min_liters} Liter` : 'N/A',
            min_tank_length: f.aquarium_min_edge_length_cm ? `ab ${f.aquarium_min_edge_length_cm} cm` : 'N/A',

            lifespan: (f.lifespan_years_min && f.lifespan_years_max)
                ? `${f.lifespan_years_min} - ${f.lifespan_years_max} Jahre`
                : (f.lifespan_years_max ? `bis ${f.lifespan_years_max} Jahre` : 'N/A'),

            common_names: (fishDataRaw.common_other_names && Array.isArray(fishDataRaw.common_other_names))
                ? fishDataRaw.common_other_names.join(', ')
                : undefined,
        };
    } catch (error: any) {
        console.error("[getFishDetails] General Error:", error);
        return null;
    }
}

export async function searchFish({ q, lang = 'de', page = 1, limit = 12, filters = {} }: SearchParams) {
    try {
        const offset = (page - 1) * limit;

        let query = supabasePublic
            .from('fish_translations')
            .select(`
        name, slug, common_other_names, description_general,
        fish!inner(
          id, latin_name, 
          image_url_main, 
          size_cm_min, size_cm_max, 
          water_temperature_min_c, water_temperature_max_c,
          water_ph_min, water_ph_max,
          water_hardness_dh_min, water_hardness_dh_max,
          aquarium_min_liters, aquarium_min_edge_length_cm,
          lifespan_years_min, lifespan_years_max,
          primary_habitat:habitats (id, name),
          fish_origins:fish_origins!inner (origin:origins!inner (name)),
          fish_keeping_types:fish_keeping_types!inner (keeping_type:keeping_types!inner (name)),
          fish_feeding_categories_map:fish_feeding_categories_map!inner (feeding_category:feeding_categories!inner (name)),
          fish_swimming_zones:fish_swimming_zones!inner (swimming_zone:swimming_zones!inner (zone_name))
        )
      `, { count: 'exact' })
            .eq('language_code', lang)
            .eq('fish.is_published', true);

        // Text Search — or() auf der Basistabelle fish_translations.
        // Da PostgREST mehrere or()-Parameter auf verschiedenen Tabellen als AND
        // verknüpft, wird hier sauber auf name & description_general gesucht.
        if (q && q.trim()) {
            const searchTerm = sanitizeSearchTerm(q);

            if (searchTerm.length > 0) {
                query = query.or(
                    `name.ilike.%${searchTerm}%,description_general.ilike.%${searchTerm}%`
                );
            }
        }

        // Multi-Select-Filter gegen Allowlist prüfen.
        // getFilterOptions() ist unstable_cache-gecached (revalidate 3600),
        // verursacht also keinen zusätzlichen Roundtrip pro Request.
        const needsAllowlist =
            (filters.haltung?.length ?? 0) > 0 ||
            (filters.ernahrung?.length ?? 0) > 0 ||
            (filters.schwimmhoehe?.length ?? 0) > 0;

        const allowlists = needsAllowlist
            ? await getFilterOptions()
            : { haltung: [], ernahrung: [], schwimmhoehe: [] };

        const haltung = intersectAllowlist(filters.haltung, allowlists.haltung);
        if (haltung.length > 0) {
            query = query.filter(
                'fish.fish_keeping_types.keeping_type.name', 'in', toPostgrestInList(haltung)
            );
        }

        const ernahrung = intersectAllowlist(filters.ernahrung, allowlists.ernahrung);
        if (ernahrung.length > 0) {
            query = query.filter(
                'fish.fish_feeding_categories_map.feeding_category.name', 'in', toPostgrestInList(ernahrung)
            );
        }

        if (filters.herkunft && filters.herkunft.length > 0) {
            const { data: descendantData, error: rpcError } = await supabasePublic
                .rpc('get_descendant_origin_ids_by_slugs', { slugs: filters.herkunft });

            if (rpcError) console.error('[searchFish] RPC error for origin descendants:', rpcError);

            // Nur echte Ganzzahlen weiterreichen: ein NaN oder undefined würde
            // sonst als Literal "NaN" in die in()-Liste interpoliert werden.
            const originIds = (descendantData ?? [])
                .map((row: { id: unknown }) => Number(row.id))
                .filter((id: number) => Number.isSafeInteger(id) && id > 0);

            if (originIds.length > 0) {
                query = query.filter('fish.fish_origins.origin_id', 'in', `(${originIds.join(',')})`);
            } else {
                // Angeforderte Region existiert nicht -> definitiv leeres Ergebnis,
                // statt den Filter stillschweigend zu ignorieren (Fail-Closed).
                query = query.eq('fish.id', -1);
            }
        }

        const schwimmhoehe = intersectAllowlist(filters.schwimmhoehe, allowlists.schwimmhoehe);
        if (schwimmhoehe.length > 0) {
            query = query.filter(
                'fish.fish_swimming_zones.swimming_zone.zone_name', 'in', toPostgrestInList(schwimmhoehe)
            );
        }

        // Temp Range
        if (filters.temperatur) {
            query = query.lte('fish.water_temperature_min_c', filters.temperatur.max)
                .gte('fish.water_temperature_max_c', filters.temperatur.min);
        }

        // pH Range
        if (filters.phWert) {
            query = query.lte('fish.water_ph_min', filters.phWert.max)
                .gte('fish.water_ph_max', filters.phWert.min);
        }

        // Hardness Range
        if (filters.hardness) {
            query = query.lte('fish.water_hardness_dh_min', filters.hardness.max)
                .gte('fish.water_hardness_dh_max', filters.hardness.min);
        }

        // Liters (Min Tank Size)
        if (filters.liters !== undefined) {
            query = query.lte('fish.aquarium_min_liters', filters.liters);
        }

        // Edge Length (Min Length)
        if (filters.length !== undefined) {
            query = query.lte('fish.aquarium_min_edge_length_cm', filters.length);
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

        const transformedFishList = fishListFromDb?.map((t: any) => {
            const f = t.fish;
            // Format Helper
            const formatRange = (min: number | null, max: number | null, unit: string) => {
                if (min != null && max != null) return `${min} - ${max} ${unit}`;
                if (min != null) return `ab ${min} ${unit}`;
                if (max != null) return `bis ${max} ${unit}`;
                return 'N/A';
            };

            const sizeStr = formatRange(f.size_cm_min, f.size_cm_max, 'cm');
            const tempStr = formatRange(f.water_temperature_min_c, f.water_temperature_max_c, '°C');
            const phStr = formatRange(f.water_ph_min, f.water_ph_max, '');
            const hardnessStr = formatRange(f.water_hardness_dh_min, f.water_hardness_dh_max, 'dH');
            const litersStr = f.aquarium_min_liters ? `ab ${f.aquarium_min_liters} Liter` : 'N/A';
            const lengthStr = f.aquarium_min_edge_length_cm ? `ab ${f.aquarium_min_edge_length_cm} cm` : 'N/A';
            const lifespanStr = formatRange(f.lifespan_years_min, f.lifespan_years_max, 'Jahre');

            return {
                id: f.id,
                name: t.name,
                slug: t.slug,
                latin_name: f.latin_name,
                image_url_main: f.image_url_main,
                description_general: t.description_general,
                habitat: f.primary_habitat?.name || null,
                herkunft: getArrayOfNames(f.fish_origins, 'origin'),
                haltung: getArrayOfNames(f.fish_keeping_types, 'keeping_type'),
                ernahrung: getArrayOfNames(f.fish_feeding_categories_map, 'feeding_category'),
                schwimmhoehe: getArrayOfNames(f.fish_swimming_zones, 'swimming_zone', 'zone_name'),
                size: sizeStr,
                temperatur: tempStr,
                phWert: phStr !== 'N/A' ? phStr : undefined,
                hardness: hardnessStr !== 'N/A' ? hardnessStr : undefined,
                min_tank_size: litersStr !== 'N/A' ? litersStr : undefined,
                min_tank_length: lengthStr !== 'N/A' ? lengthStr : undefined,
                lifespan: lifespanStr !== 'N/A' ? lifespanStr : undefined,
                common_names: (t.common_other_names && Array.isArray(t.common_other_names))
                    ? t.common_other_names.join(', ')
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
