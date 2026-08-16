import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  throw new Error(
    "Usage: node tools/generate-vietnam-location-labels.mjs <GeoNames-VN.txt> <output.ts>",
  );
}

const normalize = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, (character) => (character === "đ" ? "d" : "D"))
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const raw = await readFile(resolve(inputPath), "utf8");
const labels = new Map();

for (const line of raw.split(/\r?\n/)) {
  const fields = line.split("\t");
  const [_, vietnameseName, asciiName, , , , featureClass, featureCode] =
    fields;

  if (
    featureClass !== "A" ||
    !["ADM1", "ADM2", "ADM3", "ADM4"].includes(featureCode) ||
    !vietnameseName ||
    !asciiName
  ) {
    continue;
  }

  const key = normalize(vietnameseName);
  if (!key) continue;
  labels.set(key, asciiName.trim());
}

const output = `/**\n * Generated from GeoNames Vietnam (VN.zip), administrative features ADM1–ADM4.\n * Source: https://download.geonames.org/export/dump/\n * Regenerate with: node tools/generate-vietnam-location-labels.mjs <VN.txt> <output.ts>\n */\nexport const vietnamLocationLatinNames: Readonly<Record<string, string>> = ${JSON.stringify(
  Object.fromEntries([...labels.entries()].sort(([left], [right]) => left.localeCompare(right))),
  null,
  2,
)};\n`;

await writeFile(resolve(outputPath), output, "utf8");
