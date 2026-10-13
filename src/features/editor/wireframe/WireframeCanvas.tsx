import { PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  LIBRARY_DRAG_MIME,
  handleLibraryDragOver,
  parseLibraryDragPayload,
} from "@/features/editor/library/drag-drop";
import { AlignmentGuideLayer } from "@/features/editor/wireframe/AlignmentGuideLayer";
import {
  type AlignmentGuide,
  getAlignmentGuides,
  getShapeBounds,
} from "@/features/editor/wireframe/alignment-guides";
import { CanvasShape, type ResizeDraft } from "@/features/editor/wireframe/CanvasShape";
import { clientToCanvas } from "@/features/editor/wireframe/canvas-coords";
import { MarqueeOverlay } from "@/features/editor/wireframe/MarqueeOverlay";
import { getResizeGeometry } from "@/features/editor/wireframe/resize-geometry";
import { WireframeContextMenu } from "@/features/editor/wireframe/WireframeContextMenu";
import { useEditorStore } from "@/stores/editor";

export function WireframeCanvas() {
  const pages = useEditorStore((state) => state.pages);
  const currentPageId = useEditorStore((state) => state.currentPageId);
  const selectedId = useEditorStore((state) => state.selectedId);
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const zoom = useEditorStore((state) => state.zoom);
  const pan = useEditorStore((state) => state.pan);
  const gridSize = useEditorStore((state) => state.gridSize);
  const showGrid = useEditorStore((state) => state.showGrid);
  const snapToGrid = useEditorStore((state) => state.snapToGrid);
  const selectShape = useEditorStore((state) => state.selectShape);
  const selectShapes = useEditorStore((state) => state.selectShapes);
  const addShape = useEditorStore((state) => state.addShape);
  const addIconShape = useEditorStore((state) => state.addIconShape);
  const addCustomIconShape = useEditorStore((state) => state.addCustomIconShape);
  const addTemplate = useEditorStore((state) => state.addTemplate);
  const moveShape = useEditorStore((state) => state.moveShape);
  const resizeShape = useEditorStore((state) => state.resizeShape);
  const rotateShape = useEditorStore((state) => state.rotateShape);
  const setPan = useEditorStore((state) => state.setPan);
  const setZoom = useEditorStore((state) => state.setZoom);
  const duplicateShape = useEditorStore((state) => state.duplicateShape);
  const deleteSelected = useEditorStore((state) => state.deleteSelected);
  const bringForward = useEditorStore((state) => state.bringForward);
  const sendBackward = useEditorStore((state) => state.sendBackward);
  const toggleShapeLock = useEditorStore((state) => state.toggleShapeLock);
  const groupSelected = useEditorStore((state) => state.groupSelected);
  const ungroupSelected = useEditorStore((state) => state.ungroupSelected);
  const checkpoint = useEditorStore((state) => state.checkpoint);
  const [drag, setDrag] = useState<null | { id: string; dx: number; dy: number }>(null);
  const [resize, setResize] = useState<null | ResizeDraft>(null);
  const [rotate, setRotate] = useState<null | {
    id: string;
    centerX: number;
    centerY: number;
    startAngle: number;
    startRotation: number;
  }>(null);
  const [canvasDrag, setCanvasDrag] = useState<null | { x: number; y: number; px: number; py: number }>(null);
  const [marquee, setMarquee] = useState<null | {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    additive: boolean;
  }>(null);
  const [contextMenu, setContextMenu] = useState<null | { id: string; x: number; y: number }>(null);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const interactionCheckpointRef = useRef(false);
  const shapes = useMemo(
    () => pages.find((page) => page.id === currentPageId)?.shapes ?? [],
    [pages, currentPageId],
  );
  const orderedShapes = useMemo(
    () => [...shapes].filter((shape) => shape.visible).sort((a, b) => a.layer - b.layer),
    [shapes],
  );

  const pointerToCanvasFromClient = useCallback((clientX: number, clientY: number) => {
    return clientToCanvas(clientX, clientY, canvasRef.current?.getBoundingClientRect(), pan, zoom);
  }, [pan, zoom]);

  const pointerToCanvas = (event: PointerEvent) => {
    return pointerToCanvasFromClient(event.clientX, event.clientY);
  };

  const getMarqueeRect = useCallback((selection: NonNullable<typeof marquee>) => {
    const x = Math.min(selection.startX, selection.currentX);
    const y = Math.min(selection.startY, selection.currentY);
    const width = Math.abs(selection.currentX - selection.startX);
    const height = Math.abs(selection.currentY - selection.startY);
    return { x, y, width, height };
  }, []);

  const findShapesInRect = useCallback(
    (rect: { x: number; y: number; width: number; height: number }) =>
      shapes
        .filter((shape) => {
          if (!shape.visible || shape.locked) return false;
          const shapeRight = shape.x + shape.width;
          const shapeBottom = shape.y + shape.height;
          const rectRight = rect.x + rect.width;
          const rectBottom = rect.y + rect.height;
          return shape.x < rectRight && shapeRight > rect.x && shape.y < rectBottom && shapeBottom > rect.y;
        })
        .map((shape) => shape.id),
    [shapes],
  );

  const ensureInteractionCheckpoint = useCallback(() => {
    if (interactionCheckpointRef.current) return;
    checkpoint();
    interactionCheckpointRef.current = true;
  }, [checkpoint]);

  const updateDragGuides = useCallback(
    (id: string, x: number, y: number) => {
      if (!snapToGrid) {
        setAlignmentGuides([]);
        return;
      }
      const shapeToMove = shapes.find((shape) => shape.id === id);
      if (!shapeToMove) return;
      const groupShapes = shapeToMove.groupId
        ? shapes.filter((shape) => shape.groupId === shapeToMove.groupId && !shape.locked)
        : [shapeToMove];
      const movingIds = new Set(groupShapes.map((shape) => shape.id));
      const currentBounds = getShapeBounds(groupShapes);
      setAlignmentGuides(
        getAlignmentGuides(shapes, movingIds, {
          ...currentBounds,
          x: currentBounds.x + x - shapeToMove.x,
          y: currentBounds.y + y - shapeToMove.y,
        }),
      );
    },
    [shapes, snapToGrid],
  );

  const updateResizeGuides = useCallback(
    (id: string, x: number, y: number, width: number, height: number) => {
      if (!snapToGrid) {
        setAlignmentGuides([]);
        return;
      }
      const movingIds = new Set([id]);
      setAlignmentGuides(getAlignmentGuides(shapes, movingIds, { x, y, width, height }));
    },
    [shapes, snapToGrid],
  );

  const zoomAtPoint = useCallback(
    (clientX: number, clientY: number, nextZoom: number) => {
      const bounds = canvasRef.current?.getBoundingClientRect();
      if (!bounds) {
        setZoom(nextZoom);
        return;
      }
      const clampedZoom = Math.min(2.2, Math.max(0.35, nextZoom));
      const worldX = (clientX - bounds.left - pan.x) / zoom;
      const worldY = (clientY - bounds.top - pan.y) / zoom;
      setZoom(clampedZoom);
      setPan({
        x: clientX - bounds.left - worldX * clampedZoom,
        y: clientY - bounds.top - worldY * clampedZoom,
      });
    },
    [pan.x, pan.y, setPan, setZoom, zoom],
  );

  useEffect(() => {
    if (!drag && !resize && !rotate && !canvasDrag && !marquee) return;

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      if (drag) {
        ensureInteractionCheckpoint();
        const point = pointerToCanvasFromClient(event.clientX, event.clientY);
        updateDragGuides(drag.id, Math.round(point.x - drag.dx), Math.round(point.y - drag.dy));
        moveShape(drag.id, Math.round(point.x - drag.dx), Math.round(point.y - drag.dy));
      }
      if (resize) {
        ensureInteractionCheckpoint();
        const point = pointerToCanvasFromClient(event.clientX, event.clientY);
        const next = getResizeGeometry(resize, point, event.ctrlKey);
        updateResizeGuides(resize.id, next.x, next.y, next.width, next.height);
        resizeShape(resize.id, next.width, next.height, next.x, next.y);
      }
      if (rotate) {
        ensureInteractionCheckpoint();
        const point = pointerToCanvasFromClient(event.clientX, event.clientY);
        const angle = Math.atan2(point.y - rotate.centerY, point.x - rotate.centerX) * 180 / Math.PI;
        rotateShape(rotate.id, Math.round(rotate.startRotation + angle - rotate.startAngle));
      }
      if (canvasDrag) {
        setPan({
          x: canvasDrag.px + event.clientX - canvasDrag.x,
          y: canvasDrag.py + event.clientY - canvasDrag.y,
        });
      }
      if (marquee) {
        const point = pointerToCanvasFromClient(event.clientX, event.clientY);
        setMarquee((current) => current ? { ...current, currentX: point.x, currentY: point.y } : current);
      }
    };

    const handlePointerUp = () => {
      if (marquee) {
        const rect = getMarqueeRect(marquee);
        if (rect.width > 4 || rect.height > 4) {
          selectShapes(findShapesInRect(rect), marquee.additive);
        }
      }
      setDrag(null);
      setResize(null);
      setRotate(null);
      setCanvasDrag(null);
      setMarquee(null);
      setAlignmentGuides([]);
      interactionCheckpointRef.current = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [
    canvasDrag,
    drag,
    ensureInteractionCheckpoint,
    moveShape,
    marquee,
    pointerToCanvasFromClient,
    resize,
    resizeShape,
    findShapesInRect,
    getMarqueeRect,
    selectShapes,
    setPan,
    rotate,
    rotateShape,
    updateDragGuides,
    updateResizeGuides,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
      if (!event.ctrlKey && !event.metaKey) return;
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomAtPoint(window.innerWidth / 2, window.innerHeight / 2, zoom + 0.12);
      }
      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        zoomAtPoint(window.innerWidth / 2, window.innerHeight / 2, zoom - 0.12);
      }
      if (event.key === "0") {
        event.preventDefault();
        zoomAtPoint(window.innerWidth / 2, window.innerHeight / 2, 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoom, zoomAtPoint]);

  return (
    <div
      ref={canvasRef}
      className="relative size-full cursor-grab overflow-hidden"
      onDragOver={handleLibraryDragOver}
      onDrop={(event) => {
        event.preventDefault();
        const payload = parseLibraryDragPayload(event.dataTransfer.getData(LIBRARY_DRAG_MIME));
        if (!payload) return;
        const point = pointerToCanvasFromClient(event.clientX, event.clientY);
        if (payload.kind === "wireframe-shape") {
          addShape(payload.type, payload.label, point);
          return;
        }
        if (payload.kind === "wireframe-icon") {
          addIconShape(payload.iconName, payload.iconSet, payload.svgSrc, point);
          return;
        }
        if (payload.kind === "wireframe-custom-icon") {
          addCustomIconShape(payload.name, payload.svgSrc, payload.iconSet, point);
          return;
        }
        if (payload.kind === "wireframe-template") {
          addTemplate(payload.template, point);
        }
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        setContextMenu(
          selectedIds.length
            ? { id: selectedId ?? selectedIds[0], x: event.clientX, y: event.clientY }
            : null,
        );
      }}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest("[data-shape-id]")) return;
        if (event.button !== 0 && event.button !== 1) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        setContextMenu(null);
        if (event.button === 0 && event.shiftKey) {
          const point = pointerToCanvas(event);
          setMarquee({
            startX: point.x,
            startY: point.y,
            currentX: point.x,
            currentY: point.y,
            additive: true,
          });
          return;
        }
        if (event.button === 0 || event.button === 1) {
          selectShape(null);
          setCanvasDrag({ x: event.clientX, y: event.clientY, px: pan.x, py: pan.y });
        }
      }}
      onWheel={(event) => {
        event.preventDefault();
        setContextMenu(null);
        if (event.shiftKey) {
          setPan({
            x: pan.x - event.deltaX,
            y: pan.y - event.deltaY,
          });
          return;
        }
        const direction = event.deltaY > 0 ? -1 : 1;
        zoomAtPoint(event.clientX, event.clientY, zoom + direction * 0.12);
      }}
      onPointerLeave={() => {
        if (!drag && !resize && !rotate && !canvasDrag && !marquee) {
          setDrag(null);
          setResize(null);
          setRotate(null);
          setCanvasDrag(null);
          setMarquee(null);
          setAlignmentGuides([]);
          interactionCheckpointRef.current = false;
        }
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={
          showGrid
            ? {
                backgroundImage:
                  "linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)",
                backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
                backgroundPosition: `${pan.x}px ${pan.y}px`,
              }
            : undefined
        }
      />
      <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
        <div className="relative h-[1600px] w-[2200px]">
          {orderedShapes.map((shape) => (
            <CanvasShape
              key={shape.id}
              shape={shape}
              selected={selectedIds.includes(shape.id)}
              primarySelected={shape.id === selectedId}
              isDragging={drag?.id === shape.id}
              onPointerDown={(event) => {
                event.stopPropagation();
                if (event.button !== 0) return;
                event.currentTarget.setPointerCapture(event.pointerId);
                if (shape.locked) return;
                interactionCheckpointRef.current = false;
                const point = pointerToCanvas(event);
                selectShape(shape.id, event.shiftKey || event.metaKey || event.ctrlKey);
                setDrag({ id: shape.id, dx: point.x - shape.x, dy: point.y - shape.y });
              }}
              onResizePointerDown={(event, handle) => {
                event.stopPropagation();
                event.currentTarget.setPointerCapture(event.pointerId);
                if (shape.locked) return;
                interactionCheckpointRef.current = false;
                const point = pointerToCanvas(event);
                selectShape(shape.id);
                setResize({ id: shape.id, handle, startX: point.x, startY: point.y, shape });
              }}
              onRotatePointerDown={(event) => {
                event.stopPropagation();
                event.currentTarget.setPointerCapture(event.pointerId);
                if (shape.locked) return;
                interactionCheckpointRef.current = false;
                const point = pointerToCanvas(event);
                const centerX = shape.x + shape.width / 2;
                const centerY = shape.y + shape.height / 2;
                const startAngle = Math.atan2(point.y - centerY, point.x - centerX) * 180 / Math.PI;
                selectShape(shape.id);
                setRotate({
                  id: shape.id,
                  centerX,
                  centerY,
                  startAngle,
                  startRotation: shape.style.rotation,
                });
              }}
              onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setContextMenu(
                  selectedIds.length
                    ? { id: selectedId ?? selectedIds[0], x: event.clientX, y: event.clientY }
                    : null,
                );
              }}
            />
          ))}
        </div>
      </div>
      <div className="absolute bottom-4 left-4 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
        Zoom {Math.round(zoom * 100)}%
      </div>
      {marquee ? <MarqueeOverlay rect={getMarqueeRect(marquee)} pan={pan} zoom={zoom} /> : null}
      <AlignmentGuideLayer guides={alignmentGuides} pan={pan} zoom={zoom} />
      {contextMenu ? (
        <WireframeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          selectedCount={selectedIds.length}
          onDuplicate={() => { duplicateShape(); setContextMenu(null); }}
          onGroup={() => { groupSelected(); setContextMenu(null); }}
          onUngroup={() => { ungroupSelected(); setContextMenu(null); }}
          onBringForward={() => { bringForward(); setContextMenu(null); }}
          onSendBackward={() => { sendBackward(); setContextMenu(null); }}
          onToggleLock={() => { toggleShapeLock(contextMenu.id); setContextMenu(null); }}
          onDelete={() => { deleteSelected(); setContextMenu(null); }}
        />
      ) : null}
    </div>
  );
}
