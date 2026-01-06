const MONTH_NAMES = [
  "Januar","Februar","Marts","April","Maj","Juni",
  "Juli","August","September","Oktober","November","December"
];

function kr(n){
  const v = Math.round(Number(n || 0));
  return `${v.toLocaleString("da-DK")} kr`;
}

export function renderMonthsSidebar(el, state){
  const u = state?.unexpected || {};
  const months = Array.isArray(u.months) ? u.months : [];
  const activeIdx = Number.isFinite(u.monthIndex) ? u.monthIndex : -1;

  const leftIdx = [0,1,2,3,4,5];
  const rightIdx = [6,7,8,9,10,11];

  el.innerHTML = `
    <h3 class="sidebar__title">Måneder</h3>
    <div class="monthsGrid">
      <div class="monthsCol">
        ${leftIdx.map(i => renderMonth(i, months[i], activeIdx)).join("")}
      </div>
      <div class="monthsCol">
        ${rightIdx.map(i => renderMonth(i, months[i], activeIdx)).join("")}
      </div>
    </div>
  `;
}

function renderMonth(i, m, activeIdx){
  const name = MONTH_NAMES[i];
  const draws = Array.isArray(m?.draws) ? m.draws : [];
  const sum = draws.reduce((s,d)=> s + Number(d?.cost || 0), 0);
  const active = i === activeIdx;

  return `
    <div class="month ${active ? "month--active":""}">
      <div class="month__name">
        <span>${name}</span>
        <span class="muted small">${kr(sum)}</span>
      </div>

      ${draws.length ? `
        <ul class="month__items">
          ${draws.map(d=>`<li>${d.text || d.title || "Post"} (${kr(d.cost)})</li>`).join("")}
        </ul>
      ` : `<div class="muted small" style="margin-top:6px">—</div>`}
    </div>
  `;
}
