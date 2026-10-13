import type { WireShape } from "@/entities/wireframe/wireframe.types";

export type AlignmentGuide = { orientation: "vertical" | "horizontal"; position: number };

type Bounds = { x: number; y: number; width: number; height: number };

const ALIGN_THRESHOLD = 10;
const canvasFrameShapeTypes = new Set<WireShape["type"]>(["desktop", "mobile", "modal"]);

export function boundsContain(frame: WireShape, bounds: Bounds) {
  return (
    bounds.x >= frame.x &&
    bounds.y >= frame.y &&
    bounds.x + bounds.width <= frame.x + frame.width &&
    bounds.y + bounds.height <= frame.y + frame.height
  );
}

export function getGuideCandidates(shapes: WireShape[], movingIds: Set<string>, bounds: Bounds) {
  const frames = shapes
    .filter((shape) => shape.visible && canvasFrameShapeTypes.has(shape.type) && !movingIds.has(shape.id))
    .sort((a, b) => a.width * a.height - b.width * b.height);
  const containingFrame = frames.find((shape) => boundsContain(shape, bounds));
  const candidates = shapes.filter((shape) => {
    if (!shape.visible || movingIds.has(shape.id) || canvasFrameShapeTypes.has(shape.type)) return false;
    if (!containingFrame) return true;
    return boundsContain(containingFrame, shape);
  });

  return candidates.length
    ? candidates
    : shapes.filter((shape) => shape.visible && !movingIds.has(shape.id) && !canvasFrameShapeTypes.has(shape.type));
}

export function getShapeBounds(shapes: WireShape[]) {
  const minX = Math.min(...shapes.map((shape) => shape.x));
  const minY = Math.min(...shapes.map((shape) => shape.y));
  const maxX = Math.max(...shapes.map((shape) => shape.x + shape.width));
  const maxY = Math.max(...shapes.map((shape) => shape.y + shape.height));

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function matchAlignment(shapes: WireShape[], movingIds: Set<string>, bounds: Bounds) {
  let bestX = ALIGN_THRESHOLD + 1;
  let bestY = ALIGN_THRESHOLD + 1;
  let bestVertical: { diff: number; position: number } | null = null;
  let bestHorizontal: { diff: number; position: number } | null = null;
  const movingX = [bounds.x, bounds.x + bounds.width / 2, bounds.x + bounds.width];
  const movingY = [bounds.y, bounds.y + bounds.height / 2, bounds.y + bounds.height];

  for (const shape of getGuideCandidates(shapes, movingIds, bounds)) {
    const targetX = [shape.x, shape.x + shape.width / 2, shape.x + shape.width];
    const targetY = [shape.y, shape.y + shape.height / 2, shape.y + shape.height];

    for (let index = 0; index < movingX.length; index += 1) {
      const diff = targetX[index] - movingX[index];
      const distance = Math.abs(diff);
      if (distance < Math.abs(bestX)) bestX = diff;
      if (distance <= ALIGN_THRESHOLD && (!bestVertical || distance < Math.abs(bestVertical.diff))) {
        bestVertical = { diff, position: targetX[index] };
      }
    }

    for (let index = 0; index < movingY.length; index += 1) {
      const diff = targetY[index] - movingY[index];
      const distance = Math.abs(diff);
      if (distance < Math.abs(bestY)) bestY = diff;
      if (distance <= ALIGN_THRESHOLD && (!bestHorizontal || distance < Math.abs(bestHorizontal.diff))) {
        bestHorizontal = { diff, position: targetY[index] };
      }
    }
  }

  const guides: AlignmentGuide[] = [];
  if (bestVertical) guides.push({ orientation: "vertical", position: bestVertical.position });
  if (bestHorizontal) guides.push({ orientation: "horizontal", position: bestHorizontal.position });

  const snappedX = Math.abs(bestX) <= ALIGN_THRESHOLD;
  const snappedY = Math.abs(bestY) <= ALIGN_THRESHOLD;
  return {
    dx: snappedX ? bestX : 0,
    dy: snappedY ? bestY : 0,
    snappedX,
    snappedY,
    guides,
  };
}

export function getAlignmentGuides(shapes: WireShape[], movingIds: Set<string>, bounds: Bounds) {
  return matchAlignment(shapes, movingIds, bounds).guides;
}
