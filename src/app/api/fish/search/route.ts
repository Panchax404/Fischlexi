// app/api/fish/search/route.ts (KORRIGIERTE VERSION)
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdmin } from '../../../../../lib/supabaseClient'; // Pfad ggf. anpassen

const supabaseAdmin = getSupabaseAdmin();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams; // searchParams hier definieren

    // Parameter aus der URL lesen
    const q = searchParams.get('q');
    const lang = searchParams.get('lang') || 'de';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const offset = (page - 1) * limit;

    // Temperaturparameter hier lesen, NACHDEM searchParams definiert wurde
    const tempMinParam = searchParams.get('temp_min');
    const tempMaxParam = searchParams.get('temp_max');

    const phMinParam = searchParams.get('ph_min');
    const phMaxParam = searchParams.get('ph_max');

    const parseMultiSelectParam = (paramName: string): string[] | undefined => {
      const values = searchParams.getAll(paramName);
      return values.length > 0 ? values.map(s => s.trim()).filter(Boolean) : undefined;
    };

    const haltungValues = parseMultiSelectParam('haltung');
    const ernahrungValues = parseMultiSelectParam('ernahrung');
    const schwimmhoeheValues = parseMultiSelectParam('schwimmhoehe');
    const herkunftValues = parseMultiSelectParam('herkunft');
    // const temperaturFilter = searchParams.get('temperatur'); // Nicht mehr benötigt, wenn temp_min/temp_max verwendet werden

    let query = supabaseAdmin
      .from('fish_translations')
      .select(`
        name, slug, description_general,
        fish!inner(
          id, latin_name, 
          image_url_main, 
          size_cm_min, size_cm_max, 
          water_temperature_min_c, water_temperature_max_c,
          primary_habitat:habitats (id, name),
          fish_origins:fish_origins!inner (origin:origins!inner (name)),
          fish_keeping_types:fish_keeping_types!inner (keeping_type:keeping_types!inner (name)),
          fish_feeding_categories_map:fish_feeding_categories_map!inner (feeding_category:feeding_categories!inner (name)),
          fish_swimming_zones:fish_swimming_zones!inner (swimming_zone:swimming_zones!inner (zone_name))
        )
      `, { count: 'exact' })
      .eq('language_code', lang)
      .eq('fish.is_published', true);

    // Textsuche (q)
    if (q && q.trim()) {
      const searchTerm = q.trim();
      // Simple ilike on translations for now. PostgREST allows filtering inner joins too.
      query = query.or(
        `name.ilike.%${searchTerm}%,description_general.ilike.%${searchTerm}%,fish.latin_name.ilike.%${searchTerm}%`
      );
    }

    // Filter für Many-to-Many Relationen
    if (haltungValues && haltungValues.length > 0) {
      const quotedHaltungValues = haltungValues.map(val => `"${val.replace(/"/g, '""')}"`);
      query = query.filter('fish.fish_keeping_types.keeping_type.name', 'in', `(${quotedHaltungValues.join(',')})`);
    }
    if (ernahrungValues && ernahrungValues.length > 0) {
      const quotedErnahrungValues = ernahrungValues.map(val => `"${val.replace(/"/g, '""')}"`);
      query = query.filter('fish.fish_feeding_categories_map.feeding_category.name', 'in', `(${quotedErnahrungValues.join(',')})`);
    }
    if (herkunftValues && herkunftValues.length > 0) {
      const { data: descendantData, error: rpcError } = await supabaseAdmin
        .rpc('get_descendant_origin_ids_by_slugs', { slugs: herkunftValues });

      if (rpcError) console.error('[API /search] RPC error:', rpcError);

      if (descendantData && descendantData.length > 0) {
        const idsParam = `(${descendantData.map((row: any) => row.id).join(',')})`;
        query = query.filter('fish.fish_origins.origin_id', 'in', idsParam);
      }
    }
    if (schwimmhoeheValues && schwimmhoeheValues.length > 0) {
      const quotedSchwimmhoeheValues = schwimmhoeheValues.map(val => `"${val.replace(/"/g, '""')}"`);
      query = query.filter('fish.fish_swimming_zones.swimming_zone.zone_name', 'in', `(${quotedSchwimmhoeheValues.join(',')})`);
    }

    if (tempMinParam !== null && tempMaxParam !== null) {
        const filterMin = parseFloat(tempMinParam);
        const filterMax = parseFloat(tempMaxParam);
        if (!isNaN(filterMin) && !isNaN(filterMax)) {
            query = query.lte('fish.water_temperature_min_c', filterMax)
                         .gte('fish.water_temperature_max_c', filterMin);
        }
    } else if (tempMinParam !== null) {
        const filterMin = parseFloat(tempMinParam);
        if (!isNaN(filterMin)) query = query.gte('fish.water_temperature_max_c', filterMin);
    } else if (tempMaxParam !== null) {
        const filterMax = parseFloat(tempMaxParam);
        if (!isNaN(filterMax)) query = query.lte('fish.water_temperature_min_c', filterMax);
    }
    if (phMinParam && phMaxParam) {
        const filterMin = parseFloat(phMinParam);
        const filterMax = parseFloat(phMaxParam);
        query = query.lte('fish.water_ph_min', filterMax)
                     .gte('fish.water_ph_max', filterMin);
    } else if (phMinParam) {
        query = query.gte('fish.water_ph_max', parseFloat(phMinParam));
    } else if (phMaxParam) {
        query = query.lte('fish.water_ph_min', parseFloat(phMaxParam));
    }

    query = query.order('name', { ascending: true }).range(offset, offset + limit - 1);

    const { data: fishListFromDb, error: searchError, count: totalResults } = await query;

    if (searchError) {
      console.error('[API /search] Supabase search error:', searchError);
      console.error('Fehlerdetails:', searchError.details); // Mehr Details loggen
      console.error('Fehlerhinweis:', searchError.hint);   // Mehr Details loggen
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
        size: (f.size_cm_min && f.size_cm_max)
          ? `${f.size_cm_min} - ${f.size_cm_max} cm`
          : (f.size_cm_max ? `bis ${f.size_cm_max} cm` : 'N/A'),
        temperatur: (f.water_temperature_min_c && f.water_temperature_max_c)
          ? `${f.water_temperature_min_c}-${f.water_temperature_max_c}°C`
          : (f.water_temperature_min_c ? `${f.water_temperature_min_c}°C` : 'N/A'),
      };
    }) || [];

    return NextResponse.json({
      data: transformedFishList,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((totalResults || 0) / limit),
        totalResults: totalResults || 0,
        limit: limit,
      },
    });

  } catch (error: any) {
    console.error("[API /search] General Error:", error.message, error); // Logge den ganzen Fehler für mehr Details
    return NextResponse.json({ message: error.message || "Failed to perform search" }, { status: 500 });
  }
}