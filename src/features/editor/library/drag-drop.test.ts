import type { DragEvent } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  LIBRARY_DRAG_MIME,
  handleLibraryDragOver,
  libraryDragProps,
  parseLibraryDragPayload,
} from "@/features/editor/library/drag-drop";

describe("parseLibraryDragPayload", () => {
  it("returns null for empty or invalid json", () => {
    expect(parseLibraryDragPayload("")).toBeNull();
    expect(parseLibraryDragPayload("not-json")).toBeNull();
  });

  it("parses wireframe-shape payload", () => {
    const raw = JSON.stringify({ kind: "wireframe-shape", type: "rect", label: "Box" });
    expect(parseLibraryDragPayload(raw)).toEqual({ kind: "wireframe-shape", type: "rect", label: "Box" });
  });

  it("parses flow-node payload", () => {
    const raw = JSON.stringify({ kind: "flow-node", variant: "process", label: "Paso" });
    expect(parseLibraryDragPayload(raw)).toEqual({ kind: "flow-node", variant: "process", label: "Paso" });
  });

  it("rejects payload with missing required fields", () => {
    expect(parseLibraryDragPayload(JSON.stringify({ kind: "flow-node" }))).toBeNull();
    expect(parseLibraryDragPayload(JSON.stringify({ kind: "wireframe-shape" }))).toBeNull();
  });
});

describe("libraryDragProps", () => {
  it("sets drag data on drag start", () => {
    const payload = { kind: "flow-node" as const, variant: "start" as const };
    const setData = vi.fn();
    const props = libraryDragProps(payload);
    props.onDragStart({
      dataTransfer: { setData, effectAllowed: "" },
    } as unknown as DragEvent);

    expect(setData).toHaveBeenCalledWith(LIBRARY_DRAG_MIME, JSON.stringify(payload));
  });
});

describe("handleLibraryDragOver", () => {
  it("prevents default when library mime is present", () => {
    const preventDefault = vi.fn();
    handleLibraryDragOver({
      dataTransfer: { types: [LIBRARY_DRAG_MIME], dropEffect: "" },
      preventDefault,
    } as unknown as DragEvent);
    expect(preventDefault).toHaveBeenCalled();
  });

  it("ignores unrelated drag types", () => {
    const preventDefault = vi.fn();
    handleLibraryDragOver({
      dataTransfer: { types: ["text/plain"], dropEffect: "" },
      preventDefault,
    } as unknown as DragEvent);
    expect(preventDefault).not.toHaveBeenCalled();
  });
});
