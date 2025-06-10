import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../../lib/supabaseClient'; // Pfad anpassen

const supabaseAdmin = getSupabaseAdmin();

export async function GET(
  request: NextRequest, // NextRequest wird hier nicht für params benötigt, aber für searchParams, falls du sie hier bräuchtest
  context: { params: Promise<{ slug: string }> } // Typ für params als Promise
) {
  try {
    const resolvedParams = await context.params; // PARAMS AUFLÖSEN
    const slug = resolvedParams.slug;
    console.log(`[API /details] Awaited slug: ${slug}`);

    if (!slug) {
      return NextResponse.json({ message: "Slug is required" }, { status: 400 });
    }

    const { data: fishData, error: fishError } = await supabaseAdmin
      .from('fish')
      .select(`
        id, name, slug, latin_name, common_other_names,
        image_url_main, image_gallery_urls,
        description_general, description_habitat_details, description_care_aquarium,
        description_social_behavior, description_breeding,
        size_cm_min, size_cm_max, lifespan_years_min, lifespan_years_max,
        water_temperature_min_c, water_temperature_max_c,
        water_ph_min, water_ph_max, water_hardness_dh_min, water_hardness_dh_max,
        aquarium_min_liters, aquarium_min_edge_length_cm,
        is_published, author_notes, created_at, updated_at,
        primary_habitat:habitats (id, name, description), 
        difficulty_level:difficulty_levels (id, level_name, description),
        fish_origins:fish_origins!inner (origin:origins!inner (id, name, continent)),
        fish_keeping_types:fish_keeping_types!inner (keeping_type:keeping_types!inner (id, name, min_group_size)),
        fish_feeding_categories_map:fish_feeding_categories_map!inner (feeding_category:feeding_categories!inner (id, name)),
        fish_food_types_suitability:fish_food_types_suitability!inner (food_type:food_types!inner (id, name)),
        fish_swimming_zones:fish_swimming_zones!inner (swimming_zone:swimming_zones!inner (id, zone_name))
      `)
      .eq('slug', slug) // Suche anhand des eindeutigen Slugs
      .maybeSingle();

    if (fishError) {
      console.error('[API /details] Supabase fish fetch error:', fishError);
      throw fishError;
    }

    if (!fishData) {
      return NextResponse.json({ message: "Fish not found" }, { status: 404 });
    }

    // Transformiere die Daten in die vom Frontend erwartete Struktur (Arrays von Strings etc.)
    const responseData = {
      ...fishData,
      // Die relationalen Daten sind bereits als Arrays von Objekten im fishData enthalten.
      // Wir wollen sie vielleicht in einfachere Arrays von Strings umwandeln, wie es dein Frontend erwartet.
      habitat: fishData.primary_habitat?.name || null,
      difficulty: fishData.difficulty_level?.level_name || null,
      herkunft: fishData.fish_origins.map((join: any) => join.origin.name),
      haltung: fishData.fish_keeping_types.map((join: any) => join.keeping_type.name),
      // Für die Ernährung brauchen wir ggf. beides: Kategorien und spezifische Futterarten
      ernahrung_kategorien: fishData.fish_feeding_categories_map.map((join: any) => join.feeding_category.name),
      futter_arten: fishData.fish_food_types_suitability.map((join: any) => join.food_type.name),
      // Dein Frontend erwartet wahrscheinlich eine kombinierte Ernährungsliste
      ernahrung: [
        ...new Set([ // Eindeutige Werte
          ...fishData.fish_feeding_categories_map.map((join: any) => join.feeding_category.name),
          ...fishData.fish_food_types_suitability.map((join: any) => join.food_type.name)
        ])
      ],
      schwimmhoehe: fishData.fish_swimming_zones.map((join: any) => join.swimming_zone.zone_name),

      // Entferne die komplexen Join-Objekte, wenn das Frontend sie nicht direkt braucht
      primary_habitat: undefined,
      difficulty_level: undefined,
      fish_origins: undefined,
      fish_keeping_types: undefined,
      fish_feeding_categories_map: undefined,
      fish_food_types_suitability: undefined,
      fish_swimming_zones: undefined,

      // Konvertiere Temperatur und Größe für die Anzeige, falls nötig (oder im Frontend machen)
      // Beispiel: Erzeuge den String für die Temperatur direkt
      temperatur: (fishData.water_temperature_min_c && fishData.water_temperature_max_c)
        ? `${fishData.water_temperature_min_c}°C - ${fishData.water_temperature_max_c}°C`
        : (fishData.water_temperature_min_c ? `${fishData.water_temperature_min_c}°C` : 'N/A'),
      size: (fishData.size_cm_min && fishData.size_cm_max)
        ? `${fishData.size_cm_min} - ${fishData.size_cm_max} cm`
        : (fishData.size_cm_max ? `bis ${fishData.size_cm_max} cm` : 'N/A'),
    };

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error("[API /details] Supabase Error:", error.message, error.details, error.hint);
    return NextResponse.json({ message: error.message || "Failed to fetch fish details" }, { status: 500 });
  }
}