import { describe, expect, it } from "vitest";
import { escapeXml, sanitizeFileName, withAlpha } from "@/shared/lib/export-utils";

describe("export utils", () => {
  it("sanitizes filenames without changing normal spaces", () => {
    expect(sanitizeFileName("Mi Proyecto: v1")).toBe("Mi Proyecto- v1");
    expect(sanitizeFileName("")).toBe("maketar-export");
  });

  it("escapes xml text", () => {
    expect(escapeXml("<MaketAR & \"flow\">")).toBe("&lt;MaketAR &amp; &quot;flow&quot;&gt;");
  });

  it("converts hex colors to rgba", () => {
    expect(withAlpha("#336699", 0.5)).toBe("rgba(51, 102, 153, 0.5)");
    expect(withAlpha("transparent", 0.5)).toBe("transparent");
  });
});
