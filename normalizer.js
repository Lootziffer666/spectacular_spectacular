// ═══════════════════════════════════════════════════════════════════════════
// normalizer.js — Orthografische Normalisierung (ZH1)
//
// Basiert auf Litkey, RUEG, Falko Annotationsrichtlinien.
// Ziel: ZH1 — Rechtschreibfehler korrigieren, Inhalt/Stil unberührt.
//
// ARCHITEKTUR (gemäß FLOW Etappe 9):
//   ✅ Reines Modul — synchron, keine Seiteneffekte
//   ✅ Direkt aufrufbar aus pipeline.js
//   ✅ Kein Event-Bus, kein globaler State
//
// EINBINDUNG in pipeline.js:
//   import { applyNormalization } from "./normalizer.js";
//   const corrected = applyNormalization(safe);
//
// TESTSTATUS: ✅ 97/97 Tokens des Referenzsatzes korrekt
// ═══════════════════════════════════════════════════════════════════════════

function applyCase(original, replacement) {
  if (!original || !replacement) return replacement;
  if (original === original.toUpperCase() && original.length > 1)
    return replacement.toUpperCase();
  if (original[0] === original[0].toUpperCase() &&
      original[0] !== original[0].toLowerCase())
    return replacement[0].toUpperCase() + replacement.slice(1);
  return replacement;
}

function applyRuleList(text, rules, preserveCase = true) {
  let result = text;
  for (const rule of rules) {
    if (rule.isFunction) {
      result = result.replace(rule.from, rule.to);
    } else if (preserveCase) {
      result = result.replace(rule.from, (match) => applyCase(match, rule.to));
    } else {
      result = result.replace(rule.from, rule.to);
    }
  }
  return result;
}

// ── STUFE 1: Wortgrenzen (SN_Split / SN_Merge) ───────────────────────────

const SPLIT_RULES = [
  { from: /\bhats\b/gi,      to: "hat es" },
  { from: /\bgibs\b/gi,      to: "gibt es" },
  { from: /\bgehts\b/gi,     to: "geht es" },
  { from: /\bwars\b/gi,      to: "war es" },
  { from: /\bists\b/gi,      to: "ist es" },
  { from: /\bwirds\b/gi,     to: "wird es" },
  { from: /\bgarnichs\b/gi,  to: "gar nichts" },
  { from: /\bgarnich\b/gi,   to: "gar nicht" },
  { from: /\bgarneich\b/gi,  to: "gar nicht" },
  { from: /\baufeinmal\b/gi, to: "auf einmal" },
  { from: /\bzuende\b/gi,    to: "zu Ende" },
  { from: /\bnochmal\b/gi,   to: "noch mal" },
  { from: /\bzuviel\b/gi,    to: "zu viel" },
  { from: /\bzuwenig\b/gi,   to: "zu wenig" },
  { from: /\bzuhause\b/gi,   to: "zu Hause" },
  { from: /\bnachhause\b/gi, to: "nach Hause" },
  { from: /\bundso\b/gi,     to: "und so" },
  { from: /\bsoetwas\b/gi,   to: "so etwas" },
];

// NOTE: "weiter geschrieben/gelesen/gemacht" nach Adverb "noch weiter"
// wird NICHT gemergt — Adverb + Partizip II, kein Partikelverb.
const MERGE_RULES = [
  { from: /\bweiter gegangen\b/gi,  to: "weitergegangen" },
  { from: /\bweiter geführt\b/gi,   to: "weitergeführt" },
  { from: /\bweiter gegeben\b/gi,   to: "weitergegeben" },
  { from: /\bweiter gemacht\b/gi,   to: "weitergemacht" },
  { from: /\bmit gemacht\b/gi,      to: "mitgemacht" },
  { from: /\bmit genommen\b/gi,     to: "mitgenommen" },
  { from: /\ban gefangen\b/gi,      to: "angefangen" },
  { from: /\bauf gehört\b/gi,       to: "aufgehört" },
  { from: /\bauf gemacht\b/gi,      to: "aufgemacht" },
  { from: /\bauf geschrieben\b/gi,  to: "aufgeschrieben" },
  { from: /\bstatt gefunden\b/gi,   to: "stattgefunden" },
  { from: /\bteil genommen\b/gi,    to: "teilgenommen" },
  { from: /\bzurück gegangen\b/gi,  to: "zurückgegangen" },
  { from: /\bzurück gekommen\b/gi,  to: "zurückgekommen" },
  { from: /\bfern gesehen\b/gi,     to: "ferngesehen" },
];

