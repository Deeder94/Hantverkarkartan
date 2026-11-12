/** Public-listing exclusion IDs, published only after a verified objection or correction.
 * Do not store names, contact details, addresses or case correspondence here.
 * Add only the Overture Place/GERS ID (or the exact application feature ID).
 * A change requires a new static deployment and an independent verification.
 */
export const SUPPRESSED_PLACE_IDS = new Set([
  // '00000000-0000-0000-0000-000000000000', // example only; do not uncomment
]);

export function isSuppressedListing(feature) {
  if (!feature) return false;
  const p = feature.properties || {};
  const keys = [feature.id, p.id, p.overtureId].filter(value => value != null);
  return keys.some(key => SUPPRESSED_PLACE_IDS.has(String(key)));
}
