export function makeSessionId(){
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i=0;i<6;i++) s += alphabet[Math.floor(Math.random()*alphabet.length)];
  return s;
}
export function saveSession(sessionId, state){
  localStorage.setItem(`eco:v4:${sessionId}`, JSON.stringify(state));
}
export function loadSession(sessionId){
  const raw = localStorage.getItem(`eco:v4:${sessionId}`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
export function deleteSession(sessionId){
  localStorage.removeItem(`eco:v4:${sessionId}`);
}
