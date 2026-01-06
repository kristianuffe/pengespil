import { JOBS } from "../data/jobs.js";
import { calcPayslip, formatKr } from "../data/payroll.js";

// 35% 1 barn, 55% 2 børn, 20% 3 børn
function pickKids(rng = Math.random){
  const r = rng();
  if (r < 0.35) return 1;
  if (r < 0.90) return 2;
  return 3;
}

function pickJob(rng = Math.random){
  return JOBS[Math.floor(rng() * JOBS.length)];
}

// Langsom “parallel” simulering af 2 jobs (A og B)
function animateTwoDraw({ elA, elB }, ms = 2800, tickMs = 140){
  return new Promise((resolve)=>{
    let timer = null;
    const start = Date.now();

    const tick = ()=>{
      const a = pickJob();
      const b = pickJob();
      elA.textContent = `Person A: ${a.title} (${a.gross.toLocaleString("da-DK")} kr.)`;
      elB.textContent = `Person B: ${b.title} (${b.gross.toLocaleString("da-DK")} kr.)`;

      if (Date.now() - start >= ms){
        clearInterval(timer);
        resolve();
      }
    };

    tick();
    timer = setInterval(tick, tickMs);
  });
}

export function jobsScreen({ els, state, save, router }){
  if (!state.jobs){
    state.jobs = { drawn:false, adultA:null, adultB:null, kids:null };
    save();
  }

  const drawn = state.jobs.drawn;

  els.screen.innerHTML = `
    <div class="card">
      <h1>2) Jobs og børn</h1>
      <p class="muted">Jobs trækkes tilfældigt – og I får en forenklet lønseddel med brutto, skat og netto. Samtidig kan I se jeres faste udgifter på mad og diverse.</p>

      ${drawn ? `
        <div class="row equal-cols">
          <div class="col">
            <h2>Person A</h2>
            ${renderPayslip(state.jobs.adultA)}
          </div>
          <div class="col">
            <h2>Person B</h2>
            ${renderPayslip(state.jobs.adultB)}
          </div>
        </div>

        <div class="hr"></div>

        <div class="row">
          <div class="col">
            <h2>Børn</h2>
            <p class="muted">I har <strong>${state.jobs.kids}</strong> børn.</p>
          </div>
        </div>

        <div class="hr"></div>

        <div class="row" style="justify-content:flex-end">
          <button class="btn btn--primary" id="nextBtn">Jeg har tastet indtægter i Excel → Videre</button>
        </div>
      ` : `
        <div class="row equal-cols">
          <div class="col">
            <h2>Træk nu</h2>
            <p class="muted">Tryk på knappen og bliv klogere på hvilken familie i er.</p>

            <div class="hr"></div>

            <div class="payslip">
              <div class="payslip__title">🎲 Trækning (simulering)</div>
              <div class="muted" id="drawLineA">Person A: Klar…</div>
              <div class="muted" id="drawLineB" style="margin-top:6px">Person B: Klar…</div>
            </div>

            <div class="hr"></div>

            <button class="btn btn--primary" id="drawBtn">🎲 Træk jobs og børn</button>
          </div>

          <div class="col">
            <h2>Husk</h2>
            <ul class="muted">
              <li>Brutto = løn før skat</li>
              <li>AM-bidrag + skat trækkes</li>
              <li>Netto = udbetaling</li>
            </ul>
          </div>
        </div>
      `}
    </div>
  `;

  if (!drawn){
    els.screen.querySelector("#drawBtn").addEventListener("click", async ()=>{
      const elA = els.screen.querySelector("#drawLineA");
      const elB = els.screen.querySelector("#drawLineB");

      // langsommere, parallel simulering
      await animateTwoDraw({ elA, elB }, 3000, 160);

      // “endeligt” træk
      const adultA = pickJob();
      const adultB = pickJob();
      const kids = pickKids();

      state.jobs.adultA = adultA;
      state.jobs.adultB = adultB;
      state.jobs.kids = kids;
      state.jobs.drawn = true;

      // Overblik bruger brutto som “indtægt” (eleverne laver netto i Excel via lønsedlen)
      state.income = { grossA: adultA.gross, grossB: adultB.gross };

      save();
      router.go("jobs");
    });
    return;
  }

  els.screen.querySelector("#nextBtn").addEventListener("click", ()=>{
    router.go("distance");
  });
}

function renderPayslip(job){
  const { gross, am, tax, atp, net } = calcPayslip(job.gross);

  return `
    <div class="payslip">
      <div class="payslip__title">${job.title}</div>
      <div class="payslip__grid">
        <div class="k">Bruttoløn</div><div class="v">${formatKr(gross)}</div>
        <div class="k">AM-bidrag (8%)</div><div class="v">-${formatKr(am)}</div>
        <div class="k">A-skat</div><div class="v">-${formatKr(tax)}</div>
        <div class="k">ATP</div><div class="v">-${formatKr(atp)}</div>
        <div class="k payslip__net">Netto (udbetaling)</div><div class="v payslip__net">${formatKr(net)}</div>
      </div>
    </div>
  `;
}
