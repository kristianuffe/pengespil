import { calcTransportForPerson } from "../data/transport.js";
import { calcPayslip } from "../data/payroll.js";
import { CONFIG } from "../data/config.js";
import { computeFoodMiscBundle } from "./expenses.js";

export function computeEconomy(state){
  const incomeObj = computeIncomeMonthly(state);        // netto
  const transportObj = computeTransportMonthly(state);
  const housing = computeHousingMonthly(state);
  const unexpected = computeUnexpectedMonthly(state);

  const foodMiscObj = computeFoodMiscMonthly(state);    // <-- guarded
  const foodMisc = foodMiscObj.totalMonthly;

  const expenses = transportObj.total + housing + unexpected + foodMisc;
  const free = incomeObj.netTotal - expenses;

  return {
    income: incomeObj.netTotal,
    incomeBreakdown: incomeObj,

    transport: transportObj.total,
    transportBreakdown: transportObj,

    housing,
    unexpected,

    food: foodMiscObj.foodMonthly,
    misc: foodMiscObj.miscMonthly,
    foodMisc,

    expenses,
    free
  };
}

function computeIncomeMonthly(state){
  const gA = Number(state?.income?.grossA || 0);
  const gB = Number(state?.income?.grossB || 0);

  const pA = gA ? calcPayslip(gA) : { net: 0 };
  const pB = gB ? calcPayslip(gB) : { net: 0 };

  return {
    netA: Math.round(pA.net || 0),
    netB: Math.round(pB.net || 0),
    netTotal: Math.round((pA.net || 0) + (pB.net || 0))
  };
}

function computeTransportMonthly(state){
  const d = state?.distance;
  const t = state?.transport;

  if (!d || !d.generated) return emptyTransport();
  if (!t?.modeA || !t?.modeB) return emptyTransport();
  if (!d.a?.km || !d.b?.km) return emptyTransport();

  const A = calcTransportForPerson({ km: d.a.km, mode: t.modeA });
  const B = calcTransportForPerson({ km: d.b.km, mode: t.modeB });

  return {
    total: A.total + B.total,
    A, B,
    carFixed: (A.fixed||0) + (B.fixed||0),
    carInsurance: (A.insurance||0) + (B.insurance||0),
    carFuel: (A.fuel||0) + (B.fuel||0),
    public: (A.public||0) + (B.public||0),
    bike: (A.bike||0) + (B.bike||0)
  };
}

function emptyTransport(){
  return { total:0, A:null, B:null, carFixed:0, carInsurance:0, carFuel:0, public:0, bike:0 };
}

function computeHousingMonthly(state){
  const h = state?.housingChoice || state?.housing;
  if (!h) return 0;

  const rent = h.rentMonthly || 0;
  const loanQ = h.loanQuarterly || 0;
  const loanM = Math.round(loanQ / 3);
  const util = h.utilitiesMonthly || 0;
  const fees = h.feesMonthly || 0;
  return rent + loanM + util + fees;
}

function computeUnexpectedMonthly(state){
  const months = state?.unexpected?.months || [];
  let total = 0;

  for (const m of months){
    for (const d of (m.draws || [])){
      total += Number(d?.cost || 0);
    }
  }
  if (total <= 0) return 0;
  return Math.round(total / 12);
}

function computeFoodMiscMonthly(state){
  // ✅ VIGTIGT: først når jobs/løn er “på plads”
  const jobsReady = !!state?.jobs?.drawn;
  const hasIncome = (Number(state?.income?.grossA || 0) > 0) && (Number(state?.income?.grossB || 0) > 0);

  if (!jobsReady || !hasIncome){
    return { foodMonthly: 0, miscMonthly: 0, totalMonthly: 0 };
  }

  const kidsCount = Number(state?.jobs?.kids ?? 0);
  const answers = state?.familyProfile?.answers || {};
  return computeFoodMiscBundle({ config: CONFIG, answers, kidsCount });
}
