"use client";

import { toPng } from "html-to-image";

import { escapeXml } from "@/shared/lib/export-utils";

export async function exportPdfFromElement(
  element: HTMLElement,
  fileName: string,
  backgroundColor = "#ffffff",
) {
  const dataUrl = await toPng(element, { backgroundColor, pixelRatio: 2 });
  const printWindow = window.open("", "_blank", "width=1200,height=800");
  if (!printWindow) return;
  printWindow.document.write(`
    <html>
      <head><title>${escapeXml(fileName)}</title></head>
      <body style="margin:0;display:grid;place-items:center;background:white;">
        <img src="${dataUrl}" style="max-width:100%;height:auto;" />
        <script>window.onload = () => { window.print(); window.close(); };</script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
