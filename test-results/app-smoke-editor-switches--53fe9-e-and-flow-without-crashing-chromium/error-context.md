# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app-smoke.spec.ts >> editor switches between wireframe and flow without crashing
- Location: tests/e2e/app-smoke.spec.ts:45:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Nodos, conectores y flechas')
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByText('Nodos, conectores y flechas')

```

```yaml
- img
- heading "This page couldn’t load" [level=1]
- paragraph: Reload to try again, or go back.
- button "Reload"
- button "Back"
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | const defaultProjects = [
  4  |   { id: "project-e2e-1", name: "Proyecto Demo", kind: "mixed", updatedAt: "2026-06-20T23:04:47.852Z", diagrams: 2 },
  5  |   { id: "project-e2e-2", name: "Flujo de Prueba", kind: "mixed", updatedAt: "2026-06-19T18:10:00.000Z", diagrams: 1 },
  6  |   { id: "project-e2e-3", name: "Arquitectura App", kind: "mixed", updatedAt: "2026-06-18T14:30:00.000Z", diagrams: 3 },
  7  | ];
  8  | 
  9  | test.beforeEach(async ({ page }) => {
  10 |   await page.route("**/api/projects", async (route, request) => {
  11 |     if (request.method() === "GET") {
  12 |       await route.fulfill({ json: { projects: defaultProjects } });
  13 |       return;
  14 |     }
  15 |     await route.fallback();
  16 |   });
  17 | 
  18 |   await page.route("**/api/projects/project-e2e-1", async (route, request) => {
  19 |     if (request.method() === "GET") {
  20 |       await route.fulfill({ json: { project: defaultProjects[0] } });
  21 |       return;
  22 |     }
  23 |     await route.fallback();
  24 |   });
  25 | });
  26 | 
  27 | test("dashboard loads and can switch theme", async ({ page }) => {
  28 |   await page.goto("/");
  29 |   await expect(page.getByText("MaketAR")).toBeVisible();
  30 |   await expect(page.getByText("Wireframes y diagramas")).toBeVisible();
  31 |   await page.getByRole("button", { name: /ajustes|configuracion|settings/i }).click({ force: true });
  32 |   await page.getByRole("button", { name: /oscuro|dark/i }).click();
  33 |   await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  34 | });
  35 | 
  36 | test("editor opens a project and exposes export dialog", async ({ page }) => {
  37 |   await page.goto("/");
  38 |   await page.getByText("Proyecto Demo").first().click();
  39 |   await expect(page.getByRole("button", { name: /guardar/i })).toBeVisible();
  40 |   await page.getByRole("button", { name: /exportar/i }).click();
  41 |   await page.getByText("JSON").click();
  42 |   await expect(page.getByText(/Exportar JSON/i)).toBeVisible();
  43 | });
  44 | 
  45 | test("editor switches between wireframe and flow without crashing", async ({ page }) => {
  46 |   await page.goto("/");
  47 |   await page.getByText("Proyecto Demo").first().click();
  48 |   await expect(page.getByRole("button", { name: /guardar/i })).toBeVisible();
  49 | 
  50 |   await page.getByRole("button", { name: "Flujo" }).click();
> 51 |   await expect(page.getByText("Nodos, conectores y flechas")).toBeVisible();
     |                                                               ^ Error: expect(locator).toBeVisible() failed
  52 |   await expect(page.getByText("Inicio / Fin")).toBeVisible();
  53 |   await expect(page.getByText("Propiedades")).toBeVisible();
  54 |   await expect.poll(async () =>
  55 |     page.locator(".react-flow__handle[data-handleid$='-source']").count(),
  56 |   ).toBeGreaterThan(3);
  57 |   await expect.poll(async () =>
  58 |     page.locator(".react-flow__handle[data-handleid$='-target']").count(),
  59 |   ).toBeGreaterThan(3);
  60 |   await expect(page.getByText("This page couldn’t load")).toHaveCount(0);
  61 | 
  62 |   await page.getByRole("button", { name: "Wireframe" }).click();
  63 |   await expect(page.getByText("Componentes, paginas e iconos")).toBeVisible();
  64 |   await expect(page.getByText("Basicas")).toBeVisible();
  65 | });
  66 | 
  67 | test("core editor controls are reachable", async ({ page }) => {
  68 |   await page.goto("/");
  69 |   await page.getByText("Proyecto Demo").first().click();
  70 |   await expect(page.getByRole("button", { name: /guardar/i })).toBeVisible();
  71 | 
  72 |   await page.getByRole("button", { name: "Snap" }).click();
  73 |   await expect(page.getByRole("button", { name: "Snap" })).toHaveAttribute("aria-pressed", "false");
  74 |   await page.getByRole("button", { name: "Grid" }).click();
  75 |   await expect(page.getByRole("button", { name: "Grid" })).toHaveAttribute("aria-pressed", "false");
  76 | 
  77 |   await page.getByRole("button", { name: "Iconos" }).click();
  78 |   await expect(page.getByLabel("Paquete")).toBeVisible();
  79 |   await page.getByRole("button", { name: "Paginas" }).click();
  80 |   await expect(page.getByRole("button", { name: "Pagina", exact: true })).toBeVisible();
  81 | });
  82 | 
  83 | test("captures basic light and dark dashboard screenshots", async ({ page }) => {
  84 |   await page.goto("/");
  85 |   await expect(page.getByText("MaketAR")).toBeVisible();
  86 |   await expect(page.locator("main")).toHaveScreenshot("dashboard-light.png", {
  87 |     animations: "disabled",
  88 |   });
  89 |   await page.evaluate(() => {
  90 |     document.documentElement.dataset.theme = "dark";
  91 |     window.localStorage.setItem("maketar-theme", "dark");
  92 |   });
  93 |   await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  94 |   await expect(page.locator("main")).toHaveScreenshot("dashboard-dark.png", {
  95 |     animations: "disabled",
  96 |   });
  97 | });
  98 | 
```