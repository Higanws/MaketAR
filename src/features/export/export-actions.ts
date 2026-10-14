"use client";

import { linearGradientSvgEndpoints, shapeUsesFillGradient, svgGradientId } from "@/entities/wireframe/fill-gradient";
import type { WireShape } from "@/entities/wireframe/wireframe.types";
import { escapeXml, sanitizeFileName } from "@/shared/lib/export-utils";

export function exportJson(payload: unknown, fileName = "maketar-project") {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  downloadBlob(blob, `${sanitizeFileName(fileName)}.json`);
}

function shapeSvgFill(shape: WireShape): { fill: string; def: string } {
  if (!shapeUsesFillGradient(shape) || !shape.style.fillGradient) {
    return { fill: shape.style.fill, def: "" };
  }
  const gradient = shape.style.fillGradient;
  const id = svgGradientId(shape.id);
  const ends = linearGradientSvgEndpoints(gradient.angle, shape.width, shape.height);
  const def = `<linearGradient id="${id}" gradientUnits="objectBoundingBox" x1="${ends.x1}" y1="${ends.y1}" x2="${ends.x2}" y2="${ends.y2}"><stop offset="0%" stop-color="${escapeXml(gradient.from)}"/><stop offset="100%" stop-color="${escapeXml(gradient.to)}"/></linearGradient>`;
  return { fill: `url(#${id})`, def };
}

export function buildWireframeSvg(shapes: WireShape[]): string {
  const defs: string[] = [];
  const body = shapes
    .filter((shape) => shape.visible)
    .map((shape) => {
      const text = shape.text
        .split("\n")
        .map((line, index) => `<tspan x="${shape.x + shape.width / 2}" dy="${index === 0 ? 0 : 18}">${escapeXml(line)}</tspan>`)
        .join("");
      const rx = shape.type === "circle" ? shape.width / 2 : shape.style.borderRadius;
      const { fill, def } = shapeSvgFill(shape);
      if (def) defs.push(def);
      const rect = `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" rx="${rx}" fill="${escapeXml(fill)}" stroke="${escapeXml(shape.style.stroke)}" stroke-width="${shape.style.strokeWidth}" opacity="${shape.style.opacity}" transform="rotate(${shape.style.rotation} ${shape.x + shape.width / 2} ${shape.y + shape.height / 2})" />`;
      const label = shape.type === "icon" || shape.type === "image" ? "" : `<text text-anchor="middle" dominant-baseline="middle" x="${shape.x + shape.width / 2}" y="${shape.y + shape.height / 2}" font-family="${escapeXml(shape.style.fontFamily)}" font-size="${shape.style.fontSize}" fill="${escapeXml(shape.style.textColor)}">${text}</text>`;
      return `${rect}${label}`;
    })
    .join("");
  const definitions = defs.length > 0 ? `<defs>${defs.join("")}</defs>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="2200" height="1600" viewBox="0 0 2200 1600">${definitions}${body}</svg>`;
}

export function exportSvg(shapes: WireShape[], fileName: string) {
  downloadBlob(new Blob([buildWireframeSvg(shapes)], { type: "image/svg+xml" }), `${sanitizeFileName(fileName)}.svg`);
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
