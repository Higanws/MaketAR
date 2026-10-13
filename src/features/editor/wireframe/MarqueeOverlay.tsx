export function MarqueeOverlay({
  rect,
  pan,
  zoom,
}: {
  rect: { x: number; y: number; width: number; height: number };
  pan: { x: number; y: number };
  zoom: number;
}) {
  return (
    <div
      className="pointer-events-none absolute z-40 border border-blue-500 bg-blue-500/10"
      style={{
        left: pan.x + rect.x * zoom,
        top: pan.y + rect.y * zoom,
        width: rect.width * zoom,
        height: rect.height * zoom,
      }}
    />
  );
}
