// @vitest-environment node
import { describe, expect, it } from "vitest";

import { EditorDocumentSchema } from "@/server/schemas/document.schema";

const validDocument = {
  version: 5,
  pages: [{ id: "page-1", name: "Main", shapes: [] }],
  currentPageId: "page-1",
  mode: "wireframe" as const,
  zoom: 1,
  showGrid: true,
  snapToGrid: true,
  gridSize: 24,
  diagramNodes: [],
  diagramEdges: [],
};

describe("EditorDocumentSchema", () => {
  it("accepts a valid document", () => {
    expect(EditorDocumentSchema.parse(validDocument)).toEqual(validDocument);
  });

  it("rejects missing pages", () => {
    expect(() => EditorDocumentSchema.parse({ ...validDocument, pages: [] })).toThrow();
  });

  it("rejects invalid currentPageId", () => {
    expect(() =>
      EditorDocumentSchema.parse({ ...validDocument, currentPageId: "missing" }),
    ).toThrow(/currentPageId/);
  });

  it("rejects unsupported version", () => {
    expect(() => EditorDocumentSchema.parse({ ...validDocument, version: 99 })).toThrow();
  });

  it("rejects invalid mode", () => {
    expect(() => EditorDocumentSchema.parse({ ...validDocument, mode: "invalid" })).toThrow();
  });

  it("accepts shapes and flow items that include older extra fields", () => {
    const document = {
      ...validDocument,
      pages: [{
        id: "page-1",
        name: "Main",
        shapes: [{ id: "shape-1", type: "rect", x: 0, y: 0, width: 40, height: 20, legacyFlag: true }],
      }],
      diagramNodes: [{ id: "node-1", position: { x: 1, y: 2 }, data: { label: "Inicio", variant: "start" }, extra: 1 }],
      diagramEdges: [{ id: "edge-1", source: "node-1", target: "node-1", label: "si" }],
    };
    expect(EditorDocumentSchema.parse(document)).toMatchObject(document);
  });

  it("rejects shapes and nodes that omit their identity", () => {
    expect(() => EditorDocumentSchema.parse({
      ...validDocument,
      pages: [{ id: "page-1", name: "Main", shapes: [{ type: "rect" }] }],
    })).toThrow();
    expect(() => EditorDocumentSchema.parse({
      ...validDocument,
      diagramNodes: [{ id: "node-1", data: { label: "Inicio", variant: "start" } }],
    })).toThrow();
    expect(() => EditorDocumentSchema.parse({
      ...validDocument,
      diagramEdges: [{ source: "a", target: "b" }],
    })).toThrow();
  });
});
