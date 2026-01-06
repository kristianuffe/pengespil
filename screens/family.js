import { showModal } from "../core/ui.js";
import { familyModalHtml } from "../components/familyModal.js";
import { FAMILY_QUESTIONS, OPTION_SCORES } from "../data/familyQuestions.js";
import { FAMILIES } from "../data/families.js";

function computeFrugality(answers){
  const vals = Object.values(answers || {}).map(k => OPTION_SCORES[k] ?? 0.5);
  if (!vals.length) return 0.5;
  return vals.reduce((a,b)=>a+b,0) / vals.length;
}

function mapToFamily(frugality){
  let best = FAMILIES[0], bestDiff = Infinity;
  for (const f of FAMILIES){
    const d = Math.abs((f.frugality ?? 0.5) - frugality);
    if (d < bestDiff){ best = f; bestDiff = d; }
  }
  return best;
}

export function familyScreen({ els, state, save, router }){
  if (!state.familyProfile){
    state.familyProfile = { stepIndex: 0, answers: {} };
    save();
  }

  const i = state.familyProfile.stepIndex || 0;
  const done = i >= FAMILY_QUESTIONS.length;
  const q = done ? null : FAMILY_QUESTIONS[i];

  if (done){
    const fr = computeFrugality(state.familyProfile.answers);
    const fam = mapToFamily(fr);
    state.familyKey = fam.key;
    state.family = fam;
    save();
  }

  const selectedKey = done ? state.familyKey : null;

  els.screen.innerHTML = `
    <div class="card">
      <h1>1) Byg jeres familieprofil</h1>
      <p class="muted">I skal vælge 6 ting som definerer jer som familie (3 niveauer hver).</p>

      <div class="row" style="justify-content:space-between; align-items:center">
        <div class="muted small">
          ${done
            ? `Resultat: <strong>${FAMILIES.find(f=>f.key===selectedKey)?.title || "—"}</strong>`
            : `Spørgsmål: <strong>${i+1}/${FAMILY_QUESTIONS.length}</strong>`}
        </div>
        <button class="btn" id="seeFamily">Se familien</button>
      </div>

      <div class="hr"></div>

      ${done ? `
        <div class="row">
          <div class="col col--primary">
            <h2>Jeres profil</h2>
            <p class="muted">Profilen er lavet ud fra jeres 6 valg. Næste skridt er at trække jobs og børn.</p>
            <div class="kv">
              <div class="k">Familietype</div>
              <div class="v">${FAMILIES.find(f=>f.key===selectedKey)?.title || "—"}</div>
            </div>
          </div>

          <div class="col col--secondary">
            <h2>Jeres valg</h2>
            <ul class="muted">
              ${FAMILY_QUESTIONS.map(qq=>{
                const a = state.familyProfile.answers[qq.id];
                return `<li><strong>${qq.title}:</strong> ${a ? a : "—"}</li>`;
              }).join("")}
            </ul>
          </div>
        </div>

        <div class="hr"></div>

        <div class="row" style="justify-content:space-between">
          <button class="btn" id="restartProfile">Lav profilen om</button>
          <button class="btn btn--primary" id="nextBtn">Næste →</button>
        </div>
      ` : `
        <div class="col">
          <h2>${q.title}</h2>
          <p class="muted">${q.prompt}</p>

          <div class="choiceGrid">
            ${q.options.map(o=>{
              const picked = state.familyProfile.answers[q.id] === o.key;
              return `
                <div class="choice ${picked?"choice--selected":""}" data-opt="${o.key}">
                  <div style="font-weight:900">${o.label}</div>
                  <div class="muted small">${o.text}</div>
                  <div class="badge">${o.tag}</div>
                </div>
              `;
            }).join("")}
          </div>

          <div class="hr"></div>

          <h2>Overblik over valg</h2>
          <p class="muted small">I kan altid gå tilbage og ændre et svar.</p>
          <ul class="muted">
            ${FAMILY_QUESTIONS.map((qq,idx)=>{
              const a = state.familyProfile.answers[qq.id];
              const here = idx === i ? " • (nu)" : "";
              return `<li>${idx+1}. ${qq.title}: <strong>${a || "—"}</strong>${here}</li>`;
            }).join("")}
          </ul>

          <div class="hr"></div>

          <div class="row" style="justify-content:space-between">
            <button class="btn" id="backBtn" ${i===0?"disabled":""}>← Tilbage</button>
            <button class="btn btn--primary" id="forwardBtn" ${(state.familyProfile.answers[q.id])? "":"disabled"}>Næste →</button>
          </div>
        </div>
      `}
    </div>
  `;

  els.screen.querySelector("#seeFamily").addEventListener("click", ()=>{
    showModal(
      familyModalHtml(state) +
      `<div class="hr"></div><button class="btn btn--primary" data-close="1">Tilbage til spillet</button>`
    );
  });

  if (!done){
    els.screen.querySelectorAll("[data-opt]").forEach(el=>{
      el.addEventListener("click", ()=>{
        const k = el.getAttribute("data-opt");
        state.familyProfile.answers[q.id] = k;
        save();
        router.go("family");
      });
    });

    els.screen.querySelector("#backBtn").addEventListener("click", ()=>{
      state.familyProfile.stepIndex = Math.max(0, i-1);
      save(); router.go("family");
    });

    els.screen.querySelector("#forwardBtn").addEventListener("click", ()=>{
      state.familyProfile.stepIndex = Math.min(FAMILY_QUESTIONS.length, i+1);
      save(); router.go("family");
    });
  } else {
    els.screen.querySelector("#restartProfile").addEventListener("click", ()=>{
      state.familyProfile = { stepIndex: 0, answers: {} };
      state.familyKey = null;
      state.family = null;
      save(); router.go("family");
    });

    els.screen.querySelector("#nextBtn").addEventListener("click", ()=>router.go("jobs"));
  }
}
