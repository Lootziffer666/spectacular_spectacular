import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { runCorrection } from "./pipeline.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  const inputPath = resolve(__dirname, "input.txt");
  const outPath = resolve(__dirname, "out.txt");

  const input = existsSync(inputPath) 
    ? readFileSync(inputPath, "utf8") 
    : "";

  const result = runCorrection(input);

  const output = typeof result === "string" 
    ? result 
    : (result?.corrected ?? "");

  writeFileSync(outPath, output, "utf8");
} catch (err) {
  writeFileSync(resolve(__dirname, "out.txt"), "", "utf8");
  console.error("FLOW ERROR:", err.message);
}
