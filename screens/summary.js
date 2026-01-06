import { computeEconomy } from "../logic/economy.js";
import { money } from "../core/ui.js";
export function summaryScreen({ els, state, router }){
  const eco = computeEconomy(state);
  const annualNet = eco.netMonthly * 12;
  const text = annualNet >= 0
    ? `I har overskud og kan spare op. Jeres mål er at lægge <strong>3.500 kr.</strong> til side om måneden til en ferie om et år.`
    : `I har underskud. I skal nu finde ud af, hvordan I får råd til det hele ved at ændre jeres valg.`;
  els.screen.innerHTML = `
    <div class="card">
      <h1>6) Resume</h1>
      <p class="muted">${text}</p>
      <div class="hr"></div>
      <div class="row">
        <div class="col">
          <h2>Resultat</h2>
          <div class="kv">
            <div class="k">Rådighed / md.</div><div class="v ${eco.netMonthly<0?"red":"green"}">${money(eco.netMonthly)}</div>
            <div class="k">Rådighed / år</div><div class="v ${annualNet<0?"red":"green"}">${money(annualNet)}</div>
            <div class="k">Mål</div><div class="v">3.500 kr./md.</div>
          </div>
        </div>
        <div class="col">
          <h2>Næste</h2>
          <p class="muted">Nu kan I gå til justering og ændre familietype, transport og bolig — og se overblikket ændre sig live.</p>
          <button class="btn btn--primary" id="adjustBtn">Gå til justering →</button>
        </div>
      </div>
    </div>`;
  els.screen.querySelector("#adjustBtn").addEventListener("click", ()=>router.go("adjust"));
}
