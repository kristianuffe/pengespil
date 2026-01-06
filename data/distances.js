// Vægtede sandsynligheder for at få afstand til job (km)
// Du kan justere alt her (værdier + weights)
export const DISTANCE_BUCKETS = [
  { label: "Cykelafstand", min: 1,  max: 6,  weight: 0.30 },
  { label: "Kort",         min: 7,  max: 15, weight: 0.35 },
  { label: "Mellem",       min: 16, max: 35, weight: 0.25 },
  { label: "Lang",         min: 36, max: 70, weight: 0.10 },
];

export function pickDistanceKm(rng=Math.random){
  const r = rng();
  let acc = 0;
  let bucket = DISTANCE_BUCKETS[DISTANCE_BUCKETS.length-1];
  for (const b of DISTANCE_BUCKETS){
    acc += b.weight;
    if (r <= acc){ bucket = b; break; }
  }
  const km = Math.floor(bucket.min + rng() * (bucket.max - bucket.min + 1));
  return { km, bucket: bucket.label };
}
