// app/api/fish/search/route.ts (KORRIGIERTE VERSION)
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdmin } from '../../../../../lib/supabaseClient'; // Pfad ggf. anpassen

const supabaseAdmin = getSupabaseAdmin();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams; // searchParams hier definieren

    // Parameter aus der URL lesen
    const q = searchParams.get('q');
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
      .from('fish')
      .select(`
        id, name, slug, latin_name, 
        image_url_main, 
        size_cm_min, size_cm_max, 
        water_temperature_min_c, water_temperature_max_c,
        description_general,
        primary_habitat:habitats (id, name),
        fish_origins:fish_origins!inner (origin:origins!inner (name)),
        fish_keeping_types:fish_keeping_types!inner (keeping_type:keeping_types!inner (name)),
        fish_feeding_categories_map:fish_feeding_categories_map!inner (feeding_category:feeding_categories!inner (name)),
        fish_swimming_zones:fish_swimming_zones!inner (swimming_zone:swimming_zones!inner (zone_name))
      `, { count: 'exact' })
      .eq('is_published', true);

    // Textsuche (q)
    if (q && q.trim()) {
      const searchTerm = q.trim();
      query = query.or(
        `name.ilike.%${searchTerm}%,latin_name.ilike.%${searchTerm}%,description_general.ilike.%${searchTerm}%`
      );
    }

    // Filter für Many-to-Many Relationen
    if (haltungValues && haltungValues.length > 0) {
      query = query.filter('fish_keeping_types.keeping_type.name', 'in', `(${haltungValues.join(',')})`);
    }
    if (ernahrungValues && ernahrungValues.length > 0) {
      query = query.filter('fish_feeding_categories_map.feeding_category.name', 'in', `(${ernahrungValues.join(',')})`);
    }
    if (herkunftValues && herkunftValues.length > 0) {
      query = query.filter('fish_origins.origin.name', 'in', `(${herkunftValues.join(',')})`);
    }
    if (schwimmhoeheValues && schwimmhoeheValues.length > 0) {
      query = query.filter('fish_swimming_zones.swimming_zone.zone_name', 'in', `(${schwimmhoeheValues.join(',')})`);
    }

    // Temperaturfilter basierend auf temp_min und temp_max (von Range Slider)
    if (tempMinParam !== null && tempMaxParam !== null) {
        const filterMin = parseFloat(tempMinParam);
        const filterMax = parseFloat(tempMaxParam);
        if (!isNaN(filterMin) && !isNaN(filterMax)) {
            // Überlappungslogik: Fischbereich überlappt mit Filterbereich
            // fish.min_temp <= filter.max_temp AND fish.max_temp >= filter.min_temp
            query = query.lte('water_temperature_min_c', filterMax)
                         .gte('water_temperature_max_c', filterMin);
        }
    } else if (tempMinParam !== null) { // Nur Mindesttemperatur gefiltert
        const filterMin = parseFloat(tempMinParam);
        if (!isNaN(filterMin)) {
            query = query.gte('water_temperature_max_c', filterMin); // Fische, deren Max-Temp >= Filter-Min ist
        }
    } else if (tempMaxParam !== null) { // Nur Maximaltemperatur gefiltert
        const filterMax = parseFloat(tempMaxParam);
        if (!isNaN(filterMax)) {
            query = query.lte('water_temperature_min_c', filterMax); // Fische, deren Min-Temp <= Filter-Max ist
        }
    }
    if (phMinParam && phMaxParam) {
        const filterMin = parseFloat(phMinParam);
        const filterMax = parseFloat(phMaxParam);
        // Finde Fische, deren pH-Bereich [fish.water_ph_min, fish.water_ph_max]
        // sich mit dem ausgewählten Bereich [filterMin, filterMax] überlappt.
        query = query.lte('water_ph_min', filterMax) // Fisch min pH <= Filter max pH
                     .gte('water_ph_max', filterMin); // Fisch max pH >= Filter min pH
    } else if (phMinParam) { // Nur Mindest-pH gefiltert
        query = query.gte('water_ph_max', parseFloat(phMinParam));
    } else if (phMaxParam) { // Nur Maximal-pH gefiltert
        query = query.lte('water_ph_min', parseFloat(phMaxParam));
    }
    query = query.order('name', { ascending: true }).range(offset, offset + limit - 1);

    const { data: fishListFromDb, error: searchError, count: totalResults } = await query;

    if (searchError) {
      console.error('[API /search] Supabase search error:', searchError);
      throw searchError;
    }

    const getArrayOfNames = (arr: any[] | undefined, subObjectKey: string, nameKey: string = 'name') => {
        if (Array.isArray(arr) && arr.length > 0) {
            return arr.map(item => item[subObjectKey]?.[nameKey]).filter(Boolean);
        }
        return [];
    };

    const transformedFishList = fishListFromDb?.map(fishFromDb => {
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
        size: (fishFromDb.size_cm_min && fishFromDb.size_cm_max)
          ? `${fishFromDb.size_cm_min} - ${fishFromDb.size_cm_max} cm`
          : (fishFromDb.size_cm_max ? `bis ${fishFromDb.size_cm_max} cm` : 'N/A'),
        temperatur: (fishFromDb.water_temperature_min_c && fishFromDb.water_temperature_max_c)
          ? `${fishFromDb.water_temperature_min_c}-${fishFromDb.water_temperature_max_c}°C`
          : (fishFromDb.water_temperature_min_c ? `${fishFromDb.water_temperature_min_c}°C` : 'N/A'),
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