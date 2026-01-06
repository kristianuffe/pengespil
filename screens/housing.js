import { getHousingOffers } from "../logic/housingRules.js";
import { calcUtilities } from "../logic/utilities.js";
import { money } from "../core/ui.js";
import { HOUSING } from "../data/housing.js";
export function housingScreen({ els, state, save, router }){
  const fr = state.family?.frugality ?? 0.5;
  const d = state.distance?.distancesKm || { adult1:0, adult2:0 };
  const avgKm = ((d.adult1||0)+(d.adult2||0))/2;
  const kids = state.jobs?.kids ?? 0;
  const { offers, urban, band } = getHousingOffers({ frugality: fr, avgKm });
  const selectedId = state.housing?.id || null;

  const offerHtml = (h)=>{
    const utils = calcUtilities({ kids, sqm:h.sqm, urban:h.urban, distanceBand: band });
    return `
      <div class="choice ${selectedId===h.id?"choice--selected":""}" data-housing="${h.id}">
        <div style="font-weight:900">${h.title}</div>
        <div class="muted small">${h.sqm} m² • ${h.rooms} værelser • ${h.urban.toUpperCase()}</div>
        <div class="hr"></div>
        <div class="kv">
          <div class="k">Husleje</div><div class="v">${h.rentMonthly?money(h.rentMonthly)+" pr. måned":"—"}</div>
          <div class="k">Lån</div><div class="v">${h.loanQuarterly?money(h.loanQuarterly)+" pr. kvartal":"—"}</div>
          <div class="k">Ejerudgifter</div><div class="v">${h.ownerFeesMonthly?money(h.ownerFeesMonthly)+" pr. måned":"—"}</div>
          <div class="k">Reparationer</div><div class="v">${h.repairMonthly?money(h.repairMonthly)+" pr. måned":"—"}</div>
          <div class="k">El</div><div class="v">${money(utils.el)}</div>
          <div class="k">Vand</div><div class="v">${money(utils.water)}</div>
          <div class="k">Varme</div><div class="v">${money(utils.heat)}</div>
        </div>
        <div class="muted small" style="margin-top:10px"><strong>Note:</strong> Lånet står pr. kvartal for at udfordre jeres Excel.</div>
      </div>`;
  };

  els.screen.innerHTML = `
    <div class="card">
      <h1>4) Boligsituation</h1>
      <p class="muted">${urban==="city"?"I bor tæt på byen (dyrere boliger).":urban==="suburb"?"I bor i forstad (blandet).":"I bor langt fra byen (billigere, men dyrere at varme op)."}
      </p>
      <div class="hr"></div>
      <div class="choiceGrid">${offers.map(offerHtml).join("")}</div>
      <div class="hr"></div>
      <div class="row" style="justify-content:flex-end">
        <button class="btn btn--primary" id="nextBtn" ${selectedId?"":"disabled"}>Jeg har tastet indtægter i Excel → Videre</button>
      </div>
    </div>`;

  els.screen.querySelectorAll("[data-housing]").forEach(el=>{
    el.addEventListener("click", ()=>{
      const id = el.getAttribute("data-housing");
      const h = HOUSING.find(x=>x.id===id);
      state.housing = h ? { ...h } : null;
      save(); router.go("housing");
    });
  });
  els.screen.querySelector("#nextBtn").addEventListener("click", ()=>router.go("unexpected"));
}
