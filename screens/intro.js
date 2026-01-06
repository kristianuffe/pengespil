import { makeSessionId, loadSession, saveSession } from "../core/storage.js";
import { defaultState } from "../core/state.js";
export function introScreen({ els, state, router }){
  els.screen.innerHTML = `
    <div class="card">
      <h1>Velkommen</h1>
      <p class="muted">I skal lave et årsbudget i Excel, mens spillet giver jer indtægter, faste udgifter, valg og uforudsete udgifter.</p>
      <div class="hr"></div>
      <div class="row">
        <div class="col">
          <h2>Start ny familie</h2>
          <p class="muted">Spillet laver en familie og et forløb, som I bygger budget ud fra.</p>
          <button class="btn btn--primary" id="newBtn">Start →</button>
        </div>
        <div class="col">
          <h2>Fortsæt</h2>
          <p class="muted">Indtast jeres ID, hvis I har været i gang før.</p>
          <div class="row" style="align-items:center">
            <input id="idInput" class="btn" style="flex:1; cursor:text" placeholder="Fx A3F9KQ" />
            <button class="btn" id="loadBtn">Fortsæt</button>
          </div>
          <div class="muted small" id="loadMsg"></div>
        </div>
      </div>
      <div class="hr"></div>
      <h2>Flow</h2>
      <ol class="muted">
        <li>Vælg familietype</li>
        <li>Træk jobs og børn (indtægt)</li>
        <li>Vælg transport-prioritet (afstande er faste)</li>
        <li>Vælg bolig</li>
        <li>Træk uforudsete udgifter for 12 måneder</li>
        <li>Se resume og prøv at justere valg</li>
      </ol>
    </div>`;
  els.screen.querySelector("#newBtn").addEventListener("click", ()=>{
    const sessionId = makeSessionId();
    const next = defaultState(sessionId);
    next.step = "family";
    saveSession(sessionId, next);
    // replace current state object in-place so sidebars & router use the new session
    Object.keys(state).forEach(k=>delete state[k]);
    Object.assign(state, next);
    router.go("family");
  });
  els.screen.querySelector("#loadBtn").addEventListener("click", ()=>{
    const id = (els.screen.querySelector("#idInput").value || "").trim().toUpperCase();
    const msg = els.screen.querySelector("#loadMsg");
    if (!id){ msg.textContent="Skriv et ID først."; return; }
    const loaded = loadSession(id);
    if (!loaded){ msg.textContent="Jeg kan ikke finde det ID."; return; }
    Object.keys(state).forEach(k=>delete state[k]);
    Object.assign(state, loaded);
    router.go(state.step || "family");
  });
}
