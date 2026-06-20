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

  // Felder aus DB Schema
  water_ph_min?: number | null;
  water_ph_max?: number | null;
  water_hardness_dh_min?: number | null;
  water_hardness_dh_max?: number | null;

  aquarium_min_liters?: number | null;
  aquarium_min_edge_length_cm?: number | null;

  // Transformierte Felder für UI
  phWert?: string; // z.B. "6.0 - 7.5"
  hardness?: string; // z.B. "5 - 15 dH"
  min_tank_size?: string; // z.B. "54 Liter"
  min_tank_length?: string; // z.B. "60 cm"
  lifespan?: string; // z.B. "3 - 5 Jahre"
  common_names?: string; // joined string

  is_published?: boolean;
  author_notes?: string | null;
  created_at?: string;
  updated_at?: string;

  // Felder, die durch Joins von der API gefüllt und transformiert werden
  habitat?: string | null;
  difficulty?: string | null;
  herkunft: string[];
  haltung: string[];
  ernahrung_kategorien?: string[];
  futter_arten?: string[];
  ernahrung: string[];
  schwimmhoehe: string[];
};

export type FilterState = {
  haltung?: string[];
  ernahrung?: string[];
  schwimmhoehe?: string[];
  herkunft?: string[];
  temperatur?: { min: number; max: number };
  phWert?: { min: number; max: number };
  hardness?: { min: number; max: number };
  liters?: number; // Mindest-Liter
  length?: number; // Mindest-Kantenlänge
};

// Origin type matching the DB schema (with ltree path for hierarchical filtering)
export type Origin = {
  id: number;
  name: string;
  type: 'continent' | 'country' | 'region' | 'waterbody' | 'other';
  parent_id: number | null;
  slug: string;
  path: string; // ltree path as string, e.g. "suedamerika.brasilien"
  fishCount?: number;
};

export type FilterOptions = {
  haltung: string[];
  ernahrung: string[];
  temperatur: string[];
  schwimmhoehe: string[];
  herkunft: Origin[]; // Changed from string[] to full Origin objects
  crossRefs: OriginCrossRef[]; // Cross-references for multi-parent display
  bounds?: {
    temperatur: { min: number; max: number };
    phWert: { min: number; max: number };
    hardness: { min: number; max: number };
    liters: { min: number; max: number };
    length: { min: number; max: number };
  };
};

// Cross-reference: An origin that also appears under an additional parent
export type OriginCrossRef = {
  origin_id: number;
  also_appears_under_id: number;
};

