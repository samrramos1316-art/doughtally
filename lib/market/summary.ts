// The one-line Market Watch summary. Pure, so it runs under `node --test`.
//
// "Wheat prices are up 13.2% over 90 days — your All-Purpose Flour, Bread
// Flour costs may follow." Context, not a forecast (§7): no dollar amounts.
// When the business's own latest price for one of those ingredients moved
// the other way (a price alert in the same window), say that instead of
// "may ease": a supplier raising butter while wholesale butter falls is
// worth a question to the supplier, not reassurance.
export type OwnMove = { ingredient: string; pct: number };

export function summarize(name: string, pct: number, windowDays: number, exposed: string[], own?: OwnMove | null) {
  const span = `over ${windowDays} days`;
  const move = Math.abs(pct) < 1 ? `are roughly flat ${span}` : `are ${pct > 0 ? "up" : "down"} ${Math.abs(pct).toFixed(1)}% ${span}`;
  if (!exposed.length || Math.abs(pct) < 1) return `${name} ${move}.`;
  if (own && Math.abs(own.pct) >= 1 && Math.sign(own.pct) !== Math.sign(pct)) {
    return `${name} ${move}, but your ${own.ingredient} went ${own.pct > 0 ? "up" : "down"} ${Math.abs(own.pct).toFixed(1)}% on your latest invoice — worth asking your supplier why.`;
  }
  const list = exposed.length > 3 ? `${exposed.slice(0, 3).join(", ")} and ${exposed.length - 3} more` : exposed.join(", ");
  return `${name} ${move} — your ${list} costs may ${pct > 0 ? "follow" : "ease"}.`;
}
