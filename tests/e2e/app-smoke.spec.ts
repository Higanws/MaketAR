import { expect, test } from "@playwright/test";

const defaultProjects = [
  { id: "project-e2e-1", name: "Proyecto Demo", kind: "mixed", updatedAt: "2026-06-20T23:04:47.852Z", diagrams: 2 },
  { id: "project-e2e-2", name: "Flujo de Prueba", kind: "mixed", updatedAt: "2026-06-19T18:10:00.000Z", diagrams: 1 },
  { id: "project-e2e-3", name: "Arquitectura App", kind: "mixed", updatedAt: "2026-06-18T14:30:00.000Z", diagrams: 3 },
];

const demoFlowDocument = {
  version: 5,
  pages: [{ id: "page-e2e-1", name: "Demo", shapes: [] }],
  currentPageId: "page-e2e-1",
  mode: "wireframe",
  zoom: 1,
  showGrid: true,
  snapToGrid: true,
  gridSize: 24,
  diagramNodes: [
    { id: "start", type: "maketarFlow", position: { x: 80, y: 140 }, style: { width: 176, height: 80 }, data: { label: "Inicio", variant: "start" } },
    { id: "process", type: "maketarFlow", position: { x: 330, y: 130 }, style: { width: 176, height: 80 }, data: { label: "Proceso", variant: "process" } },
    { id: "decision", type: "maketarFlow", position: { x: 610, y: 120 }, style: { width: 150, height: 150 }, data: { label: "Decision", variant: "decision" } },
    { id: "end", type: "maketarFlow", position: { x: 900, y: 140 }, style: { width: 176, height: 80 }, data: { label: "Fin", variant: "start" } },
  ],
  diagramEdges: [],
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/projects", async (route, request) => {
    if (request.method() === "GET") {
      await route.fulfill({ json: { projects: defaultProjects } });
      return;
    }
    await route.fallback();
  });

  await page.route("**/api/projects/project-e2e-1", async (route, request) => {
    if (request.method() === "GET") {
      await route.fulfill({ json: { project: defaultProjects[0], document: demoFlowDocument } });
      return;
    }
    await route.fallback();
  });
});

test("dashboard loads and can switch theme", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("maketar-theme", "dark");
  });
  await page.goto("/");
  await expect(page.getByText("MaketAR")).toBeVisible();
  await expect(page.getByText("Wireframes y diagramas")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("editor opens a project and exposes export dialog", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Proyecto Demo").first().click();
  await expect(page.getByRole("button", { name: /guardar/i })).toBeVisible();
  await page.getByRole("button", { name: /exportar/i }).click();
  await page.getByText("JSON").click();
  await expect(page.getByText(/Exportar JSON/i)).toBeVisible();
});

test("editor switches between wireframe and flow without crashing", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Proyecto Demo").first().click();
  await expect(page.getByRole("button", { name: /guardar/i })).toBeVisible();

  await page.getByRole("button", { name: "Flujo" }).click();
  await expect(page.getByText("Nodos, conectores y flechas")).toBeVisible();
  await expect(page.getByText("Inicio / Fin")).toBeVisible();
  await expect(page.getByText("Propiedades")).toBeVisible();
  await expect.poll(async () =>
    page.locator(".react-flow__handle[data-handleid$='-source']").count(),
  ).toBeGreaterThan(3);
  await expect.poll(async () =>
    page.locator(".react-flow__handle[data-handleid$='-target']").count(),
  ).toBe(0);
  await expect(page.getByText("This page couldn’t load")).toHaveCount(0);

  await page.getByRole("button", { name: "Wireframe" }).click();
  await expect(page.getByText("Componentes, paginas e iconos")).toBeVisible();
  await expect(page.getByText("Basicas")).toBeVisible();
});

test("core editor controls are reachable", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Proyecto Demo").first().click();
  await expect(page.getByRole("button", { name: /guardar/i })).toBeVisible();

  await page.getByRole("button", { name: "Snap" }).click();
  await expect(page.getByRole("button", { name: "Snap" })).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Grid" }).click();
  await expect(page.getByRole("button", { name: "Grid" })).toHaveAttribute("aria-pressed", "false");

  await page.getByRole("button", { name: "Iconos" }).click();
  await expect(page.getByLabel("Paquete")).toBeVisible();
  await page.getByRole("button", { name: "Paginas" }).click();
  await expect(page.getByRole("button", { name: "Pagina", exact: true })).toBeVisible();
});

test("captures basic light and dark dashboard screenshots", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("MaketAR")).toBeVisible();
  await expect(page.locator("main")).toHaveScreenshot("dashboard-light.png", {
    animations: "disabled",
  });
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
    window.localStorage.setItem("maketar-theme", "dark");
  });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("main")).toHaveScreenshot("dashboard-dark.png", {
    animations: "disabled",
  });
});
