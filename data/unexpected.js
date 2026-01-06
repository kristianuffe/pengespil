// data/unexpected.js
// 400 uforudsete events fordelt på:
// - general: 100 (25 neutral + 25 lav + 25 mellem + 25 høj)
// - bike:    100
// - public:  100
// - car:     100
//
// Sandsynligheder pr draw:
// - kilde: 60% general, 20% A transport, 20% B transport
// - tier: 10% neutral, 55% 50-350, 25% 350-800, 10% 800-1500
//
// Returnerer: { text, cost, source, tier, mode, person, id }

const MONTH_NAMES = [
  "Januar","Februar","Marts","April","Maj","Juni",
  "Juli","August","September","Oktober","November","December"
];

// --- weights / tiers ---
export const SOURCE_WEIGHTS = [
  { key: "general", w: 0.60 },
  { key: "A", w: 0.20 },
  { key: "B", w: 0.20 }
];

export const TIER_WEIGHTS = [
  { key: "neutral", w: 0.10, min: 0, max: 0 },
  { key: "low",     w: 0.55, min: 50, max: 350 },
  { key: "mid",     w: 0.25, min: 350, max: 800 },
  { key: "high",    w: 0.10, min: 800, max: 1500 }
];

// --- helper: weighted pick ---
function pickWeighted(list, rng){
  const r = rng();
  let acc = 0;
  for (const it of list){
    acc += it.w;
    if (r <= acc) return it;
  }
  return list[list.length - 1];
}

// --- helper: amount spread in interval (stable but varied) ---
function spreadAmount(min, max, idx, n){
  if (min === max) return min;
  // Spred pænt ud i intervallet, og rund til nærmeste 10 kr
  const t = n <= 1 ? 0.5 : idx / (n - 1);
  const raw = min + (max - min) * t;
  return Math.round(raw / 10) * 10;
}

// --- build pools (25 pr tier pr mode) ---
function buildTierPool({ prefix, tierKey, min, max, templates }){
  const out = [];
  const n = 25;
  for (let i = 0; i < n; i++){
    const tpl = templates[i % templates.length];
    const cost = tierKey === "neutral" ? 0 : spreadAmount(min, max, i, n);
    out.push({
      id: `${prefix}_${tierKey}_${String(i+1).padStart(2,"0")}`,
      textTpl: tpl,
      tier: tierKey,
      min,
      max,
      baseCost: cost
    });
  }
  return out;
}

function formatText(textTpl, ctx){
  // simple placeholder replacements
  return textTpl
    .replaceAll("{AMOUNT}", ctx.amount.toLocaleString("da-DK"))
    .replaceAll("{MONTH}", ctx.month)
    .replaceAll("{PERSON}", ctx.person || "");
}

// --- Templates (kan udvides/ændres senere uden at røre logikken) ---
// 25-ish templates pr gruppe. Vi bruger en liste og roterer.
const GENERAL_NEUTRAL = [
  "I får en ven forbi til kaffe – hyggeligt, men ingen ekstra udgifter.",
  "En nabo tilbyder jer en pose æbler fra haven – gratis bonus til madpakken.",
  "I finder en 100’er i en gammel jakke… men den ryger i opsparing (0 kr i budget).",
  "En aftale bliver aflyst, så I får en rolig aften hjemme (0 kr).",
  "Børnene leger hos venner – I får lidt luft (0 kr).",
  "Der er gratis entré til et lokalt arrangement i {MONTH} (0 kr).",
  "I får en gratis prøvepose fra supermarkedet (0 kr).",
  "I får en mail om prisstigning… men den gælder først næste år (0 kr).",
  "I får en lille rabat i en butik – men det påvirker ikke budgettet her (0 kr).",
  "En familieaften med brætspil – ingen ekstra udgift (0 kr).",
  "I låner en bog på biblioteket i stedet for at købe (0 kr).",
  "En ven giver jer et brugt spil til børnene (0 kr).",
  "I går en tur i stedet for en aktivitet (0 kr).",
  "I får gratis levering på en ordre (0 kr).",
  "I finder en opskrift og laver mad af rester (0 kr).",
  "En ven tager kage med – I skal ikke købe dessert (0 kr).",
  "Gratis tandpastaprøve hos tandlægen (0 kr).",
  "I får en lille gave på arbejdet (0 kr).",
  "I får en påmindelse om at tjekke abonnementer – men ingen ændring endnu (0 kr).",
  "I får gratis parkering den dag (0 kr).",
  "I får en gratis kop kaffe et sted (0 kr).",
  "I får en gratis cykelpumpe ved et værksted (0 kr).",
  "Børnene får en gratis aktivitet i klubben (0 kr).",
  "I får en gratis streaming-weekend (0 kr).",
  "En rolig måned uden ekstra udgifter (0 kr)."
];

