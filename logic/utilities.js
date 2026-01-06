export function calcUtilities({ kids, sqm, urban, distanceBand }){
  const baseEl = 320, baseWater = 260, baseHeat = 650;
  const kidsFactor = Math.max(0, kids) * 0.18;
  const sizeFactor = Math.max(0, (sqm - 60)) * 6;
  const ruralPenalty = (urban === "rural" ? 220 : 0) + (urban === "suburb" ? 80 : 0);
  const distanceHeatPenalty = distanceBand === "long" ? 180 : distanceBand === "mid" ? 60 : 0;
  const el = Math.round(baseEl * (1 + kidsFactor) + sizeFactor*0.15);
  const water = Math.round(baseWater * (1 + kidsFactor) + sizeFactor*0.08);
  const heat = Math.round(baseHeat + ruralPenalty + distanceHeatPenalty + sizeFactor*0.2);
  return { el, water, heat };
}
