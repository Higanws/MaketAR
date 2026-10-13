import type { DiagramMode, TemplateType, WirePage, WireShape } from "./wireframe.types";

type PageState = {
  pages: WirePage[];
  currentPageId: string;
};

const templateTypes = new Set<TemplateType>(["dashboard", "landing", "mobile", "form", "architecture"]);

export const clonePages = (pages: WirePage[]) =>
  pages.map((page) => ({
    ...page,
    shapes: page.shapes.map((shape) => ({
      ...shape,
      style: { ...shape.style, shadow: { ...shape.style.shadow } },
    })),
  }));

export const getCurrentShapes = (state: PageState) =>
  state.pages.find((page) => page.id === state.currentPageId)?.shapes ?? [];

export const updateCurrentPage = (
  state: PageState,
  updater: (shapes: WireShape[]) => WireShape[],
) => ({
  pages: state.pages.map((page) =>
    page.id === state.currentPageId ? { ...page, shapes: updater(page.shapes) } : page,
  ),
});

export const isTemplateType = (kind: DiagramMode | "mixed" | TemplateType): kind is TemplateType =>
  templateTypes.has(kind as TemplateType);