const GENERAL_LOW = [
  "Småindkøb til hjemmet (pærer/batterier/rengøring): {AMOUNT} kr.",
  "Et barn mister en hue/handsker – nyt sæt: {AMOUNT} kr.",
  "I køber lidt ekstra til madpakken i {MONTH}: {AMOUNT} kr.",
  "Lille apotekstur (plastre/panodil): {AMOUNT} kr.",
  "En mindre gave til fødselsdag: {AMOUNT} kr.",
  "Et par nye sokker/undertøj: {AMOUNT} kr.",
  "En ekstra tur i vaskekælderen/vaskeri: {AMOUNT} kr.",
  "Småreparation i hjemmet (skruer/lim): {AMOUNT} kr.",
  "Børnene vil til en lille aktivitet: {AMOUNT} kr.",
  "Uventet gebyr/administration: {AMOUNT} kr."
];

const GENERAL_MID = [
  "I får en ekstra elregning højere end forventet: {AMOUNT} kr.",
  "Tandlæge-kontrol + lille behandling: {AMOUNT} kr.",
  "Skoleudflugt/klassekasse/arrangement: {AMOUNT} kr.",
  "Ny vinterjakke til et barn: {AMOUNT} kr.",
  "Håndværker-småting / akut besøg: {AMOUNT} kr.",
  "Et husholdningsapparat driller (fx støvsuger): {AMOUNT} kr.",
  "Abonnement bliver dyrere, og I opdager det sent: {AMOUNT} kr.",
  "I skal købe nyt sengetøj/dyne til et barn: {AMOUNT} kr."
];

const GENERAL_HIGH = [
  "El/vand/varme-regulering (stor efterbetaling): {AMOUNT} kr.",
  "Køleskab/opvaskemaskine går i stykker (reparation): {AMOUNT} kr.",
  "Akut tandlæge (rodbehandling/krone delbetaling): {AMOUNT} kr.",
  "Briller/linser uventet udgift: {AMOUNT} kr.",
  "En større regning fra kommunen/instans (forenklet): {AMOUNT} kr.",
  "Uventet flytte-/depot-/indskudspost (forenklet): {AMOUNT} kr."
];

// Transport-specifik
const BIKE_LOW = [
  "Punktering – nyt dæk/slange: {AMOUNT} kr.",
  "Kæde ruster – ny kæde: {AMOUNT} kr.",
  "Lygter/reflekser skal skiftes: {AMOUNT} kr.",
  "Bremser justeres/klodser: {AMOUNT} kr.",
  "Regnslag/poncho til cykelturen: {AMOUNT} kr."
];
const BIKE_MID = [
  "Cykelservice hos mekaniker: {AMOUNT} kr.",
  "Nyt lås + beslag: {AMOUNT} kr.",
  "Cykelhjelm til et barn: {AMOUNT} kr.",
  "Dæk + montage (begge hjul): {AMOUNT} kr."
];
const BIKE_HIGH = [
  "Cykel bliver stjålet – selvrisiko/nyt brugt cykel: {AMOUNT} kr.",
  "Elcykel-batteri/rep (forenklet): {AMOUNT} kr.",
  "Større reparation (hjul/nav/gear): {AMOUNT} kr."
];

