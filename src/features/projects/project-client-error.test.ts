import { describe, expect, it } from "vitest";

import { parseApiResponse, ProjectClientError } from "@/features/projects/project-client-error";

describe("parseApiResponse", () => {
  it("returns json on success", async () => {
    const response = new Response(JSON.stringify({ ok: true }), { status: 200 });
    await expect(parseApiResponse<{ ok: boolean }>(response)).resolves.toEqual({ ok: true });
  });

  it("throws ProjectClientError for not found", async () => {
    const response = new Response(JSON.stringify({ error: "Proyecto no encontrado.", code: "NOT_FOUND" }), {
      status: 404,
    });
    await expect(parseApiResponse(response)).rejects.toEqual(
      new ProjectClientError(404, "NOT_FOUND", "Proyecto no encontrado."),
    );
  });

  it("throws ProjectClientError for server errors", async () => {
    const response = new Response(JSON.stringify({ error: "Error interno del servidor.", code: "INTERNAL_ERROR" }), {
      status: 500,
    });
    await expect(parseApiResponse(response)).rejects.toMatchObject({
      status: 500,
      code: "INTERNAL_ERROR",
    });
  });
});
