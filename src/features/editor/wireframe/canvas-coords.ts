export function clientToCanvas(
  clientX: number,
  clientY: number,
  bounds: DOMRect | undefined,
  pan: { x: number; y: number },
  zoom: number,
) {
  return {
    x: (clientX - (bounds?.left ?? 0) - pan.x) / zoom,
    y: (clientY - (bounds?.top ?? 0) - pan.y) / zoom,
  };
}