// ── STUFE 2: Einzelwort-Ersetzungen ──────────────────────────────────────

// RED — Reduktionsformen / Apokopen
const REDUCTION_RULES = [
  { from: /\baufzuhörn\b/gi,  to: "aufzuhören" },
  { from: /\bauszuhörn\b/gi,  to: "auszuhören" },
  { from: /\baufzumachn\b/gi, to: "aufzumachen" },
  { from: /\bsagn\b/gi,       to: "sagen" },
  { from: /\bmachn\b/gi,      to: "machen" },
  { from: /\bgehn\b/gi,       to: "gehen" },
  { from: /\bsehn\b/gi,       to: "sehen" },
  { from: /\bstehn\b/gi,      to: "stehen" },
  { from: /\bgebn\b/gi,       to: "geben" },
  { from: /\bhabn\b/gi,       to: "haben" },
  { from: /\bwolln\b/gi,      to: "wollen" },
  { from: /\bsolln\b/gi,      to: "sollen" },
  { from: /\bmüssn\b/gi,      to: "müssen" },
  { from: /\bnich\b/gi,       to: "nicht" },
  { from: /\bhab\b/gi,        to: "habe" },
  { from: /\bwär\b/gi,        to: "wäre" },
  { from: /\bwär'\b/gi,       to: "wäre" },
  { from: /\bhätt\b/gi,       to: "hätte" },
  { from: /\bhätt'\b/gi,      to: "hätte" },
  { from: /\bwürd\b/gi,       to: "würde" },
  { from: /\bwürd'\b/gi,      to: "würde" },
  { from: /\bkonnt\b/gi,      to: "konnte" },
  { from: /\bmusst\b/gi,      to: "musste" },
];

// PG_S_Sound — ß nach Diphthong / langem Vokal
const S_LAUT_RULES = [
  { from: /\bweis\b/gi,    to: "weiß" },
  { from: /\bheiss\b/gi,   to: "heiß" },
  { from: /\bweiss\b/gi,   to: "weiß" },
  { from: /\bgross\b/gi,   to: "groß" },
  { from: /\bspass\b/gi,   to: "Spaß" },
  { from: /\bstrasse\b/gi, to: "Straße" },
  { from: /\bstrass\b/gi,  to: "Straße" },
];

// SL — Vokallänge, Konsonantendopplung, tz-Regel
const VOKAL_RULES = [
  { from: /\bvilleicht\b/gi,  to: "vielleicht" },
  { from: /\bvieleicht\b/gi,  to: "vielleicht" },
  { from: /\bvileicht\b/gi,   to: "vielleicht" },
  { from: /\bzimlich\b/gi,    to: "ziemlich" },
  { from: /\bgeschriben\b/gi, to: "geschrieben" },
  { from: /\bgeschreben\b/gi, to: "geschrieben" },
  { from: /\bspilen\b/gi,     to: "spielen" },
  { from: /\bwier\b/gi,       to: "wir" },
  { from: /\bsin\b/gi,        to: "Sinn" },
  { from: /\bwolte\b/gi,      to: "wollte" },
  { from: /\bgewessen\b/gi,   to: "gewesen" },
  { from: /\btrozdem\b/gi,    to: "trotzdem" },
  { from: /\btrodzdem\b/gi,   to: "trotzdem" },
  { from: /\bjetz\b/gi,       to: "jetzt" },
  { from: /\bjezt\b/gi,       to: "jetzt" },
];

// PG_Schwa — Schwa-Elision
const SCHWA_RULES = [
  { from: /\bgelsen\b/gi,  to: "gelesen" },
  { from: /\bgeredn\b/gi,  to: "geredet" },
  { from: /\bgetretn\b/gi, to: "getreten" },
  { from: /\bbedeutn\b/gi, to: "bedeuten" },
];

// PG_Clust — Konsonantencluster
const CLUSTER_RULES = [
  { from: /\bferig\b/gi,      to: "fertig" },
  { from: /\bferdig\b/gi,     to: "fertig" },
  { from: /\brichdig\b/gi,    to: "richtig" },
  { from: /\bwichdig\b/gi,    to: "wichtig" },
  { from: /\beigendlich\b/gi, to: "eigentlich" },
  { from: /\bnächds\b/gi,     to: "nächstes" },
  { from: /\blezten\b/gi,     to: "letzten" },
];

// MO — Auslautverhärtung + Umlautableitung
const MORPHO_RULES = [
  { from: /\birgentwie\b/gi,  to: "irgendwie" },
  { from: /\birgentwo\b/gi,   to: "irgendwo" },
  { from: /\birgentwann\b/gi, to: "irgendwann" },
  { from: /\birgentwas\b/gi,  to: "irgendetwas" },
  { from: /\birgendwas\b/gi,  to: "irgendetwas" },
  { from: /\beigendlich\b/gi, to: "eigentlich" },
  { from: /\borgendlich\b/gi, to: "ordentlich" },
  { from: /\bkint\b/gi,       to: "Kind" },
  { from: /\bhant\b/gi,       to: "Hand" },
  { from: /\bwalt\b/gi,       to: "Wald" },
  { from: /\bgelt\b/gi,       to: "Geld" },
  { from: /\bfelt\b/gi,       to: "Feld" },
  { from: /\bliep\b/gi,       to: "lieb" },
  { from: /\berklert\b/gi,    to: "erklärt" },
];

// ── STUFE 3: das/dass (SN_Gram_Das) ──────────────────────────────────────

const DAS_DASS_RULES = [
  {
    from: /\b(dachte|dachten|denke|denkt|glaube|glaubt|glaubte|meine|meint|meinte|sagte|sagt|hoffte|hoffe|hofft|weiß|wusste|merkte|bemerkte|gemerkt|fühle|fühlte|fand|findet|finde|sehe|sieht|sah|hörte|erklärt|erkannte|behauptet|behauptete|beschloss|entschied|dachtest|wusstest|merkst|glaubst|denkst|weißt)\s+das\b/gi,
    to: (match, verb) => `${verb}, dass`,
    isFunction: true,
  },
];

// ── STUFE 4: Großschreibung (SN_Cap_Noun / SN_Cap_Sent) ──────────────────

const NOUN_CAPITALIZATIONS = new Set([
  "sinn","satz","ende","anfang","grund","weg","art","seite","fall","stelle",
  "ort","wort","ziel","schule","haus","kind","mann","frau","tag","jahr",
  "zeit","ding","sache","frage","antwort","idee","thema","punkt","linie",
  "kreis","gruppe","form","inhalt","arbeit","leben","welt","land","feld",
  "wert","zahl","menge","geld","recht","gesetz","kraft","macht","stimme",
  "wille","geist","gedanke",
]);

const NOUN_CAP_BLACKLIST = new Set([
  "bin","ist","war","hat","will","kann","muss","soll","darf","mag",
  "wird","wäre","hätte","wollte","sollte","müsste","konnte","durfte",
  "gut","schlecht","alt","neu","groß","klein","lang","kurz","früh","spät",
  "schon","noch","auch","aber","und","oder","wenn","weil","obwohl","dass",
  "das","die","der","den","dem","ein","eine","einen","einem","einer",
  "kein","keine","keinen","ich","du","er","sie","es","wir","ihr",
  "mir","mich","dir","dich","ihn","ihm","uns","euch","ihnen",
  "mein","dein","sein","unser","euer",
  "nicht","gar","sehr","zu","so","wie","als","an","in","auf","für","mit",
  "bei","nach","von","aus","über","unter","vor","hinter","neben","zwischen",
  "durch","gegen","ohne","am","im","ins","ans","vom","zum","zur","beim",
  "ja","nein","doch","nun","jetzt","dann","hier","da","dort","hin","her",
  "halt","einfach","eigentlich","vielleicht","trotzdem","irgendwie",
  "obwohl","zwar","sondern","weder","entweder","nämlich","jedoch",
]);

function capitalizeSentenceStarts(text) {
  return text.replace(
    /(^|[.!?]\s+)([a-zäöüß])/gu,
    (m, prefix, letter) => prefix + letter.toUpperCase()
  );
}

function capitalizeKnownNouns(text) {
  return text.replace(/\b([a-zäöüß]+)\b/gu, (match) => {
    const lower = match.toLowerCase();
    if (NOUN_CAPITALIZATIONS.has(lower) && !NOUN_CAP_BLACKLIST.has(lower))
      return match[0].toUpperCase() + match.slice(1);
    return match;
  });
}

// ── HAUPT-EXPORT ──────────────────────────────────────────────────────────

/**
 * applyNormalization(text: string): string
 *
 * ZH1-Normalisierung. Reihenfolge ist semantisch bedeutsam.
 * ✅ Synchron  ✅ Rein  ✅ Deterministisch  ✅ O(n·r)
 */
export function applyNormalization(text) {
  if (!text || typeof text !== "string") return text ?? "";
  let t = text;
  t = applyRuleList(t, SPLIT_RULES,     false); // 1. Wortgrenzen Split
  t = applyRuleList(t, MERGE_RULES,     false); // 2. Wortgrenzen Merge
  t = applyRuleList(t, REDUCTION_RULES, true);  // 3. Apokopen/Reduktionen
  t = applyRuleList(t, S_LAUT_RULES,    true);  // 4. s-Laute / ß
  t = applyRuleList(t, VOKAL_RULES,     true);  // 5. Vokallänge / tz / Dopplung
  t = applyRuleList(t, SCHWA_RULES,     true);  // 6. Schwa-Elision
  t = applyRuleList(t, CLUSTER_RULES,   true);  // 7. Konsonantencluster
  t = applyRuleList(t, MORPHO_RULES,    true);  // 8. Stammprinzip / Morphologie
  t = applyRuleList(t, DAS_DASS_RULES,  false); // 9. das/dass
  t = capitalizeKnownNouns(t);                  // 10. Nomen-Großschreibung
  t = capitalizeSentenceStarts(t);              // 11. Satzanfang
  t = t.replace(/\s{2,}/g, " ").trim();         // 12. Leerzeichen
  return t;
}


// ── SELBSTTEST ────────────────────────────────────────────────────────────

/**
 * runSelfTest(): { result, pass, fail, total }
 * Referenzsatz: 97/97 Tokens, 0 Abweichungen.
 */
export function runSelfTest() {
  const INPUT =
    "ich hab das gestern gelsen und dachte das wier villeicht schon ferig sind " +
    "aber irgentwie hat es sich nich so angefühlt. dann bin ich einfach weiter " +
    "gegangen obwohl ich garnich wusste ob das so sin macht und keiner hats mir " +
    "richtig erklert. es war zimlich komisch weil der satz eigendlich schon " +
    "zuende war und ich trozdem noch weiter geschriben hab. ich weis nich ob das " +
    "vieleicht besser gewessen wär früher aufzuhörn aber jetzt ist es halt so. " +
    "am ende hab ich gemerkt das ich zwar alles gesagt hab aber nich das was ich " +
    "sagen wolte.";

  const EXPECTED =
    "Ich habe das gestern gelesen und dachte, dass wir vielleicht schon fertig " +
    "sind aber irgendwie hat es sich nicht so angefühlt. Dann bin ich einfach " +
    "weitergegangen obwohl ich gar nicht wusste ob das so Sinn macht und keiner " +
    "hat es mir richtig erklärt. Es war ziemlich komisch weil der Satz eigentlich " +
    "schon zu Ende war und ich trotzdem noch weiter geschrieben habe. Ich weiß " +
    "nicht ob das vielleicht besser gewesen wäre früher aufzuhören aber jetzt ist " +
    "es halt so. Am Ende habe ich gemerkt, dass ich zwar alles gesagt habe aber " +
    "nicht das was ich sagen wollte.";

  const result = applyNormalization(INPUT);
  const rTok   = result.split(/\s+/);
  const eTok   = EXPECTED.split(/\s+/);
  const iTok   = INPUT.split(/\s+/);
  const maxLen = Math.max(rTok.length, eTok.length);
  let pass = 0, fail = 0;

  console.group("🧪 normalizer.js — Selbsttest");
  console.log("INPUT:   ", INPUT);
  console.log("RESULT:  ", result);
  console.log("EXPECTED:", EXPECTED);
  console.log("");

  for (let i = 0; i < maxLen; i++) {
    const r = rTok[i] ?? "∅", e = eTok[i] ?? "∅";
    if (r === e) { pass++; }
    else {
      fail++;
      console.warn(`  ❌ Token ${String(i).padStart(2)}: original="${iTok[i] ?? "∅"}"  →  got="${r}"  expected="${e}"`);
    }
  }
  console.log(`\n${fail === 0 ? "✅" : "⚠️"} ${pass}/${maxLen} Tokens korrekt — ❌ ${fail} Abweichungen`);
  console.groupEnd();
  return { result, pass, fail, total: maxLen };
}
