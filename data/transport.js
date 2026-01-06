// Alle tal er med vilje nemme at ændre senere

export const TRANSPORT_RULES = {
  workdaysPerMonth: 20,

  bike: { fixedMonthly: 120 },

  public: {
    baseMonthly: 350,
    perKmMonthly: 12,
    minMonthly: 350
  },

  car: {
    fixedMonthly: 600,
    insuranceMonthly: 550,
    fuelPerKm: 1.35
  }
};

// ✅ Bruges af jokerkort / unexpected for at målrette hændelser
export const TRANSPORT_TAGS = {
  bike: ["bike", "cycle", "cykel"],
  public: ["public", "pt", "offentligt", "bus", "tog"],
  car: ["car", "auto", "bil"]
};

export function allowedModesForKm(km){
  if (km < 10) return ["bike", "public"];
  if (km <= 20) return ["public", "car"];
  return ["public", "car"];
}

export function calcTransportForPerson({ km, mode }){
  const days = TRANSPORT_RULES.workdaysPerMonth;

  if (!mode) return { total: 0, fixed: 0, insurance: 0, fuel: 0, public: 0, bike: 0 };

  if (mode === "bike"){
    const bike = TRANSPORT_RULES.bike.fixedMonthly;
    return { total: bike, fixed: 0, insurance: 0, fuel: 0, public: 0, bike };
  }

  if (mode === "public"){
    const pub = Math.max(
      TRANSPORT_RULES.public.minMonthly,
      TRANSPORT_RULES.public.baseMonthly + Math.round(km * TRANSPORT_RULES.public.perKmMonthly)
    );
    return { total: pub, fixed: 0, insurance: 0, fuel: 0, public: pub, bike: 0 };
  }

  if (mode === "car"){
    const fuel = Math.round(km * 2 * days * TRANSPORT_RULES.car.fuelPerKm);
    const fixed = TRANSPORT_RULES.car.fixedMonthly;
    const insurance = TRANSPORT_RULES.car.insuranceMonthly;
    const total = fixed + insurance + fuel;
    return { total, fixed, insurance, fuel, public: 0, bike: 0 };
  }

  return { total: 0, fixed: 0, insurance: 0, fuel: 0, public: 0, bike: 0 };
}

export function modeLabel(mode){
  return mode === "bike" ? "Cykel"
    : mode === "public" ? "Offentligt"
    : mode === "car" ? "Bil"
    : "—";
}
