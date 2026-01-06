import { computeEconomy } from "../logic/economy.js";

function kr(n){
  const v = Math.round(Number(n || 0));
  return `${v.toLocaleString("da-DK")} kr.`;
}

export function renderEconomySidebar(el, state){
  let e;
  try{
    e = computeEconomy(state);
  } catch (err){
    el.innerHTML = `
      <h3 class="sidebar__title">Overblik</h3>
      <div class="muted small">Fejl i økonomi-beregning:</div>
      <div class="muted small" style="margin-top:8px">${String(err?.message || err)}</div>
    `;
    return;
  }

  const freeCls = e.free < 0 ? "red" : "green";
  const tb = e.transportBreakdown || {};

  el.innerHTML = `
    <h3 class="sidebar__title">Overblik</h3>
    <div class="muted small">Månedligt (netto indtægt)</div>

    <div class="hr"></div>

    <div class="kv">
      <div class="k">Indtægt (netto)</div><div class="v">${kr(e.income)}</div>

      <div class="k">Mad</div><div class="v">${kr(e.food || 0)}</div>
      <div class="k">Diverse</div><div class="v">${kr(e.misc || 0)}</div>

      <div class="k">Transport</div><div class="v">${kr(e.transport)}</div>
      <div class="k">Bolig</div><div class="v">${kr(e.housing)}</div>
      <div class="k">Uforudsete (gns.)</div><div class="v">${kr(e.unexpected)}</div>
    </div>

    <div class="hr"></div>

    <div class="kv">
      <div class="k">Udgifter i alt</div><div class="v">${kr(e.expenses)}</div>
      <div class="k">Rådighed</div><div class="v ${freeCls}">${kr(e.free)}</div>
    </div>

    ${renderTransportDetails(state, tb)}
  `;
}

function renderTransportDetails(state, tb){
  const d = state?.distance;
  const t = state?.transport;

  // vis ikke detaljer før afstand er genereret + valg er taget
  if (!d?.generated || !t?.modeA || !t?.modeB) return "";

  const A = tb?.A || null;
  const B = tb?.B || null;

  const aIsCar = t.modeA === "car";
  const bIsCar = t.modeB === "car";

  const perPerson = [];
  if (aIsCar && A){
    perPerson.push(carSection("Bil A", d?.a?.km, A));
  }
  if (bIsCar && B){
    perPerson.push(carSection("Bil B", d?.b?.km, B));
  }

  const totals = [];
  // Offentligt/cykel totals (giver mening at vise samlet)
  if (tb.public) totals.push(row("Offentligt (i alt)", tb.public));
  if (tb.bike) totals.push(row("Cykel (i alt)", tb.bike));

  // Hvis ingen biler men der alligevel er bil-komponenter (fallback)
  if (!aIsCar && !bIsCar){
    if (tb.carFixed) totals.push(row("Bil – faste udg.", tb.carFixed));
    if (tb.carInsurance) totals.push(row("Bil – forsikring", tb.carInsurance));
    if (tb.carFuel) totals.push(row("Bil – benzin", tb.carFuel));
  }

  if (!perPerson.length && !totals.length) return "";

  return `
    <div class="hr"></div>
    <div class="muted small" style="font-weight:800;margin-bottom:6px">Transport (detaljer)</div>
    ${perPerson.join("")}
    ${totals.length ? `<div class="kv">${totals.join("")}</div>` : ""}
  `;
}

function carSection(title, km, p){
  return `
    <div class="payslip" style="margin-bottom:10px">
      <div class="payslip__title">${title}${Number.isFinite(km) ? ` • ${km} km` : ""}</div>
      <div class="kv">
        <div class="k">Faste udg.</div><div class="v">${kr(p.fixed || 0)}</div>
        <div class="k">Forsikring</div><div class="v">${kr(p.insurance || 0)}</div>
        <div class="k">Benzin</div><div class="v">${kr(p.fuel || 0)}</div>
        <div class="k">I alt</div><div class="v">${kr(p.total || 0)}</div>
      </div>
    </div>
  `;
}

function row(label, value){
  return `<div class="k">${label}</div><div class="v">${kr(value)}</div>`;
}
