import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { EditorDocument, MaketarProject } from "@/types/project";

const localUserEmail = "local@maketar.app";
const legacySeedProjects = [
  { id: "project-1", name: "Dashboard SaaS" },
  { id: "project-2", name: "Checkout Flow" },
  { id: "project-3", name: "Arquitectura App" },
];

async function getLocalUser() {
  return prisma.user.upsert({
    where: { email: localUserEmail },
    update: {},
    create: { email: localUserEmail },
  });
}

export async function listProjects() {
  const user = await getLocalUser();
  await prisma.project.deleteMany({
    where: {
      userId: user.id,
      OR: legacySeedProjects,
    },
  });
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: { diagrams: true },
    orderBy: { updatedAt: "desc" },
  });
  return projects.map((project) => toClientProject(project));
}

export async function getProjectBundle(projectId: string) {
  const user = await getLocalUser();
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: user.id },
    include: { diagrams: { orderBy: { updatedAt: "desc" }, take: 1 } },
  });
  if (!project) return null;
  const diagram = project.diagrams[0];
  return {
    project: toClientProject(project),
    document: diagram ? diagramToDocument(diagram) : undefined,
  };
}

export async function createProjectBundle(project: MaketarProject, document?: EditorDocument) {
  const user = await getLocalUser();
  const savedProject = await prisma.project.upsert({
    where: { id: project.id },
    update: {
      name: project.name,
      kind: project.kind,
      template: project.template ?? null,
      flowTemplate: project.flowTemplate ?? null,
    },
    create: {
      id: project.id,
      name: project.name,
      kind: project.kind,
      template: project.template ?? null,
      flowTemplate: project.flowTemplate ?? null,
      userId: user.id,
    },
    include: { diagrams: true },
  });

  if (document) {
    await upsertProjectDocument(savedProject.id, project.name, document);
  }

  return getProjectBundle(savedProject.id);
}

export async function updateProject(projectId: string, project: Partial<MaketarProject>) {
  const user = await getLocalUser();
  const existing = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
  if (!existing) return null;
  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: project.name,
      kind: project.kind,
      template: project.template ?? undefined,
      flowTemplate: project.flowTemplate ?? undefined,
    },
    include: { diagrams: true },
  });
  return toClientProject(updated);
}

export async function deleteProject(projectId: string) {
  const user = await getLocalUser();
  await prisma.project.deleteMany({ where: { id: projectId, userId: user.id } });
}

export async function upsertProjectDocument(projectId: string, name: string, document: EditorDocument) {
  const existing = await prisma.diagram.findFirst({ where: { projectId }, orderBy: { updatedAt: "desc" } });
  const canvasJson = {
    pages: document.pages,
    diagramNodes: document.diagramNodes,
    diagramEdges: document.diagramEdges,
    updatedAt: document.updatedAt ?? new Date().toISOString(),
  } as Prisma.InputJsonObject;
  const viewportJson = {
    currentPageId: document.currentPageId,
    mode: document.mode,
    zoom: document.zoom,
    showGrid: document.showGrid,
    snapToGrid: document.snapToGrid,
    gridSize: document.gridSize,
  } as Prisma.InputJsonObject;

  if (existing) {
    await prisma.diagram.update({
      where: { id: existing.id },
      data: {
        name,
        type: "MIXED",
        canvasJson,
        viewportJson,
      },
    });
    return;
  }

  await prisma.diagram.create({
    data: {
      projectId,
      name,
      type: "MIXED",
      canvasJson,
      viewportJson,
    },
  });
}

type ProjectWithDiagrams = Prisma.ProjectGetPayload<{ include: { diagrams: true } }>;
type DiagramRecord = Prisma.DiagramGetPayload<Record<string, never>>;

function toClientProject(project: ProjectWithDiagrams): MaketarProject {
  return {
    id: project.id,
    name: project.name,
    kind: "mixed",
    template: project.template as MaketarProject["template"],
    flowTemplate: project.flowTemplate as MaketarProject["flowTemplate"],
    updatedAt: project.updatedAt.toISOString(),
    diagrams: Math.max(project.diagrams.length, 1),
  };
}

function diagramToDocument(diagram: DiagramRecord): EditorDocument {
  const canvas = diagram.canvasJson as Record<string, unknown>;
  const viewport = (diagram.viewportJson ?? {}) as Record<string, unknown>;
  return {
    version: 5,
    pages: Array.isArray(canvas.pages) ? canvas.pages as EditorDocument["pages"] : [],
    currentPageId: typeof viewport.currentPageId === "string" ? viewport.currentPageId : "",
    mode: viewport.mode === "diagram" ? "diagram" : "wireframe",
    zoom: typeof viewport.zoom === "number" ? viewport.zoom : 1,
    showGrid: typeof viewport.showGrid === "boolean" ? viewport.showGrid : true,
    snapToGrid: typeof viewport.snapToGrid === "boolean" ? viewport.snapToGrid : true,
    gridSize: typeof viewport.gridSize === "number" ? viewport.gridSize : 24,
    diagramNodes: Array.isArray(canvas.diagramNodes) ? canvas.diagramNodes : [],
    diagramEdges: Array.isArray(canvas.diagramEdges) ? canvas.diagramEdges : [],
    updatedAt: typeof canvas.updatedAt === "string" ? canvas.updatedAt : diagram.updatedAt.toISOString(),
  };
}
