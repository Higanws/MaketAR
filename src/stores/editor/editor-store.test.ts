import { beforeEach, describe, expect, it } from "vitest";
import { useEditorStore } from "./editor-store";

function currentShapes() {
  const state = useEditorStore.getState();
  return state.pages.find((page) => page.id === state.currentPageId)?.shapes ?? [];
}

describe("editor store", () => {
  beforeEach(() => {
    useEditorStore.getState().resetWorkspace("dashboard", "Test");
  });

  it("adds a shape and can undo/redo the insertion", () => {
    const initialCount = currentShapes().length;
    useEditorStore.getState().addShape("rect", "Rect");
    expect(currentShapes()).toHaveLength(initialCount + 1);

    useEditorStore.getState().undo();
    expect(currentShapes()).toHaveLength(initialCount);

    useEditorStore.getState().redo();
    expect(currentShapes()).toHaveLength(initialCount + 1);
  });

  it("aligns selected shapes by left edge", () => {
    useEditorStore.getState().hydrate({
      pages: [{
        id: "page-test",
        name: "Test",
        shapes: [
          { ...currentShapes()[0], id: "a", x: 10, y: 10, width: 100, height: 100 },
          { ...currentShapes()[0], id: "b", x: 80, y: 40, width: 100, height: 100 },
        ],
      }],
      currentPageId: "page-test",
      selectedId: "b",
      selectedIds: ["a", "b"],
    });

    useEditorStore.getState().alignSelected("left");
    const shapes = currentShapes();
    expect(shapes.find((shape) => shape.id === "a")?.x).toBe(10);
    expect(shapes.find((shape) => shape.id === "b")?.x).toBe(10);
  });
});
