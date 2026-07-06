// @vitest-environment node
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import { ApiError } from "@/server/http/api-error";
import { withRouteHandler } from "@/server/http/handle-route";

describe("withRouteHandler", () => {
  it("returns handler response on success", async () => {
    const handler = withRouteHandler(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const response = await handler(new Request("http://localhost"));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("maps ApiError to json response", async () => {
    const handler = withRouteHandler(async () => {
      throw ApiError.notFound("Proyecto no encontrado.");
    });
    const response = await handler(new Request("http://localhost"));
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Proyecto no encontrado.",
      code: "NOT_FOUND",
      details: undefined,
    });
  });

  it("maps ZodError to validation response", async () => {
    const handler = withRouteHandler(async () => {
      throw new ZodError([]);
    });
    const response = await handler(new Request("http://localhost"));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  it("maps unknown errors to 500", async () => {
    const handler = withRouteHandler(async () => {
      throw new Error("boom");
    });
    const response = await handler(new Request("http://localhost"));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Error interno del servidor.",
      code: "INTERNAL_ERROR",
    });
  });
});
