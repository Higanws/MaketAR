import { expect, test } from "@playwright/test";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const appUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test.describe("API projects integration", () => {
  test.skip(!hasDatabase, "Requiere DATABASE_URL y servidor con PostgreSQL");

  test("creates and deletes a project through the API", async ({ request }) => {
    const projectId = `project-e2e-api-${Date.now()}`;
    const createResponse = await request.post(`${appUrl}/api/projects`, {
      data: {
        project: {
          id: projectId,
          name: "API Integration Test",
          kind: "mixed",
          updatedAt: new Date().toISOString(),
          diagrams: 1,
        },
        document: {
          version: 5,
          pages: [{ id: "page-1", name: "Main", shapes: [] }],
          currentPageId: "page-1",
          mode: "wireframe",
          zoom: 1,
          showGrid: true,
          snapToGrid: true,
          gridSize: 24,
          diagramNodes: [],
          diagramEdges: [],
        },
      },
    });

    expect(createResponse.ok()).toBeTruthy();
    const created = await createResponse.json();
    expect(created.project.id).toBe(projectId);

    const getResponse = await request.get(`${appUrl}/api/projects/${projectId}`);
    expect(getResponse.ok()).toBeTruthy();

    const deleteResponse = await request.delete(`${appUrl}/api/projects/${projectId}`);
    expect(deleteResponse.ok()).toBeTruthy();

    const missingResponse = await request.get(`${appUrl}/api/projects/${projectId}`);
    expect(missingResponse.status()).toBe(404);
  });
});
