import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { ApiError } from "@/server/http/api-error";

type RouteHandler = (request: Request, context?: unknown) => Promise<Response>;

export function withRouteHandler(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: error.message, code: error.code, details: error.details },
          { status: error.status },
        );
      }

      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "Datos no validos.",
            code: "VALIDATION_ERROR",
            details: error.flatten(),
          },
          { status: 400 },
        );
      }

      console.error("[api]", error);
      return NextResponse.json(
        { error: "Error interno del servidor.", code: "INTERNAL_ERROR" },
        { status: 500 },
      );
    }
  };
}
