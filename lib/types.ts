export type Fish = {
  id: number; // oder string, falls du UUIDs verwendest, aber bigint in DB wird zu number in JS
  name: string;
  slug: string;
  latin_name: string; // Geändert von latin
  common_other_names?: string[] | null; // Optional und kann null sein

  image_url_main?: string | null;
  image_gallery_urls?: string[] | null;

  // Die spezifischen Beschreibungsfelder
  description_general?: string | null;
  description_habitat_details?: string | null;
  description_care_aquarium?: string | null;
  description_social_behavior?: string | null;
  description_breeding?: string | null;

  // Größe als einzelne Strings (wie von deiner API transformiert) oder als Zahlen,
  // je nachdem, was deine API zurückgibt und dein Frontend erwartet.
  // Die API transformiert es aktuell zu einem String 'size'.
  size: string; // z.B. "10 - 15 cm" (von API transformiert)
  // Alternativ, wenn du Min/Max Zahlen im Frontend willst:
  // size_cm_min?: number | null;
  // size_cm_max?: number | null;

  lifespan_years_min?: number | null;
  lifespan_years_max?: number | null;

  // Temperatur als String (wie von deiner API transformiert)
  temperatur: string; // z.B. "22-26°C" (von API transformiert)
  // Alternativ, wenn du Min/Max Zahlen im Frontend willst:
  // water_temperature_min_c?: number | null;
  // water_temperature_max_c?: number | null;

  water_ph_min?: number | null;
  water_ph_max?: number | null;
  water_hardness_dh_min?: number | null;
  water_hardness_dh_max?: number | null;

  aquarium_min_liters?: number | null;
  aquarium_min_edge_length_cm?: number | null;

  is_published: boolean;
  author_notes?: string | null;
  created_at: string; // Timestamps kommen als ISO-Strings
  updated_at: string;

  // Felder, die durch Joins von der API gefüllt und transformiert werden
  habitat?: string | null;          // Name des primären Habitats
  difficulty?: string | null;       // Name des Schwierigkeitslevels
  herkunft: string[];              // Array von Herkunftsnamen
  haltung: string[];               // Array von Haltungsform-Namen
  ernahrung_kategorien?: string[];  // Array von Ernährungskategorie-Namen (optional, wenn du nur 'ernahrung' verwendest)
  futter_arten?: string[];          // Array von Futterart-Namen (optional, wenn du nur 'ernahrung' verwendest)
  ernahrung: string[];             // Kombinierte Liste von Ernährung/Futter
  schwimmhoehe: string[];            // Array von Schwimmzonen-Namen

  // Die folgenden Felder aus dem Datenbankobjekt werden von der API entfernt/überschrieben,
  // daher sind sie hier nicht unbedingt nötig, es sei denn, du greifst auf das Rohobjekt vor der Transformation zu.
  // primary_habitat?: { id: number; name: string; description?: string | null } | null;
  // difficulty_level?: { id: number; level_name: string; description?: string | null } | null;
};

// Ggf. auch andere Typen hier zentralisieren:

export type FilterState = {
  haltung?: string[];       // Array!
  ernahrung?: string[];     // Array!
  temperatur?: { min: number; max: number }; 
  schwimmhoehe?: string[];  // Array!
  herkunft?: string[];      // Array!
  phWert?: { min: number; max: number }; // NEU für pH-Wert
};

export type FilterOptions = {
  haltung: string[];
  ernahrung: string[];
  temperatur: string[];
  schwimmhoehe: string[];
  herkunft: string[];
};

