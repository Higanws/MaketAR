import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") ?? undefined;
  const diagrams = await prisma.diagram.findMany({
    where: projectId ? { projectId } : undefined,
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ diagrams });
}

export async function POST(request: Request) {
  const body = await request.json() as {
    projectId?: string;
    name?: string;
    canvasJson?: Prisma.InputJsonValue;
    viewportJson?: Prisma.InputJsonValue;
  };
  if (!body.projectId) {
    return NextResponse.json({ error: "projectId es requerido." }, { status: 400 });
  }
  const diagram = await prisma.diagram.create({
    data: {
      projectId: body.projectId,
      name: body.name ?? "Documento",
      type: "MIXED",
      canvasJson: body.canvasJson ?? {},
      viewportJson: body.viewportJson ?? {},
    },
  });
  return NextResponse.json({ diagram }, { status: 201 });
}
