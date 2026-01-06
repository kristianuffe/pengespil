import { pickDistanceKm } from "../data/distances.js";
import { allowedModesForKm, modeLabel } from "../data/transport.js";

function animateNumbers(el, ms = 3200, tickMs = 140){
  return new Promise((resolve)=>{
    let timer = null;
    const start = Date.now();

    const tick = ()=>{
      const fakeA = Math.floor(1 + Math.random()*70);
      const fakeB = Math.floor(1 + Math.random()*70);
      el.innerHTML = `
        <div class="muted">Genererer afstande…</div>
        <div style="font-weight:900; font-size:18px; margin-top:6px">
          Person A: ${fakeA} km &nbsp; • &nbsp; Person B: ${fakeB} km
        </div>
      `;

      if (Date.now() - start >= ms){
        clearInterval(timer);
        resolve();
      }
    };

    tick();
    timer = setInterval(tick, tickMs);
  });
}

export function distanceScreen({ els, state, save, router }){
  if (!state.distance){
    state.distance = { generated:false, a:null, b:null };
    save();
  }
  if (!state.transport){
    state.transport = { modeA:null, modeB:null };
    save();
  }

  const d = state.distance;
  const t = state.transport;

  els.screen.innerHTML = `
    <div class="card">
      <h1>3) Afstand og transport</h1>
      <p class="muted">Afstanden genereres tilfældigt. Ud fra afstanden får hver person et realistisk valg af transport.</p>

      <div class="hr"></div>

      <div class="payslip">
        <div class="payslip__title">Afstand til arbejde</div>
        <div id="genText" class="muted">
          ${d.generated
            ? `Person A: <strong>${d.a.km} km</strong> (${d.a.bucket}) • Person B: <strong>${d.b.km} km</strong> (${d.b.bucket})`
            : "Klar til at generere…"}
        </div>
        <div class="hr"></div>
        <button class="btn btn--primary" id="genBtn" ${d.generated ? "disabled":""}>🎲 Generér afstande</button>
      </div>

      ${d.generated ? `
        <div class="hr"></div>

        <div class="row equal-cols">
          <div class="col">
            <h2>Person A</h2>
            <p class="muted">Afstand: <strong>${d.a.km} km</strong> – vælg transport:</p>
            ${renderModeChoices("A", d.a.km, t.modeA)}
          </div>

          <div class="col">
            <h2>Person B</h2>
            <p class="muted">Afstand: <strong>${d.b.km} km</strong> – vælg transport:</p>
            ${renderModeChoices("B", d.b.km, t.modeB)}
          </div>
        </div>

        <div class="hr"></div>

        <div class="row" style="justify-content:flex-end">
          <button class="btn btn--primary" id="nextBtn" ${(t.modeA && t.modeB) ? "" : "disabled"}>
            Jeg har tastet transport i Excel → Videre
          </button>
        </div>
      ` : ``}
    </div>
  `;

  const genText = els.screen.querySelector("#genText");
  const genBtn = els.screen.querySelector("#genBtn");

  genBtn.addEventListener("click", async ()=>{
    genBtn.disabled = true;

    await animateNumbers(genText, 3400, 150);

    d.a = pickDistanceKm();
    d.b = pickDistanceKm();
    d.generated = true;

    t.modeA = null;
    t.modeB = null;

    save();
    router.go("distance");
  });

  if (d.generated){
    els.screen.querySelectorAll("[data-person][data-mode]").forEach(el=>{
      el.addEventListener("click", ()=>{
        const person = el.getAttribute("data-person");
        const mode = el.getAttribute("data-mode");
        if (person === "A") t.modeA = mode;
        if (person === "B") t.modeB = mode;
        save();
        router.go("distance");
      });
    });

    els.screen.querySelector("#nextBtn").addEventListener("click", ()=>{
      router.go("housing");
    });
  }
}

function renderModeChoices(person, km, picked){
  const allowed = allowedModesForKm(km);
  const explain = {
    bike: "Billigt – små faste udgifter (vedligehold).",
    public: "Offentligt – dyrere jo længere man skal.",
    car: "Bil – fast + forsikring + benzin (separate poster i Excel)."
  };

  // 2 kolonner her for at undgå at B bliver “for lav”
  return `
    <div class="choiceGrid choiceGrid--two">
      ${allowed.map(mode=>{
        const sel = picked === mode;
        return `
          <div class="choice ${sel ? "choice--selected":""}" data-person="${person}" data-mode="${mode}">
            <div style="font-weight:900">${modeLabel(mode)}</div>
            <div class="muted small">${explain[mode]}</div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}
