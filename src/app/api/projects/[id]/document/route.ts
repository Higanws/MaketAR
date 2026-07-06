import { NextResponse } from "next/server";

import { ApiError } from "@/server/http/api-error";
import { withRouteHandler } from "@/server/http/handle-route";
import { getProjectBundle, upsertProjectDocument } from "@/server/projects/project-repository";
import { UpdateDocumentBodySchema } from "@/server/schemas/document.schema";
import type { EditorDocument } from "@/types/project";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const PATCH = withRouteHandler(async (request, context) => {
  const { id } = await (context as RouteContext).params;
  const body = UpdateDocumentBodySchema.parse(await request.json());
  const bundle = await getProjectBundle(id);
  if (!bundle) {
    throw ApiError.notFound("Proyecto no encontrado.");
  }
  const document = body.document as EditorDocument;
  await upsertProjectDocument(id, bundle.project.name, document);
  return NextResponse.json({ ok: true, document });
});
