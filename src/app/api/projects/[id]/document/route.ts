import { NextResponse } from "next/server";
import { getProjectBundle, upsertProjectDocument } from "@/server/projects/project-repository";
import type { EditorDocument } from "@/types/project";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json() as { document?: EditorDocument };
  const bundle = await getProjectBundle(id);
  if (!bundle || !body.document) {
    return NextResponse.json({ error: "Proyecto o documento no valido." }, { status: 404 });
  }
  await upsertProjectDocument(id, bundle.project.name, body.document);
  return NextResponse.json({ ok: true });
}
