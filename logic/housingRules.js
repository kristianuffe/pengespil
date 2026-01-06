import { HOUSING } from "../data/housing.js";
export function distanceBand(avgKm){
  if (avgKm <= 6) return "short";
  if (avgKm <= 18) return "mid";
  return "long";
}
export function urbanFromDistanceBand(band){
  if (band === "short") return "city";
  if (band === "mid") return "suburb";
  return "rural";
}
export function bracketFromFrugality(frugality){
  if (frugality <= 0.35) return ["cheap","mid","cheap"];
  if (frugality <= 0.65) return ["cheap","mid","high"];
  return ["mid","high","high"];
}
export function getHousingOffers({ frugality, avgKm }){
  const band = distanceBand(avgKm);
  const urban = urbanFromDistanceBand(band);
  const brackets = bracketFromFrugality(frugality);
  const pool = HOUSING.filter(h => h.urban === urban);
  const offers = []; const used = new Set();
  for (const b of brackets){
    const candidates = pool.filter(h => h.bracket === b && !used.has(h.id));
    const pick = (candidates.length ? candidates : pool.filter(h => !used.has(h.id)))[0];
    if (pick){ used.add(pick.id); offers.push(pick); }
  }
  while (offers.length < 3 && pool.length){
    const next = pool.find(h => !used.has(h.id));
    if (!next) break;
    used.add(next.id); offers.push(next);
  }
  return { offers, urban, band };
}
