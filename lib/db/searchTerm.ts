/**
 * Neutralisiert einen benutzerkontrollierten Suchbegriff.
 *
 * Seit P1 (DB-DEFECT-005) läuft die Suche über die RPC `search_fish_by_language`
 * (GIN-Index, german_unaccent). Der Suchterm wird als JSON-Parameter übergeben —
 * nicht mehr in einen PostgREST-Filterbaum interpoliert — und die RPC sanitisiert
 * serverseitig autoritativ (Regexp-Whitelist, Token >= 2 Zeichen, to_tsquery mit
 * ':*'-Präfixen). Diese clientseitige Vorreinigung bleibt als Defense-in-Depth:
 *  1) Längen-Deckel (64) und Whitespace-Normalisierung schützen die RPC-Kosten.
 *  2) PostgREST-Grammatik- und LIKE-Metazeilen werden weiterhin entfernt —
 *     harmlos für die RPC (deren Whitelist entfernt Reste ohnehin), aber
 *     zukunftssicher, falls ein Aufrufer den Term doch in einen Filter einsetzt.
 */
const POSTGREST_META = /[,.():"\\]/g;

export function sanitizeSearchTerm(raw: string, maxLength = 64): string {
  return raw
    .trim()
    .slice(0, maxLength)          // Planner-Kosten deckeln
    .replace(POSTGREST_META, ' ') // Grammatik-Tokens entfernen
    .replace(/([%_])/g, '\\$1')   // LIKE-Wildcards literal machen
    .replace(/\s+/g, ' ')         // Whitespace normalisieren
    .trim();
}

/**
 * Reduziert benutzergesteuerte Filterwerte auf die Schnittmenge mit den
 * tatsächlich in der Datenbank vorhandenen Werten.
 *
 * Das ist einer Quoting-Strategie überlegen: ein Wert, der nicht in der
 * Allowlist steht, erreicht den Query-Builder überhaupt nicht. Damit sind
 * Metazeichen im Wert per Konstruktion irrelevant.
 */
export function intersectAllowlist(
  requested: string[] | undefined,
  allowed: readonly string[]
): string[] {
  if (!requested || requested.length === 0) return [];
  const allowedSet = new Set(allowed);
  return requested.filter((v) => allowedSet.has(v));
}

/**
 * Serialisiert eine bereits validierte Werteliste als PostgREST-in()-Liste.
 * Doppelte Anführungszeichen werden nach PostgREST-Konvention verdoppelt.
 */
export function toPostgrestInList(values: readonly string[]): string {
  return `(${values.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')})`;
}
