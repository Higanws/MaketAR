import type { Prisma } from "@prisma/client";

import { prisma } from "@/server/db/prisma";
import type { EditorDocument } from "@/types/project";

export async function upsertProjectDocument(projectId: string, name: string, document: EditorDocument) {
  const existing = await prisma.diagram.findFirst({ where: { projectId }, orderBy: { updatedAt: "desc" } });
  const canvasJson = {
    pages: document.pages,
    diagramNodes: document.diagramNodes,
    diagramEdges: document.diagramEdges,
    updatedAt: document.updatedAt ?? new Date().toISOString(),
  } as Prisma.InputJsonObject;
  const viewportJson = {
    currentPageId: document.currentPageId,
    mode: document.mode,
    zoom: document.zoom,
    showGrid: document.showGrid,
    snapToGrid: document.snapToGrid,
    gridSize: document.gridSize,
  } as Prisma.InputJsonObject;

  if (existing) {
    await prisma.diagram.update({
      where: { id: existing.id },
      data: {
        name,
        type: "MIXED",
        canvasJson,
        viewportJson,
      },
    });
    return;
  }

  await prisma.diagram.create({
    data: {
      projectId,
      name,
      type: "MIXED",
      canvasJson,
      viewportJson,
    },
  });
}
