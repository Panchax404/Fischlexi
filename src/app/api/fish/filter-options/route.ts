import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../lib/supabaseClient'; // Pfad anpassen

const supabaseAdmin = getSupabaseAdmin();

export async function GET() {
  try {
    // Haltung (keeping_types)
    const { data: keepingTypesData, error: keepingTypesError } = await supabaseAdmin
      .from('keeping_types')
      .select('name')
      .order('name', { ascending: true });
    if (keepingTypesError) throw keepingTypesError;

    // Ernährungskategorien (feeding_categories)
    const { data: feedingCategoriesData, error: feedingCategoriesError } = await supabaseAdmin
      .from('feeding_categories')
      .select('name')
      .order('name', { ascending: true });
    if (feedingCategoriesError) throw feedingCategoriesError;

    // Wassertemperatur (aus der fish Tabelle - hier wird's komplexer, wir brauchen Min/Max oder definierte Bereiche)
    // Einfache Variante: Wir definieren feste Bereiche oder lassen es vorerst weg,
    // da dynamische Bereiche aus Min/Max aller Fische aufwendiger sind.
    // Fürs Erste: Feste Beispiel-Temperaturbereiche. In der Praxis dynamisch oder besser überdacht.
    const temperaturOptions = ["18-22°C", "22-26°C", "26-30°C", "Kaltwasser (<18°C)"]; // Beispiel

    // Herkunft (origins)
    const { data: originsData, error: originsError } = await supabaseAdmin
      .from('origins')
      .select('name')
      .order('name', { ascending: true });
    if (originsError) throw originsError;

    // Schwimmzonen (swimming_zones)
    const { data: swimmingZonesData, error: swimmingZonesError } = await supabaseAdmin
      .from('swimming_zones')
      .select('zone_name') // Beachte: Spaltenname ist 'zone_name'
      .order('zone_name', { ascending: true });
    if (swimmingZonesError) throw swimmingZonesError;


    // Daten formatieren
    const haltung = keepingTypesData?.map(kt => kt.name) || [];
    const ernahrung = feedingCategoriesData?.map(fc => fc.name) || [];
    const herkunft = originsData?.map(o => o.name) || [];
    const schwimmhoehe = swimmingZonesData?.map(sz => sz.zone_name) || [];


    return NextResponse.json({
      haltung: haltung,
      ernahrung: ernahrung,
      temperatur: temperaturOptions, // Verwende die festen oder dynamisch generierten Bereiche
      schwimmhoehe: schwimmhoehe,
      herkunft: herkunft,
    });

  } catch (error: any) {
    console.error("[API /filter-options] Supabase Error:", error);
    return NextResponse.json({ message: error.message || "Failed to fetch filter options" }, { status: 500 });
  }
}