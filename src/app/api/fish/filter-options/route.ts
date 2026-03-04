import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../lib/supabaseClient'; // Pfad anpassen

const supabaseAdmin = getSupabaseAdmin();

export async function GET() {
  try {
    // 1. Parallel Requests starten für Haltung, Ernährung, Herkunft, Schwimmzonen
    const [
      keepingTypesRes,
      feedingCategoriesRes,
      originsRes,
      swimmingZonesRes,
      // Min/Max Queries
      minTempRes,
      maxTempRes,
      minPhRes,
      maxPhRes
    ] = await Promise.all([
      supabaseAdmin.from('keeping_types').select('name').order('name', { ascending: true }),
      supabaseAdmin.from('feeding_categories').select('name').order('name', { ascending: true }),
      supabaseAdmin.from('origins').select('name').order('name', { ascending: true }),
      supabaseAdmin.from('swimming_zones').select('zone_name').order('zone_name', { ascending: true }),

      // Temp Min/Max
      supabaseAdmin.from('fish').select('water_temperature_min_c').not('water_temperature_min_c', 'is', null).order('water_temperature_min_c', { ascending: true }).limit(1).single(),
      supabaseAdmin.from('fish').select('water_temperature_max_c').not('water_temperature_max_c', 'is', null).order('water_temperature_max_c', { ascending: false }).limit(1).single(),

      // pH Min/Max
      supabaseAdmin.from('fish').select('water_ph_min').not('water_ph_min', 'is', null).order('water_ph_min', { ascending: true }).limit(1).single(),
      supabaseAdmin.from('fish').select('water_ph_max').not('water_ph_max', 'is', null).order('water_ph_max', { ascending: false }).limit(1).single()
    ]);

    // Error Handling
    if (keepingTypesRes.error) throw keepingTypesRes.error;
    if (feedingCategoriesRes.error) throw feedingCategoriesRes.error;
    if (originsRes.error) throw originsRes.error;
    if (swimmingZonesRes.error) throw swimmingZonesRes.error;

    // Daten formatieren
    const haltung = keepingTypesRes.data?.map(kt => kt.name) || [];
    const ernahrung = feedingCategoriesRes.data?.map(fc => fc.name) || [];
    const herkunft = originsRes.data?.map(o => o.name) || [];
    const schwimmhoehe = swimmingZonesRes.data?.map(sz => sz.zone_name) || [];

    // Bounds berechnen mit Fallbacks
    const bounds = {
      temperatur: {
        min: minTempRes.data?.water_temperature_min_c ?? 0,
        max: maxTempRes.data?.water_temperature_max_c ?? 40
      },
      phWert: {
        min: minPhRes.data?.water_ph_min ?? 0,
        max: maxPhRes.data?.water_ph_max ?? 14
      }
    };

    // Alte "temperatur" optionen für Kompatibilität mit Types (auch wenn wir sie im Frontend vielleicht nicht mehr nutzen)
    // Wir lassen das Array leer oder geben den Range-String zurück
    const temperaturOptions = [`${bounds.temperatur.min}-${bounds.temperatur.max}°C`];

    return NextResponse.json({
      haltung,
      ernahrung,
      temperatur: temperaturOptions,
      schwimmhoehe,
      herkunft,
      bounds
    });

  } catch (error: any) {
    console.error("[API /filter-options] Supabase Error:", error);
    return NextResponse.json({ message: error.message || "Failed to fetch filter options" }, { status: 500 });
  }
}