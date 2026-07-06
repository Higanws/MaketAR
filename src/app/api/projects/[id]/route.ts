import { NextResponse } from "next/server";

import { ApiError } from "@/server/http/api-error";
import { withRouteHandler } from "@/server/http/handle-route";
import { UpdateProjectBodySchema } from "@/server/schemas/project.schema";
import { deleteProject, getProjectBundle, updateProject } from "@/server/projects/project-repository";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = withRouteHandler(async (_request, context) => {
  const { id } = await (context as RouteContext).params;
  const bundle = await getProjectBundle(id);
  if (!bundle) {
    throw ApiError.notFound("Proyecto no encontrado.");
  }
  return NextResponse.json(bundle);
});

export const PATCH = withRouteHandler(async (request, context) => {
  const { id } = await (context as RouteContext).params;
  const body = UpdateProjectBodySchema.parse(await request.json());
  const project = await updateProject(id, body.project ?? {});
  if (!project) {
    throw ApiError.notFound("Proyecto no encontrado.");
  }
  return NextResponse.json({ project });
});

export const DELETE = withRouteHandler(async (_request, context) => {
  const { id } = await (context as RouteContext).params;
  await deleteProject(id);
  return NextResponse.json({ ok: true });
});
