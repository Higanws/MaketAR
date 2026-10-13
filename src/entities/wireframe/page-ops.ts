import { getGuideCandidates } from "@/features/editor/wireframe/alignment-guides";

import type { DiagramMode, TemplateType, WirePage, WireShape } from "./wireframe.types";

type PageState = {
  pages: WirePage[];
  currentPageId: string;
};

const templateTypes = new Set<TemplateType>(["dashboard", "landing", "mobile", "form", "architecture"]);

export const clonePages = (pages: WirePage[]) =>
  pages.map((page) => ({
    ...page,
    shapes: page.shapes.map((shape) => ({
      ...shape,
      style: { ...shape.style, shadow: { ...shape.style.shadow } },
    })),
  }));

export const getCurrentShapes = (state: PageState) =>
  state.pages.find((page) => page.id === state.currentPageId)?.shapes ?? [];

export const updateCurrentPage = (
  state: PageState,
  updater: (shapes: WireShape[]) => WireShape[],
) => ({
  pages: state.pages.map((page) =>
    page.id === state.currentPageId ? { ...page, shapes: updater(page.shapes) } : page,
  ),
});

export const isTemplateType = (kind: DiagramMode | "mixed" | TemplateType): kind is TemplateType =>
  templateTypes.has(kind as TemplateType);

export const snapToObjects = (
  shapes: WireShape[],
  movingIds: Set<string>,
  bounds: { x: number; y: number; width: number; height: number },
) => {
  const threshold = 10;
  const candidates = getGuideCandidates(shapes, movingIds, bounds);
  let snapDx = 0;
  let snapDy = 0;
  let snappedX = false;
  let snappedY = false;
  let bestX = threshold + 1;
  let bestY = threshold + 1;
  const movingX = [bounds.x, bounds.x + bounds.width / 2, bounds.x + bounds.width];
  const movingY = [bounds.y, bounds.y + bounds.height / 2, bounds.y + bounds.height];

  for (const shape of candidates) {
    const targetX = [shape.x, shape.x + shape.width / 2, shape.x + shape.width];
    const targetY = [shape.y, shape.y + shape.height / 2, shape.y + shape.height];

    for (let index = 0; index < movingX.length; index += 1) {
      const diff = targetX[index] - movingX[index];
      if (Math.abs(diff) < Math.abs(bestX)) {
        bestX = diff;
        snappedX = Math.abs(diff) <= threshold;
        snapDx = snappedX ? diff : 0;
      }
    }

    for (let index = 0; index < movingY.length; index += 1) {
      const diff = targetY[index] - movingY[index];
      if (Math.abs(diff) < Math.abs(bestY)) {
        bestY = diff;
        snappedY = Math.abs(diff) <= threshold;
        snapDy = snappedY ? diff : 0;
      }
    }
  }

  return { dx: snapDx, dy: snapDy, snappedX, snappedY };
};
