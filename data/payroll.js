// Super-forenklet lønseddel-model (nem at ændre senere)
export const PAYROLL = {
  amRate: 0.08,        // AM-bidrag 8%
  taxRate: 0.37,       // A-skat 37% af (brutto - AM)
  atp: 94,             // ATP pr måned (fast beløb)
};

// Beregn poster til lønseddel
export function calcPayslip(gross){
  const am = Math.round(gross * PAYROLL.amRate);
  const base = Math.max(0, gross - am);
  const tax = Math.round(base * PAYROLL.taxRate);
  const atp = PAYROLL.atp;
  const net = Math.max(0, gross - am - tax - atp);
  return { gross, am, tax, atp, net };
}

export function formatKr(n){
  return `${Math.round(n).toLocaleString("da-DK")} kr.`;
}
