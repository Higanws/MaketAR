import type { AlignmentGuide } from "@/features/editor/wireframe/alignment-guides";

export function AlignmentGuideLayer({
  guides,
  pan,
  zoom,
}: {
  guides: AlignmentGuide[];
  pan: { x: number; y: number };
  zoom: number;
}) {
  return (
    <>
      {guides.map((guide) => (
        <div
          key={`${guide.orientation}-${guide.position}`}
          className="pointer-events-none absolute z-30 bg-blue-500/70"
          style={
            guide.orientation === "vertical"
              ? { left: pan.x + guide.position * zoom, top: 0, width: 1, height: "100%" }
              : { left: 0, top: pan.y + guide.position * zoom, width: "100%", height: 1 }
          }
        />
      ))}
    </>
  );
}
