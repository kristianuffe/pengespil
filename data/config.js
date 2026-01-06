// data/config.js

export const MONTHS = [
  "Januar","Februar","Marts","April","Maj","Juni",
  "Juli","August","September","Oktober","November","December"
];

// Du kan justere alle beløb og multipliers senere uden at røre logikken
export const CONFIG = {
  food: {
    baseAdultMonthly: 2700,   // pr voksen
    baseChildMonthly: 1700,   // pr barn
    multipliers: {
      // "mad" spørgsmål
      mad: { A: 0.90, B: 1.00, C: 1.15 },
      // "forbrug" påvirker også mad
      forbrug: { A: 0.92, B: 1.00, C: 1.12 },
      // "plan" (planlægning) påvirker mad
      plan: { A: 0.92, B: 1.00, C: 1.10 }
    }
  },

  misc: {
    baseHouseholdMonthly: 1900, // diverse/husholdning pr måned
    basePerChildMonthly: 650,   // ekstra diverse pr barn
    clamp: { min: 0.60, max: 2.20 },
    multipliers: {
      forbrug:       { A: 0.90, B: 1.00, C: 1.20 },
      fritid:        { A: 0.90, B: 1.00, C: 1.25 },
      abonnementer:  { A: 0.90, B: 1.00, C: 1.20 },
      prioritet:     { A: 0.95, B: 1.00, C: 1.10 },
      plan:          { A: 0.95, B: 1.00, C: 1.08 }
    }
  }
};
