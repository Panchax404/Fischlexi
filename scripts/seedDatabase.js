// scripts/seedDatabase.js
require('dotenv').config({ path: '.env.local' }); // Lädt Umgebungsvariablen aus .env.local
const { createClient } = require('@supabase/supabase-js');
const { fishExamples } = require('../lib/mock-fish-data-for-script'); // Pfad zur Datendatei

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Supabase URL or Service Role Key is missing. Check your .env.local file.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Hilfsfunktion zum Einfügen in Lookup-Tabellen und Abrufen der ID
async function getOrCreateLookupId(tableName, columnName, value, otherColumns = {}) {
  if (!value) return null;

  // Versuche, den bestehenden Eintrag zu finden
  let { data, error } = await supabaseAdmin
    .from(tableName)
    .select('id')
    .eq(columnName, value)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') { // PGRST116: "The result contains 0 rows"
    console.error(`Error fetching from ${tableName} for ${value}:`, error);
    throw error;
  }

  if (data) return data.id;

  // Wenn nicht gefunden, erstelle neuen Eintrag
  // console.log(`Creating new entry in ${tableName} for ${value}`);
  const insertData = { [columnName]: value, ...otherColumns };
  ({ data, error } = await supabaseAdmin
    .from(tableName)
    .insert(insertData)
    .select('id')
    .single());

  if (error) {
    console.error(`Error inserting into ${tableName} for ${value}:`, error);
    throw error;
  }
  return data.id;
}


async function seedDatabase() {
  console.log("Starting database seeding...");

  for (const example of fishExamples) {
    const { fishData, relations } = example;
    console.log(`\nProcessing fish: ${fishData.name}`);

    // 1. IDs aus Lookup-Tabellen holen oder Einträge erstellen
    const habitatId = await getOrCreateLookupId('habitats', 'name', relations.primary_habitat_name);
    const difficultyId = await getOrCreateLookupId('difficulty_levels', 'level_name', relations.difficulty_level_name);

    const keepingTypeIds = [];
    for (const name of relations.keeping_type_names) {
      const id = await getOrCreateLookupId('keeping_types', 'name', name);
      if (id) keepingTypeIds.push(id);
    }

    const originIds = [];
    for (const name of relations.origin_names) {
      const id = await getOrCreateLookupId('origins', 'name', name);
      if (id) originIds.push(id);
    }

    const feedingCategoryIds = [];
    for (const name of relations.feeding_category_names) {
      const id = await getOrCreateLookupId('feeding_categories', 'name', name);
      if (id) feedingCategoryIds.push(id);
    }

    const foodTypeIds = [];
    for (const name of relations.food_type_names) {
      const id = await getOrCreateLookupId('food_types', 'name', name);
      if (id) foodTypeIds.push(id);
    }

    const swimmingZoneIds = [];
    for (const name of relations.swimming_zone_names) {
      const id = await getOrCreateLookupId('swimming_zones', 'zone_name', name);
      if (id) swimmingZoneIds.push(id);
    }

    // 2. Fisch einfügen
    const fishToInsert = {
      ...fishData,
      primary_habitat_id: habitatId,
      difficulty_level_id: difficultyId,
    };

    const { data: insertedFish, error: fishInsertError } = await supabaseAdmin
      .from('fish')
      .insert(fishToInsert)
      .select('id')
      .single();

    if (fishInsertError) {
      // Prüfen, ob es ein Unique Constraint Fehler ist (z.B. slug oder name existiert schon)
      if (fishInsertError.code === '23505') { // Unique violation
        console.warn(`Fish "${fishData.name}" or slug "${fishData.slug}" likely already exists. Skipping fish insert. Details: ${fishInsertError.details}`);
        // Versuche, den existierenden Fisch zu laden, um Relationen zu setzen
        const { data: existingFish, error: existingFishError } = await supabaseAdmin
            .from('fish')
            .select('id')
            .eq('slug', fishData.slug)
            .single();
        if (existingFishError || !existingFish) {
            console.error(`Could not retrieve existing fish ${fishData.name} after unique violation.`);
            continue; // Nächster Fisch
        }
        insertedFish = existingFish; // Verwende die ID des existierenden Fisches
      } else {
        console.error(`Error inserting fish ${fishData.name}:`, fishInsertError);
        continue; // Nächster Fisch
      }
    }
    if (!insertedFish) {
        console.error(`Failed to insert or retrieve fish ${fishData.name}.`);
        continue;
    }
    const fishId = insertedFish.id;
    console.log(`  Inserted/Found fish ${fishData.name} with ID: ${fishId}`);


    // 3. Relationen in Verbindungstabellen einfügen
    for (const keepingTypeId of keepingTypeIds) {
      const { error } = await supabaseAdmin.from('fish_keeping_types').insert({ fish_id: fishId, keeping_type_id: keepingTypeId });
      if (error && error.code !== '23505') console.error(`Error inserting fish_keeping_type for fish ${fishId}:`, error); // 23505 = unique_violation (PK)
    }
    for (const originId of originIds) {
      const { error } = await supabaseAdmin.from('fish_origins').insert({ fish_id: fishId, origin_id: originId });
      if (error && error.code !== '23505') console.error(`Error inserting fish_origin for fish ${fishId}:`, error);
    }
    for (const feedingCategoryId of feedingCategoryIds) {
      const { error } = await supabaseAdmin.from('fish_feeding_categories_map').insert({ fish_id: fishId, feeding_category_id: feedingCategoryId });
      if (error && error.code !== '23505') console.error(`Error inserting fish_feeding_category_map for fish ${fishId}:`, error);
    }
    for (const foodTypeId of foodTypeIds) {
      const { error } = await supabaseAdmin.from('fish_food_types_suitability').insert({ fish_id: fishId, food_type_id: foodTypeId });
      if (error && error.code !== '23505') console.error(`Error inserting fish_food_type_suitability for fish ${fishId}:`, error);
    }
    for (const swimmingZoneId of swimmingZoneIds) {
      const { error } = await supabaseAdmin.from('fish_swimming_zones').insert({ fish_id: fishId, swimming_zone_id: swimmingZoneId });
      if (error && error.code !== '23505') console.error(`Error inserting fish_swimming_zone for fish ${fishId}:`, error);
    }
  }

  console.log("\nDatabase seeding finished.");
}

seedDatabase().catch(console.error);