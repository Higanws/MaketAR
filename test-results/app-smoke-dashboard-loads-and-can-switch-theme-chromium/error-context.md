# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app-smoke.spec.ts >> dashboard loads and can switch theme
- Location: tests/e2e/app-smoke.spec.ts:27:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /oscuro|dark/i })

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - complementary [ref=e4]:
        - generic [ref=e5]:
          - img "MaketAR" [ref=e6]
          - generic [ref=e7]:
            - heading "MaketAR" [level=1] [ref=e8]
            - paragraph [ref=e9]: Wireframes y diagramas
        - generic [ref=e10]:
          - button "Nuevo proyecto" [ref=e11]:
            - img [ref=e12]
            - text: Nuevo proyecto
          - button "Importar JSON" [ref=e15]:
            - img [ref=e16]
            - text: Importar JSON
        - navigation [ref=e19]:
          - button "Proyectos" [ref=e20]
          - button "Templates" [ref=e21]
          - button "Recientes" [ref=e22]
      - generic [ref=e23]:
        - generic [ref=e24]:
          - generic [ref=e25]:
            - heading "Mis proyectos" [level=2] [ref=e26]
            - paragraph [ref=e27]: Crea maquetas en alta, wireframes simples y flujos.
          - generic [ref=e28]:
            - img [ref=e29]
            - textbox [ref=e32]:
              - /placeholder: Buscar proyecto
        - generic [ref=e34]:
          - button "Proyecto Demo 2 archivo(s) · Actualizado 20 jun 2026, 20:04" [ref=e35]:
            - generic [ref=e36]:
              - button "Renombrar proyecto" [ref=e37]:
                - img [ref=e38]
              - button "Eliminar proyecto" [ref=e40]:
                - img [ref=e41]
            - generic [ref=e52]:
              - heading "Proyecto Demo" [level=3] [ref=e53]
              - paragraph [ref=e54]: 2 archivo(s) · Actualizado 20 jun 2026, 20:04
          - button "Flujo de Prueba 1 archivo(s) · Actualizado 19 jun 2026, 15:10" [ref=e55]:
            - generic [ref=e56]:
              - button "Renombrar proyecto" [ref=e57]:
                - img [ref=e58]
              - button "Eliminar proyecto" [ref=e60]:
                - img [ref=e61]
            - generic [ref=e72]:
              - heading "Flujo de Prueba" [level=3] [ref=e73]
              - paragraph [ref=e74]: 1 archivo(s) · Actualizado 19 jun 2026, 15:10
          - button "Arquitectura App 3 archivo(s) · Actualizado 18 jun 2026, 11:30" [ref=e75]:
            - generic [ref=e76]:
              - button "Renombrar proyecto" [ref=e77]:
                - img [ref=e78]
              - button "Eliminar proyecto" [ref=e80]:
                - img [ref=e81]
            - generic [ref=e92]:
              - heading "Arquitectura App" [level=3] [ref=e93]
              - paragraph [ref=e94]: 3 archivo(s) · Actualizado 18 jun 2026, 11:30
    - button "Acerca de y configuracion" [ref=e96]:
      - img [ref=e97]
  - generic [active]:
    - menu "Next.js Dev Tools Items" [ref=e100]:
      - generic [ref=e101]:
        - menuitem "Route Static" [ref=e102] [cursor=pointer]:
          - generic [ref=e103]: Route
          - generic [ref=e104]: Static
        - generic "Turbopack is enabled." [ref=e105]:
          - generic [ref=e106]: Bundler
          - generic [ref=e107]: Turbopack
        - menuitem "Route Info" [ref=e108]:
          - generic [ref=e109]: Route Info
          - img [ref=e111]
      - menuitem "Preferences" [ref=e114]:
        - generic [ref=e115]: Preferences
        - img [ref=e117]
    - button "Close Next.js Dev Tools" [expanded] [ref=e124] [cursor=pointer]:
      - img [ref=e125]
  - alert [ref=e128]
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
> 32 |   await page.getByRole("button", { name: /oscuro|dark/i }).click();
     |                                                            ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  51 |   await expect(page.getByText("Nodos, conectores y flechas")).toBeVisible();
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