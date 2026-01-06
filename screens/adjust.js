import { allowedModesForKm, modeLabel } from "../data/transport.js";
import { FAMILIES } from "../data/families.js";

export function adjustScreen({ els, state, save, router }){
  // sørg for transport-state findes
  if (!state.transport) state.transport = { modeA:null, modeB:null };

  const d = state.distance;
  const canAdjustTransport = !!(d?.generated && d?.a?.km && d?.b?.km);

  const famKey = state.familyKey || state.family?.key || "comfort";

  els.screen.innerHTML = `
    <div class="card">
      <h1>Justér valg og få budgettet til at gå op</h1>
      <p class="muted">
        Her kan I ændre på nogle valg og se overblikket ændre sig automatisk.
      </p>

      <div class="hr"></div>

      <div class="row">
        <div class="col">
          <h2>Familietype</h2>
          <p class="muted small">Skift familietype og se hvordan det påvirker økonomien.</p>

          <select class="btn" id="familySelect" style="width:100%">
            ${FAMILIES.map(f => `
              <option value="${f.key}" ${f.key === famKey ? "selected":""}>${f.title}</option>
            `).join("")}
          </select>
        </div>

        <div class="col">
          <h2>Transport</h2>
          ${canAdjustTransport ? `
            <p class="muted small">I kan ændre transport for begge personer. Afstanden er fast.</p>

            <div class="hr"></div>

            <div class="row equal-cols">
              <div class="col">
                <div style="font-weight:900;margin-bottom:6px">Person A • ${d.a.km} km</div>
                ${renderModeSelect("A", d.a.km, state.transport.modeA)}
              </div>
              <div class="col">
                <div style="font-weight:900;margin-bottom:6px">Person B • ${d.b.km} km</div>
                ${renderModeSelect("B", d.b.km, state.transport.modeB)}
              </div>
            </div>
          ` : `
            <p class="muted small">Transport kan først justeres efter afstand er genereret.</p>
          `}
        </div>
      </div>

      <div class="hr"></div>

      <div class="row" style="justify-content:flex-end">
        <button class="btn btn--primary" id="toSummary">Til resume →</button>
      </div>
    </div>
  `;

  // familietype
  els.screen.querySelector("#familySelect").addEventListener("change", (e)=>{
    const key = e.target.value;
    state.familyKey = key;
    state.family = FAMILIES.find(x=>x.key===key) || state.family;
    save();
  });

  // transport A/B
  if (canAdjustTransport){
    els.screen.querySelectorAll("[data-person][data-mode]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const person = btn.getAttribute("data-person");
        const mode = btn.getAttribute("data-mode");
        if (person === "A") state.transport.modeA = mode;
        if (person === "B") state.transport.modeB = mode;
        save();
        router.go("adjust");
      });
    });
  }

  els.screen.querySelector("#toSummary").addEventListener("click", ()=>{
    router.go("summary");
  });
}

function renderModeSelect(person, km, picked){
  const allowed = allowedModesForKm(km);

  return `
    <div class="choiceGrid choiceGrid--two">
      ${allowed.map(mode => `
        <div class="choice ${picked===mode ? "choice--selected":""}" data-person="${person}" data-mode="${mode}">
          <div style="font-weight:900">${modeLabel(mode)}</div>
          <div class="muted small">${modeHint(mode)}</div>
        </div>
      `).join("")}
    </div>
  `;
}

function modeHint(mode){
  if (mode === "bike") return "Små faste udgifter";
  if (mode === "public") return "Dyrere jo længere afstand";
  if (mode === "car") return "Fast + forsikring + benzin";
  return "";
}
