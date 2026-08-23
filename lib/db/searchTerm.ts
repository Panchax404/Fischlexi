/**
 * Neutralisiert einen benutzerkontrollierten Suchbegriff für die Verwendung
 * innerhalb eines PostgREST-or()-Logikbaums.
 *
 * Zwei getrennte Bedrohungen werden adressiert:
 *  1) PostgREST-Grammatik: , . ( ) : " \ trennen Tokens bzw. Klauseln.
 *     Unescaped erlauben sie das Einschmuggeln zusätzlicher Prädikate.
 *  2) SQL-LIKE-Semantik: % und _ sind Wildcards. Unescaped erlauben sie
 *     Volltabellen-Matches und teure Planner-Pfade.
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
