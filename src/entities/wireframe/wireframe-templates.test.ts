import { describe, expect, it } from "vitest";

import { makeTemplateShapes } from "./wireframe-templates";

describe("wireframe templates", () => {
  it("returns non-empty shapes for the mobile template", () => {
    const shapes = makeTemplateShapes("mobile");

    expect(shapes.length).toBeGreaterThan(0);
  });
});
