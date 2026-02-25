// tokenizer.js — Tokenisierung (Stufe 1)
export function tokenize(text) {
  if (!text || typeof text !== "string") return [];
  return text.match(/\S+|\s+/g) ?? [];
}
