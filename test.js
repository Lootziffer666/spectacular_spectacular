import { runSelfTest } from "./normalizer.js";

console.log("═══════════════════════════════════════════════════════");
console.log("FLOW Normalizer — Selbsttest");
console.log("═══════════════════════════════════════════════════════");
console.log("");

const { result, pass, fail, total } = runSelfTest();

console.log("");
console.log("═══════════════════════════════════════════════════════");
if (fail === 0) {
  console.log("✅ ALLE TESTS BESTANDEN!");
} else {
  console.log(`⚠️  ${fail} von ${total} Tests fehlgeschlagen`);
}
console.log("═══════════════════════════════════════════════════════");

process.exit(fail === 0 ? 0 : 1);
