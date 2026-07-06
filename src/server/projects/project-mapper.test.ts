// @vitest-environment node
import { describe, expect, it } from "vitest";

import { diagramToDocument } from "@/server/projects/project-mapper";

describe("diagramToDocument", () => {
  it("maps a complete diagram record", () => {
    const document = diagramToDocument({
      id: "diagram-1",
      projectId: "project-1",
      name: "Main",
      type: "MIXED",
      canvasJson: {
        pages: [{ id: "page-1", name: "Main", shapes: [] }],
        diagramNodes: [{ id: "node-1" }],
        diagramEdges: [{ id: "edge-1" }],
        updatedAt: "2026-06-20T12:00:00.000Z",
      },
      viewportJson: {
        currentPageId: "page-1",
        mode: "diagram",
        zoom: 1.25,
        showGrid: false,
        snapToGrid: true,
        gridSize: 16,
      },
      thumbnailUrl: null,
      createdAt: new Date("2026-06-20T10:00:00.000Z"),
      updatedAt: new Date("2026-06-20T12:00:00.000Z"),
    });

    expect(document.currentPageId).toBe("page-1");
    expect(document.mode).toBe("diagram");
    expect(document.zoom).toBe(1.25);
    expect(document.diagramNodes).toHaveLength(1);
    expect(document.diagramEdges).toHaveLength(1);
    expect(document.version).toBe(5);
  });

  it("falls back when canvas and viewport are partial", () => {
    const document = diagramToDocument({
      id: "diagram-2",
      projectId: "project-2",
      name: "Partial",
      type: "MIXED",
      canvasJson: {},
      viewportJson: null,
      thumbnailUrl: null,
      createdAt: new Date("2026-06-20T10:00:00.000Z"),
      updatedAt: new Date("2026-06-20T11:00:00.000Z"),
    });

    expect(document.pages).toEqual([]);
    expect(document.currentPageId).toBe("");
    expect(document.mode).toBe("wireframe");
    expect(document.zoom).toBe(1);
    expect(document.diagramNodes).toEqual([]);
    expect(document.updatedAt).toBe("2026-06-20T11:00:00.000Z");
  });
});
