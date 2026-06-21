import { NextResponse } from "next/server";
import { createProjectBundle, listProjects } from "@/server/projects/project-repository";
import type { EditorDocument, MaketarProject } from "@/types/project";

export async function GET() {
  const projects = await listProjects();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const body = await request.json() as { project?: MaketarProject; document?: EditorDocument; name?: string };
  const project = body.project ?? {
    id: `project-${Date.now()}`,
    name: body.name ?? "Nuevo proyecto",
    kind: "mixed" as const,
    diagrams: 1,
    updatedAt: new Date().toISOString(),
  };
  const bundle = await createProjectBundle(project, body.document);
  return NextResponse.json(bundle, { status: 201 });
}
