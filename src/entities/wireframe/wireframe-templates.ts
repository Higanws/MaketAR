import type { ShapeStyle, TemplateType, WirePage, WireShape } from "@/stores/editor/editor-store";

import { makeShape, normalizeStyle } from "./shape-factory";

export const initialShapes: WireShape[] = [
  {
    id: "shape-desktop",
    type: "desktop",
    name: "Desktop frame",
    x: 160,
    y: 110,
    width: 620,
    height: 390,
    text: "Product Dashboard",
    locked: false,
    visible: true,
    layer: 1,
    style: normalizeStyle({
      fill: "#f8fafc",
      stroke: "#94a3b8",
      borderRadius: 18,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18,
      fontSize: 18,
    }),
  },
  {
    id: "shape-sidebar",
    type: "navbar",
    name: "Sidebar",
    x: 188,
    y: 164,
    width: 142,
    height: 292,
    text: "Navigation",
    locked: false,
    visible: true,
    layer: 2,
    style: normalizeStyle({
      fill: "#111827",
      stroke: "#111827",
      textColor: "#ffffff",
      borderRadius: 14,
    }),
  },
  {
    id: "shape-card",
    type: "card",
    name: "Metrics card",
    x: 360,
    y: 180,
    width: 180,
    height: 108,
    text: "Revenue\n$42.8k",
    locked: false,
    visible: true,
    layer: 3,
    style: normalizeStyle({ fill: "#ffffff", stroke: "#cbd5e1", borderRadius: 16 }),
  },
  {
    id: "shape-button",
    type: "button",
    name: "Primary button",
    x: 576,
    y: 386,
    width: 148,
    height: 42,
    text: "Export",
    locked: false,
    visible: true,
    layer: 4,
    style: normalizeStyle({
      fill: "#2563eb",
      stroke: "#1d4ed8",
      textColor: "#ffffff",
      borderRadius: 12,
    }),
  },
];

export const createInitialWireframePage: WirePage = {
  id: "page-home",
  name: "Dashboard wireframe",
  shapes: initialShapes,
};

