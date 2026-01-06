import { MONTHS } from "../data/config.js";
import { drawUnexpectedForMonth } from "../data/unexpected.js";
import { hashStringToSeed, mulberry32 } from "../logic/random.js";
import { money } from "../core/ui.js";

function ensureUnexpectedState(state){
  if (!state.unexpected) state.unexpected = { monthIndex: 0, months: [] };
  if (!Array.isArray(state.unexpected.months) || state.unexpected.months.length !== 12){
    state.unexpected.months = Array.from({ length: 12 }, () => ({ draws: [], locked: false }));
  }
}

function labelSource(d){
  if (d.source === "A") return "Person A";
  if (d.source === "B") return "Person B";
  return "Generel";
}

function labelMode(d){
  if (!d.mode) return "";
  if (d.mode === "car") return "Bil";
  if (d.mode === "public") return "Offentligt";
  if (d.mode === "bike") return "Cykel";
  return d.mode;
}

export function unexpectedScreen({ els, state, save, router }){
  ensureUnexpectedState(state);

  const idx = Number.isFinite(state.unexpected.monthIndex) ? state.unexpected.monthIndex : 0;
  const month = state.unexpected.months[idx];

  const modeA = state.transport?.modeA || null;
  const modeB = state.transport?.modeB || null;

  const canDraw = (month.draws?.length || 0) < 2;

  // Deterministisk RNG pr session+måned+træk-nummer (så man kan reproducere)
  function makeRng(drawIndex){
    const seed = hashStringToSeed(`${state.sessionId}:${idx}:${drawIndex}:${modeA || "none"}:${modeB || "none"}`);
    return mulberry32(seed);
  }

  function drawOne(){
    if (!month.draws) month.draws = [];
    if (month.draws.length >= 2) return;

    // drawIndex = 0 eller 1 i måneden
    const rng = makeRng(month.draws.length);

    // drawUnexpectedForMonth gemmer automatisk i state.unexpected.months[idx].draws
    drawUnexpectedForMonth(state, idx, { rng });

    save();
    router.go("unexpected");
  }

  function nextMonth(){
    if ((month.draws?.length || 0) < 2) return;

    if (idx < 11){
      state.unexpected.monthIndex = idx + 1;
      save();
      router.go("unexpected");
    } else {
      router.go("summary");
    }
  }

  const totalMonth = (month.draws || []).reduce((s, d) => s + (Number(d.cost) || 0), 0);

  els.screen.innerHTML = `
    <div class="card">
      <h1>5) Uforudsete udgifter</h1>
      <p class="muted">Træk maks. 2 kort pr. måned. Venstre side viser månedernes træk. Overblikket til højre regner dem som gennemsnit.</p>

      <div class="hr"></div>

      <div class="row" style="align-items:flex-start">
        <div class="col">
          <h2>${MONTHS[idx]}</h2>
          <div class="muted small">
            Transport: <strong>Person A:</strong> ${modeA || "—"} • <strong>Person B:</strong> ${modeB || "—"}
          </div>

          <div class="hr"></div>

          <div class="row" style="gap:10px; align-items:center">
            <button class="btn btn--primary" id="drawBtn" ${canDraw ? "" : "disabled"}>Træk kort</button>
            <span class="badge">Træk: ${(month.draws?.length || 0)}/2</span>
            <span class="badge">Måned i alt: <strong>${money(totalMonth)}</strong></span>
          </div>

          <div class="hr"></div>

          ${(month.draws?.length || 0) ? `
            <h2>Trukket</h2>
            <ul class="muted">
              ${month.draws.map(d => `
                <li>
                  ${d.text}
                  ${d.cost ? `<strong>(${money(d.cost)})</strong>` : ""}
                  <span class="badge" style="margin-left:8px">${labelSource(d)}${labelMode(d) ? ` • ${labelMode(d)}` : ""}</span>
                </li>
              `).join("")}
            </ul>
          ` : `<p class="muted">Ingen kort trukket endnu.</p>`}

          <div class="hr"></div>

          <div class="row" style="justify-content:flex-end">
            <button class="btn btn--primary" id="nextMonthBtn" ${(month.draws?.length || 0) === 2 ? "" : "disabled"}>
              Jeg har tastet indtægter i Excel → Videre
            </button>
          </div>

          <p class="muted small">Tip: Når I har trukket 2 kort, tast dem i jeres Excel for ${MONTHS[idx]}.</p>
        </div>

        <div class="col">
          <h2>Regler</h2>
          <ul class="muted">
            <li>Der må trækkes <strong>2</strong> kort pr. måned.</li>
            <li>Der er <strong>60%</strong> chance for et generelt kort.</li>
            <li>Der er <strong>20%</strong> chance for et transport-kort til Person A og <strong>20%</strong> til Person B.</li>
            <li>Inden for hver type varierer beløbene efter prisniveauer.</li>
          </ul>
        </div>
      </div>
    </div>
  `;

  els.screen.querySelector("#drawBtn").addEventListener("click", drawOne);
  els.screen.querySelector("#nextMonthBtn").addEventListener("click", nextMonth);
}