const PUBLIC_LOW = [
  "Ekstra rejse pga. møde i {MONTH}: {AMOUNT} kr.",
  "I glemmer at tjekke ud – lille kontrolafgift (forenklet): {AMOUNT} kr.",
  "I køber en ekstra billet til en ven: {AMOUNT} kr.",
  "Pendlerkort skal genoprettes (gebyr): {AMOUNT} kr."
];
const PUBLIC_MID = [
  "Pendlerkort opgraderes pga. nye zoner: {AMOUNT} kr.",
  "Togbus/alternativ transport: {AMOUNT} kr.",
  "Kontrolafgift (forenklet): {AMOUNT} kr."
];
const PUBLIC_HIGH = [
  "Nyt pendlerkort pga. mistet kort/erstatning: {AMOUNT} kr.",
  "Flere zoner i en periode – dyrere måned: {AMOUNT} kr.",
  "Stor kontrolafgift (forenklet): {AMOUNT} kr."
];

const CAR_LOW = [
  "Parkeringsudgift/afgift (forenklet): {AMOUNT} kr.",
  "Sprinklervæske/olie/lille bilting: {AMOUNT} kr.",
  "Vask af bil + småting: {AMOUNT} kr.",
  "Bro/vejafgift en dag: {AMOUNT} kr."
];
const CAR_MID = [
  "Nye dæk (forenklet delbetaling): {AMOUNT} kr.",
  "Service/olieskift (forenklet): {AMOUNT} kr.",
  "Stenslag i rude (selvrisiko): {AMOUNT} kr.",
  "Bremser/klodser (forenklet): {AMOUNT} kr."
];
const CAR_HIGH = [
  "Større reparation på bil: {AMOUNT} kr.",
  "Syn/reparationer op til syn (forenklet): {AMOUNT} kr.",
  "Uheld – selvrisiko (forenklet): {AMOUNT} kr."
];

// Til neutral transport-specifik laver vi “historie-kort” uden pris
const BIKE_NEUTRAL = [
  "Det regner i {MONTH} – I bliver våde på cyklen, men ingen ekstra udgift (0 kr).",
  "Medvind! Cykelturen føles let i {MONTH} (0 kr).",
  "I møder en ven på cykelstien – god start på dagen (0 kr).",
  "Cyklen knirker… men holder endnu (0 kr).",
  "I tager en omvej for at undgå trafikken (0 kr)."
];
const PUBLIC_NEUTRAL = [
  "Toget er forsinket – chefen er lidt træt af det, men I lover at planlægge bedre (0 kr).",
  "I får en siddeplads i toget – luksus (0 kr).",
  "Der er sporarbejde, men I når det (0 kr).",
  "Bussen kommer til tiden i {MONTH} – sjældent! (0 kr).",
  "I møder en kollega i toget (0 kr)."
];
const CAR_NEUTRAL = [
  "Kø på motorvejen – I kommer lidt sent men ingen ekstra udgift (0 kr).",
  "I finder en god parkeringsplads med det samme (0 kr).",
  "I kører med en kollega og får en hyggelig snak (0 kr).",
  "Bilen starter heldigvis første gang (0 kr).",
  "I får en gratis p-plads den dag (0 kr)."
];

