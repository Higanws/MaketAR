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
});
