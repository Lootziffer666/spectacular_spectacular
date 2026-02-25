import { applyNormalization } from "./normalizer.js";

/**
 * TEST-PIPELINE
 * Ziel: Beweisen, dass der Normalizer bei echtem Input greift.
 * Keine Analyse, keine Filter, keine Guards.
 */
export function runCorrection(text) {
  if (typeof text !== "string") {
    return { corrected: "" };
  }

  const corrected = applyNormalization(text);

  return { corrected };
}