// --- Build UNEXPECTED pools ---
function buildModePools(modeKey){
  // neutral templates: lav 25 ved at rotere (vi bruger 5 og gentager)
  const neutralTemplates =
    modeKey === "bike" ? BIKE_NEUTRAL :
    modeKey === "public" ? PUBLIC_NEUTRAL :
    modeKey === "car" ? CAR_NEUTRAL :
    GENERAL_NEUTRAL;

  const lowTemplates =
    modeKey === "bike" ? BIKE_LOW :
    modeKey === "public" ? PUBLIC_LOW :
    modeKey === "car" ? CAR_LOW :
    GENERAL_LOW;

  const midTemplates =
    modeKey === "bike" ? BIKE_MID :
    modeKey === "public" ? PUBLIC_MID :
    modeKey === "car" ? CAR_MID :
    GENERAL_MID;

  const highTemplates =
    modeKey === "bike" ? BIKE_HIGH :
    modeKey === "public" ? PUBLIC_HIGH :
    modeKey === "car" ? CAR_HIGH :
    GENERAL_HIGH;

  const neutralTier = TIER_WEIGHTS.find(t=>t.key==="neutral");
  const lowTier = TIER_WEIGHTS.find(t=>t.key==="low");
  const midTier = TIER_WEIGHTS.find(t=>t.key==="mid");
  const highTier = TIER_WEIGHTS.find(t=>t.key==="high");

  return {
    neutral: buildTierPool({ prefix: modeKey, tierKey: "neutral", min: neutralTier.min, max: neutralTier.max, templates: neutralTemplates }),
    low:     buildTierPool({ prefix: modeKey, tierKey: "low",     min: lowTier.min,     max: lowTier.max,     templates: lowTemplates }),
    mid:     buildTierPool({ prefix: modeKey, tierKey: "mid",     min: midTier.min,     max: midTier.max,     templates: midTemplates }),
    high:    buildTierPool({ prefix: modeKey, tierKey: "high",    min: highTier.min,    max: highTier.max,    templates: highTemplates })
  };
}

export const UNEXPECTED = {
  general: buildModePools("general"),
  bike: buildModePools("bike"),
  public: buildModePools("public"),
  car: buildModePools("car")
};

// --- Determine which pool to draw from ---
function resolveModeFromSource(state, sourceKey){
  if (sourceKey === "general") return { mode: "general", person: null };

  const transport = state?.transport || {};
  const mode = sourceKey === "A" ? transport.modeA : transport.modeB;

  // fallback hvis ikke valgt endnu
  if (!mode) return { mode: "general", person: null };

  // mode er "bike"|"public"|"car"
  return { mode, person: sourceKey };
}

// --- Public API: draw one unexpected card ---
export function drawUnexpected(state, opts = {}){
  const rng = opts.rng || Math.random;
  const monthIndex = Number.isFinite(opts.monthIndex) ? opts.monthIndex : (state?.unexpected?.monthIndex ?? 0);
  const monthName = MONTH_NAMES[monthIndex] || "";

  // 1) source: general vs person A vs person B
  const sourcePick = pickWeighted(SOURCE_WEIGHTS, rng);
  const { mode, person } = resolveModeFromSource(state, sourcePick.key);

  // 2) tier: neutral/low/mid/high
  const tierPick = pickWeighted(TIER_WEIGHTS, rng);

  // 3) pick card from relevant pool
  const pool = UNEXPECTED[mode] || UNEXPECTED.general;
  const tierArr = pool[tierPick.key] || pool.low;

  const cardBase = tierArr[Math.floor(rng() * tierArr.length)];

  // 4) cost: for neutral 0, else use baseCost (already spread)
  const cost = cardBase.tier === "neutral" ? 0 : cardBase.baseCost;

  // 5) text
  const text = formatText(cardBase.textTpl, {
    amount: cost,
    month: monthName,
    person: person ? `Person ${person}` : ""
  });

  return {
    id: cardBase.id,
    text,
    cost,
    source: sourcePick.key,   // "general"|"A"|"B"
    tier: tierPick.key,       // "neutral"|"low"|"mid"|"high"
    mode: mode === "general" ? null : mode, // "bike"|"public"|"car"|null
    person                    // "A"|"B"|null
  };
}

// Helper: draw and push into your state structure: state.unexpected.months[monthIndex].draws[]
export function drawUnexpectedForMonth(state, monthIndex, opts = {}){
  const card = drawUnexpected(state, { ...opts, monthIndex });

  if (!state.unexpected) state.unexpected = { monthIndex: 0, months: [] };
  if (!Array.isArray(state.unexpected.months) || state.unexpected.months.length !== 12){
    state.unexpected.months = Array.from({ length: 12 }, () => ({ draws: [], locked: false }));
  }

  const m = state.unexpected.months[monthIndex];
  if (!m.draws) m.draws = [];
  m.draws.push({ text: card.text, cost: card.cost, id: card.id, tier: card.tier, mode: card.mode, source: card.source, person: card.person });

  return card;
}
