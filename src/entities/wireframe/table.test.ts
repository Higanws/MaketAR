import { describe, expect, it } from "vitest";
import { addTableColumn, addTableRow, parseTableText, updateTableCell } from "./table";

describe("wireframe table helpers", () => {
  it("normalizes rows to the widest column count", () => {
    expect(parseTableText("A | B\nC")).toEqual([
      ["A", "B"],
      ["C", ""],
    ]);
  });

  it("updates a single cell without changing other cells", () => {
    expect(updateTableCell("A | B\nC | D", 1, 0, "Z")).toBe("A | B\nZ | D");
  });

  it("adds rows and columns", () => {
    expect(addTableRow("A | B")).toBe("A | B\n | ");
    expect(addTableColumn("A | B")).toBe("A | B | ");
  });
});
