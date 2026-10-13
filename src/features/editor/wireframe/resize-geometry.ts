import type { ResizeDraft } from "@/features/editor/wireframe/CanvasShape";

export function getResizeGeometry(draft: ResizeDraft, point: { x: number; y: number }, keepRatio: boolean) {
  const dx = point.x - draft.startX;
  const dy = point.y - draft.startY;
  const left = draft.handle.includes("w");
  const right = draft.handle.includes("e");
  const top = draft.handle.includes("n");
  const bottom = draft.handle.includes("s");
  const aspect = draft.shape.width / Math.max(1, draft.shape.height);
  let nextWidth = left ? draft.shape.width - dx : right ? draft.shape.width + dx : draft.shape.width;
  let nextHeight = top ? draft.shape.height - dy : bottom ? draft.shape.height + dy : draft.shape.height;

  if (keepRatio) {
    const widthChanged = left || right;
    const heightChanged = top || bottom;
    if (widthChanged && heightChanged) {
      if (Math.abs(nextWidth - draft.shape.width) >= Math.abs(nextHeight - draft.shape.height)) {
        nextHeight = nextWidth / aspect;
      } else {
        nextWidth = nextHeight * aspect;
      }
    } else if (widthChanged) {
      nextHeight = nextWidth / aspect;
    } else if (heightChanged) {
      nextWidth = nextHeight * aspect;
    }
  }

  nextWidth = Math.max(24, nextWidth);
  nextHeight = Math.max(24, nextHeight);

  const nextX = left
    ? draft.shape.x + draft.shape.width - nextWidth
    : keepRatio && (top || bottom)
      ? draft.shape.x + (draft.shape.width - nextWidth) / 2
      : draft.shape.x;
  const nextY = top
    ? draft.shape.y + draft.shape.height - nextHeight
    : keepRatio && (left || right)
      ? draft.shape.y + (draft.shape.height - nextHeight) / 2
      : draft.shape.y;

  return { x: nextX, y: nextY, width: nextWidth, height: nextHeight };
}
