export function setProgress(pct){
  const bar = document.getElementById("progressBar");
  const label = document.getElementById("progressLabel");
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  bar.style.width = clamped + "%";
  label.textContent = clamped + "%";
}
export function showModal(html){
  const modal = document.getElementById("modal");
  document.getElementById("modalContent").innerHTML = html;
  modal.hidden = false;
}
export function hideModal(){
  const modal = document.getElementById("modal");
  modal.hidden = true;
  document.getElementById("modalContent").innerHTML = "";
}
export function money(n){
  const v = Math.round(Number(n||0));
  return v.toLocaleString("da-DK") + " kr.";
}
