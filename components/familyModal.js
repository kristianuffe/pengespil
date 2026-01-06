import { FAMILIES } from "../data/families.js";
export function familyModalHtml(state){
  const fam = FAMILIES.find(f=>f.key===state.familyKey);
  const jobs = state.jobs;
  if (!fam) return `<h2>Familie</h2><p class="muted">Ingen familie valgt endnu.</p>`;
  return `
    <h2>${fam.title}</h2>
    <p class="muted">${fam.desc}</p>
    <div class="hr"></div>
    ${jobs ? `
      <div class="kv">
        <div class="k">Voksne</div><div class="v">${jobs.adults.map(a=>`${a.name} – ${a.jobTitle}`).join("<br>")}</div>
        <div class="k">Børn</div><div class="v">${jobs.kids}</div>
      </div>` : `<p class="muted">Jobs er ikke trukket endnu.</p>`}
  `;
}
