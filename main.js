import { createRouter } from "./core/router.js";
import { defaultState, STEPS } from "./core/state.js";
import { saveSession } from "./core/storage.js";
import { setProgress, hideModal, showModal } from "./core/ui.js";

import { renderEconomySidebar } from "./components/economySidebar.js";
import { renderMonthsSidebar } from "./components/monthsSidebar.js";
import { familyModalHtml } from "./components/familyModal.js";

import { introScreen } from "./screens/intro.js";
import { familyScreen } from "./screens/family.js";
import { jobsScreen } from "./screens/jobs.js";
import { distanceScreen } from "./screens/distance.js";
import { housingScreen } from "./screens/housing.js";
import { unexpectedScreen } from "./screens/unexpected.js";
import { summaryScreen } from "./screens/summary.js";
import { adjustScreen } from "./screens/adjust.js";

const els = {
  screen: document.getElementById("screen"),
  economySidebar: document.getElementById("economySidebar"),
  monthsSidebar: document.getElementById("monthsSidebar"),
  sessionBadge: document.getElementById("sessionBadge"),
  seeFamilyTopBtn: document.getElementById("seeFamilyTopBtn")
};

let state = defaultState("");

function renderTopbar(){
  if (!els.seeFamilyTopBtn) return;

  const hasFamily = !!state.family;
  els.seeFamilyTopBtn.style.display = hasFamily ? "inline-block" : "none";

  if (hasFamily){
    els.seeFamilyTopBtn.onclick = () => {
      showModal(
        familyModalHtml(state) +
        `<div class="hr"></div><button class="btn btn--primary" data-close="1">Tilbage til spillet</button>`
      );
    };
  } else {
    els.seeFamilyTopBtn.onclick = null;
  }
}

function renderSidebars(){
  renderEconomySidebar(els.economySidebar, state);

  // Venstre sidebar: vis i uforudsete + resume + juster
  const showMonths = ["unexpected", "summary", "adjust"].includes(state.step);

  // ✅ bred venstre sidebar både i uforudsete og resume/adjust (så den ikke bliver smal igen)
  const wideMonths = ["unexpected", "summary", "adjust"].includes(state.step);
  document.body.classList.toggle("months-wide", wideMonths);

  if (showMonths){
    els.monthsSidebar.classList.remove("is-placeholder");
    renderMonthsSidebar(els.monthsSidebar, state);
  } else {
    els.monthsSidebar.classList.add("is-placeholder");
    els.monthsSidebar.innerHTML = "";
  }
}

function save(){
  if (state.sessionId){
    saveSession(state.sessionId, state);
    els.sessionBadge.textContent = `ID: ${state.sessionId}`;
  } else {
    els.sessionBadge.textContent = "";
  }
  renderTopbar();
  renderSidebars();
}

function renderProgress(){
  const idx = STEPS.indexOf(state.step);
  const pct = idx <= 0 ? 0 : Math.round((idx) / (STEPS.length - 1) * 100);
  setProgress(pct);
}

function renderScreen(){
  renderProgress();
  renderTopbar();
  renderSidebars();

  const ctx = { els, state, save, router, renderSidebars };

  switch (state.step) {
    case "intro": introScreen(ctx); break;
    case "family": familyScreen(ctx); break;
    case "jobs": jobsScreen(ctx); break;
    case "distance": distanceScreen(ctx); break;
    case "housing": housingScreen(ctx); break;
    case "unexpected": unexpectedScreen(ctx); break;
    case "summary": summaryScreen(ctx); break;
    case "adjust": adjustScreen(ctx); break;
    default:
      state.step = "intro";
      introScreen(ctx);
  }
}

const router = createRouter({
  setStep(step){
    state.step = step;
    save();
  },
  renderScreen
});

document.getElementById("modal").addEventListener("click", (e)=>{
  const t = e.target;
  if (t && t.getAttribute && t.getAttribute("data-close")) hideModal();
});

renderScreen();
