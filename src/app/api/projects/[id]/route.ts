import { NextResponse } from "next/server";
import { deleteProject, getProjectBundle, updateProject } from "@/server/projects/project-repository";
import type { MaketarProject } from "@/types/project";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const bundle = await getProjectBundle(id);
  if (!bundle) {
    return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
  }
  return NextResponse.json(bundle);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json() as { project?: Partial<MaketarProject> };
  const project = await updateProject(id, body.project ?? {});
  if (!project) {
    return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
  }
  return NextResponse.json({ project });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  await deleteProject(id);
  return NextResponse.json({ ok: true });
}
