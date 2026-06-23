import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const root = join(import.meta.dirname, "..");
const svgPath = join(root, "public/icons/app-icon.svg");
const svg = readFileSync(svgPath);

const outputs = [
  ["public/favicon.png", 64],
  ["public/apple-touch-icon.png", 180],
  ["public/icons/icon-192.png", 192],
  ["public/icons/icon-512.png", 512],
  ["public/logo.png", 256],
  ["src/app/favicon.ico", 32],
];

for (const [relativePath, size] of outputs) {
  const target = join(root, relativePath);
  const buffer = await sharp(svg).resize(size, size).png().toBuffer();
  writeFileSync(target, buffer);
}

const maskable = await sharp(svg)
  .resize(410, 410)
  .extend({ top: 51, bottom: 51, left: 51, right: 51, background: "#ffffff" })
  .png()
  .toBuffer();

writeFileSync(join(root, "public/icons/maskable-512.png"), maskable);
copyFileSync(join(root, "public/favicon.png"), join(root, "public/favicon.ico"));

console.log("Iconos generados correctamente.");