export const makeTemplateShapes = (template: TemplateType) => {
  const now = Date.now();
  let layerIndex = 0;
  const mk = (
    type: WireShape["type"],
    patch: Partial<WireShape>,
    style?: Partial<ShapeStyle>,
  ): WireShape => ({
    ...makeShape(type, patch.name),
    id: `shape-${now}-${layerIndex}`,
    layer: layerIndex++,
    ...patch,
    style: normalizeStyle({ ...makeShape(type).style, shadow: { x: 0, y: 12, blur: 28, spread: -18, color: "rgba(15, 23, 42, 0.22)" }, ...style }),
  });

  if (template === "mobile") {
    return [
      mk("mobile", { name: "Mobile frame", x: 320, y: 64, width: 282, height: 584, text: "" }, { fill: "#f8fafc", stroke: "#334155", borderRadius: 34 }),
      mk("rect", { name: "Status bar", x: 348, y: 88, width: 226, height: 22, text: "9:41                                      5G" }, { fill: "transparent", stroke: "transparent", fontSize: 10, fontWeight: 700, textAlign: "left" }),
      mk("navbar", { name: "Mobile top bar", x: 348, y: 126, width: 226, height: 52, text: "Good morning\nAna" }, { fill: "#ffffff", stroke: "#e2e8f0", borderRadius: 16, fontSize: 13, textAlign: "left" }),
      mk("circle", { name: "Avatar", x: 528, y: 137, width: 30, height: 30, text: "" }, { fill: "#2563eb", stroke: "#1d4ed8" }),
      mk("card", { name: "Balance card", x: 348, y: 198, width: 226, height: 132, text: "Balance\n$12,430\n+8.2% this month" }, { fill: "#111827", stroke: "#111827", textColor: "#ffffff", borderRadius: 22, fontSize: 16, textAlign: "left" }),
      mk("button", { name: "Send action", x: 362, y: 348, width: 92, height: 42, text: "Send" }, { fill: "#2563eb", stroke: "#1d4ed8", textColor: "#ffffff", borderRadius: 14 }),
      mk("button", { name: "Request action", x: 468, y: 348, width: 92, height: 42, text: "Request" }, { fill: "#ecfeff", stroke: "#67e8f9", textColor: "#155e75", borderRadius: 14 }),
      mk("text", { name: "Section title", x: 348, y: 414, width: 160, height: 28, text: "Recent activity" }, { fontSize: 16, fontWeight: 800, textAlign: "left" }),
      mk("card", { name: "Activity row 1", x: 348, y: 454, width: 226, height: 54, text: "Figma subscription       -$15" }, { fill: "#ffffff", stroke: "#e2e8f0", borderRadius: 14, fontSize: 12, textAlign: "left" }),
      mk("card", { name: "Activity row 2", x: 348, y: 520, width: 226, height: 54, text: "Client payment        +$1,250" }, { fill: "#ffffff", stroke: "#e2e8f0", borderRadius: 14, fontSize: 12, textAlign: "left" }),
      mk("navbar", { name: "Bottom nav", x: 362, y: 598, width: 198, height: 34, text: "Home     Cards     Profile" }, { fill: "#ffffff", stroke: "#e2e8f0", borderRadius: 18, fontSize: 10 }),
    ];
  }

  if (template === "landing") {
    return [
      mk("desktop", { name: "Landing frame", x: 96, y: 72, width: 920, height: 600, text: "" }, { fill: "#f8fafc", stroke: "#94a3b8", borderRadius: 20 }),
      mk("navbar", { name: "Top nav", x: 132, y: 108, width: 848, height: 60, text: "MaketAR          Product    Templates    Pricing              Sign in" }, { fill: "#ffffff", stroke: "#e2e8f0", borderRadius: 14, fontSize: 13 }),
      mk("text", { name: "Hero eyebrow", x: 156, y: 214, width: 250, height: 24, text: "VISUAL WORKSPACE" }, { fill: "transparent", stroke: "transparent", textColor: "#2563eb", fontSize: 12, fontWeight: 800, textAlign: "left" }),
      mk("text", { name: "Hero headline", x: 156, y: 248, width: 420, height: 116, text: "Diagram your product before you build it" }, { fill: "transparent", stroke: "transparent", fontSize: 34, fontWeight: 900, textAlign: "left" }),
      mk("text", { name: "Hero body", x: 158, y: 376, width: 382, height: 64, text: "Create wireframes, product flows and technical architecture in one focused canvas." }, { fill: "transparent", stroke: "transparent", textColor: "#475569", fontSize: 15, fontWeight: 500, textAlign: "left" }),
      mk("button", { name: "Primary CTA", x: 158, y: 466, width: 146, height: 46, text: "Start mapping" }, { fill: "#2563eb", stroke: "#1d4ed8", textColor: "#ffffff", borderRadius: 12 }),
      mk("button", { name: "Secondary CTA", x: 318, y: 466, width: 130, height: 46, text: "View demos" }, { fill: "#ffffff", stroke: "#cbd5e1", textColor: "#0f172a", borderRadius: 12 }),
      mk("card", { name: "Hero canvas preview", x: 620, y: 216, width: 304, height: 286, text: "" }, { fill: "#ffffff", stroke: "#cbd5e1", borderRadius: 22 }),
      mk("card", { name: "Preview mini screen", x: 648, y: 248, width: 248, height: 94, text: "Wireframe screen" }, { fill: "#eef2ff", stroke: "#c7d2fe", borderRadius: 16 }),
      mk("card", { name: "Preview flow node A", x: 652, y: 378, width: 96, height: 52, text: "Idea" }, { fill: "#ecfeff", stroke: "#67e8f9", borderRadius: 14 }),
      mk("card", { name: "Preview flow node B", x: 786, y: 378, width: 96, height: 52, text: "Build" }, { fill: "#dcfce7", stroke: "#86efac", borderRadius: 14 }),
      mk("card", { name: "Social proof", x: 156, y: 560, width: 768, height: 54, text: "Trusted for product specs, service maps and technical documentation" }, { fill: "#ffffff", stroke: "#e2e8f0", textColor: "#475569", borderRadius: 14, fontSize: 13 }),
    ];
  }

  if (template === "form") {
    return [
      mk("desktop", { name: "Auth page frame", x: 140, y: 72, width: 760, height: 560, text: "" }, { fill: "#eef2ff", stroke: "#c7d2fe", borderRadius: 20 }),
      mk("card", { name: "Brand panel", x: 176, y: 108, width: 310, height: 488, text: "Design faster\nwith reusable blocks" }, { fill: "#111827", stroke: "#111827", textColor: "#ffffff", borderRadius: 22, fontSize: 24, fontWeight: 900, textAlign: "left" }),
      mk("card", { name: "Form panel", x: 522, y: 108, width: 342, height: 488, text: "" }, { fill: "#ffffff", stroke: "#cbd5e1", borderRadius: 22 }),
      mk("text", { name: "Form title", x: 558, y: 150, width: 240, height: 34, text: "Create account" }, { fill: "transparent", stroke: "transparent", fontSize: 24, fontWeight: 900, textAlign: "left" }),
      mk("text", { name: "Form subtitle", x: 560, y: 190, width: 242, height: 42, text: "Start with a clean visual workspace." }, { fill: "transparent", stroke: "transparent", textColor: "#64748b", fontSize: 13, fontWeight: 500, textAlign: "left" }),
      mk("input", { name: "Name input", x: 560, y: 260, width: 266, height: 46, text: "Full name" }, { borderRadius: 10, textAlign: "left", stroke: "#cbd5e1" }),
      mk("input", { name: "Email input", x: 560, y: 324, width: 266, height: 46, text: "Email address" }, { borderRadius: 10, textAlign: "left", stroke: "#cbd5e1" }),
      mk("input", { name: "Password input", x: 560, y: 388, width: 266, height: 46, text: "Password" }, { borderRadius: 10, textAlign: "left", stroke: "#cbd5e1" }),
      mk("button", { name: "Submit", x: 560, y: 466, width: 266, height: 48, text: "Create workspace" }, { fill: "#2563eb", stroke: "#1d4ed8", textColor: "#ffffff", borderRadius: 12 }),
      mk("text", { name: "Terms", x: 588, y: 536, width: 210, height: 28, text: "Already have an account? Sign in" }, { fill: "transparent", stroke: "transparent", textColor: "#64748b", fontSize: 12, fontWeight: 600 }),
    ];
  }

  if (template === "architecture") {
    return [
      mk("desktop", { name: "Architecture frame", x: 98, y: 72, width: 900, height: 584, text: "" }, { fill: "#f8fafc", stroke: "#94a3b8", borderRadius: 20 }),
      mk("text", { name: "Architecture title", x: 132, y: 116, width: 420, height: 42, text: "Cloud architecture map" }, { fill: "transparent", stroke: "transparent", fontSize: 26, fontWeight: 900, textAlign: "left" }),
      mk("card", { name: "Client layer", x: 148, y: 210, width: 150, height: 82, text: "Client apps\nWeb + Mobile" }, { fill: "#eef2ff", stroke: "#c7d2fe", borderRadius: 16 }),
      mk("card", { name: "Edge layer", x: 384, y: 210, width: 150, height: 82, text: "Edge\nCDN / WAF" }, { fill: "#ecfeff", stroke: "#67e8f9", borderRadius: 16 }),
      mk("card", { name: "API layer", x: 620, y: 210, width: 150, height: 82, text: "API Gateway\nNext.js" }, { fill: "#dcfce7", stroke: "#86efac", borderRadius: 16 }),
      mk("card", { name: "Service layer", x: 384, y: 370, width: 150, height: 82, text: "Workers\nQueues" }, { fill: "#fef3c7", stroke: "#fcd34d", borderRadius: 16 }),
      mk("database", { name: "Database", x: 620, y: 370, width: 150, height: 82, text: "PostgreSQL\nPrisma" }, { fill: "#ffffff", stroke: "#94a3b8", borderRadius: 16 }),
      mk("storage", { name: "Object storage", x: 784, y: 370, width: 150, height: 82, text: "Storage\nAssets" }, { fill: "#ffffff", stroke: "#94a3b8", borderRadius: 16 }),
      mk("text", { name: "Arrow 1", x: 314, y: 236, width: 54, height: 28, text: "->" }, { fill: "transparent", stroke: "transparent", fontSize: 24, fontWeight: 900 }),
      mk("text", { name: "Arrow 2", x: 550, y: 236, width: 54, height: 28, text: "->" }, { fill: "transparent", stroke: "transparent", fontSize: 24, fontWeight: 900 }),
      mk("text", { name: "Arrow 3", x: 650, y: 314, width: 54, height: 28, text: "|" }, { fill: "transparent", stroke: "transparent", fontSize: 24, fontWeight: 900 }),
      mk("card", { name: "Legend", x: 148, y: 522, width: 786, height: 70, text: "Legend: user traffic -> edge protection -> API -> async jobs -> data and assets" }, { fill: "#ffffff", stroke: "#e2e8f0", textColor: "#475569", borderRadius: 16, fontSize: 13 }),
    ];
  }

  return [
    mk("desktop", { name: "Dashboard frame", x: 92, y: 72, width: 930, height: 606, text: "" }, { fill: "#f8fafc", stroke: "#94a3b8", borderRadius: 20 }),
    mk("navbar", { name: "Sidebar", x: 124, y: 108, width: 190, height: 536, text: "MaketAR\n\nOverview\nAnalytics\nCustomers\nReports\nSettings" }, { fill: "#111827", stroke: "#111827", textColor: "#ffffff", borderRadius: 18, fontSize: 13, textAlign: "left" }),
    mk("text", { name: "Dashboard title", x: 350, y: 112, width: 310, height: 38, text: "Revenue overview" }, { fill: "transparent", stroke: "transparent", fontSize: 26, fontWeight: 900, textAlign: "left" }),
    mk("input", { name: "Search", x: 748, y: 112, width: 220, height: 40, text: "Search reports" }, { fill: "#ffffff", stroke: "#cbd5e1", borderRadius: 12, fontSize: 12, textAlign: "left" }),
    mk("card", { name: "Metric Revenue", x: 350, y: 184, width: 178, height: 112, text: "Revenue\n$84.2k\n+12.8%" }, { fill: "#ffffff", stroke: "#cbd5e1", borderRadius: 16, textAlign: "left" }),
    mk("card", { name: "Metric Customers", x: 552, y: 184, width: 178, height: 112, text: "Customers\n18,204\n+6.1%" }, { fill: "#ffffff", stroke: "#cbd5e1", borderRadius: 16, textAlign: "left" }),
    mk("card", { name: "Metric Conversion", x: 754, y: 184, width: 178, height: 112, text: "Conversion\n9.4%\n-1.2%" }, { fill: "#ffffff", stroke: "#cbd5e1", borderRadius: 16, textAlign: "left" }),
    mk("card", { name: "Chart panel", x: 350, y: 328, width: 380, height: 220, text: "Revenue trend\n\n▁▃▄▆▇▅▇▆" }, { fill: "#ffffff", stroke: "#cbd5e1", borderRadius: 18, fontSize: 20 }),
    mk("table", { name: "Activity table", x: 754, y: 328, width: 214, height: 220, text: "Top channels\n\nOrganic     42%\nReferral    28%\nPaid        19%\nDirect      11%" }, { fill: "#ffffff", stroke: "#cbd5e1", borderRadius: 18, fontSize: 13, textAlign: "left" }),
    mk("card", { name: "Footer insight", x: 350, y: 580, width: 618, height: 54, text: "Insight: Paid acquisition is down, but organic traffic is compounding week over week." }, { fill: "#ecfeff", stroke: "#67e8f9", textColor: "#155e75", borderRadius: 16, fontSize: 13 }),
  ];
};
