// logic/expenses.js
function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

function multFrom(obj, key, fallback = 1.0) {
  if (!obj || typeof obj !== "object") return fallback;
  const v = obj[key];
  return (typeof v === "number" && Number.isFinite(v)) ? v : fallback;
}

export function computeFoodMonthly({ config, answers, kidsCount }) {
  const baseAdult = Number(config?.food?.baseAdultMonthly ?? 2600);
  const baseChild = Number(config?.food?.baseChildMonthly ?? 1600);

  const mults = config?.food?.multipliers ?? {};

  const mad = answers?.mad ?? null;
  const forbrug = answers?.forbrug ?? null;
  const plan = answers?.plan ?? null;

  const madMult = multFrom(mults.mad, mad, 1.0);
  const forbrugMult = multFrom(mults.forbrug, forbrug, 1.0);
  const planMult = multFrom(mults.plan, plan, 1.0);

  const raw = (2 * baseAdult + kidsCount * baseChild) * madMult * forbrugMult * planMult;
  return Math.round(raw / 10) * 10;
}

export function computeMiscMonthly({ config, answers, kidsCount }) {
  const baseHousehold = Number(config?.misc?.baseHouseholdMonthly ?? 1700);
  const basePerChild = Number(config?.misc?.basePerChildMonthly ?? 550);

  const mults = config?.misc?.multipliers ?? {};
  const clampMin = Number(config?.misc?.clamp?.min ?? 0.55);
  const clampMax = Number(config?.misc?.clamp?.max ?? 2.1);

  const keys = {
    forbrug: answers?.forbrug ?? null,
    fritid: answers?.fritid ?? null,
    abonnementer: answers?.abonnementer ?? null,
    prioritet: answers?.prioritet ?? null,
    plan: answers?.plan ?? null,
  };

  const m =
    multFrom(mults.forbrug, keys.forbrug, 1.0) *
    multFrom(mults.fritid, keys.fritid, 1.0) *
    multFrom(mults.abonnementer, keys.abonnementer, 1.0) *
    multFrom(mults.prioritet, keys.prioritet, 1.0) *
    multFrom(mults.plan, keys.plan, 1.0);

  const mult = clamp(m, clampMin, clampMax);
  const raw = (baseHousehold + kidsCount * basePerChild) * mult;
  return Math.round(raw / 10) * 10;
}

export function computeFoodMiscBundle({ config, answers, kidsCount }) {
  const food = computeFoodMonthly({ config, answers, kidsCount });
  const misc = computeMiscMonthly({ config, answers, kidsCount });
  return {
    foodMonthly: food,
    miscMonthly: misc,
    totalMonthly: food + misc
  };
}
