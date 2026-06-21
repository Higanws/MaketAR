"use client";

import type { WireShape } from "@/entities/wireframe/wireframe.types";
import { escapeXml, sanitizeFileName } from "@/shared/lib/export-utils";

export function exportJson(payload: unknown, fileName = "maketar-project") {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  downloadBlob(blob, `${sanitizeFileName(fileName)}.json`);
}

export function exportSvg(shapes: WireShape[], fileName: string) {
  const body = shapes
    .filter((shape) => shape.visible)
    .map((shape) => {
      const text = shape.text
        .split("\n")
        .map((line, index) => `<tspan x="${shape.x + shape.width / 2}" dy="${index === 0 ? 0 : 18}">${escapeXml(line)}</tspan>`)
        .join("");
      const rx = shape.type === "circle" ? shape.width / 2 : shape.style.borderRadius;
      const rect = `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" rx="${rx}" fill="${shape.style.fill}" stroke="${shape.style.stroke}" stroke-width="${shape.style.strokeWidth}" opacity="${shape.style.opacity}" transform="rotate(${shape.style.rotation} ${shape.x + shape.width / 2} ${shape.y + shape.height / 2})" />`;
      const label = shape.type === "icon" || shape.type === "image" ? "" : `<text text-anchor="middle" dominant-baseline="middle" x="${shape.x + shape.width / 2}" y="${shape.y + shape.height / 2}" font-family="${escapeXml(shape.style.fontFamily)}" font-size="${shape.style.fontSize}" fill="${shape.style.textColor}">${text}</text>`;
      return `${rect}${label}`;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2200" height="1600" viewBox="0 0 2200 1600">${body}</svg>`;
  downloadBlob(new Blob([svg], { type: "image/svg+xml" }), `${sanitizeFileName(fileName)}.svg`);
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  downloadUrl(url, fileName);
  URL.revokeObjectURL(url);
}

export function downloadUrl(url: string, fileName: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
}
