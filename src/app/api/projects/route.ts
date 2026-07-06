import { NextResponse } from "next/server";

import { withRouteHandler } from "@/server/http/handle-route";
import { EditorDocumentSchema } from "@/server/schemas/document.schema";
import { CreateProjectBodySchema } from "@/server/schemas/project.schema";
import { createDefaultProject, createProjectBundle, listProjects } from "@/server/projects/project-repository";
import type { EditorDocument } from "@/types/project";

export const GET = withRouteHandler(async () => {
  const projects = await listProjects();
  return NextResponse.json({ projects });
});

export const POST = withRouteHandler(async (request) => {
  const body = CreateProjectBodySchema.parse(await request.json());
  const project = body.project ?? createDefaultProject(body.name ?? "Nuevo proyecto");
  const document = body.document ? EditorDocumentSchema.parse(body.document) as EditorDocument : undefined;
  const bundle = await createProjectBundle(project, document);
  return NextResponse.json(bundle, { status: 201 });
});
