"use client";

import { toPng } from "html-to-image";

import { downloadUrl } from "@/features/export/export-actions";

export async function exportPngFromElement(
  element: HTMLElement,
  fileName: string,
  backgroundColor = "#e8edf5",
) {
  const dataUrl = await toPng(element, { backgroundColor, pixelRatio: 2 });
  downloadUrl(dataUrl, `${fileName}.png`);
}
