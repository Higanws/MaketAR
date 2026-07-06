import { prisma } from "@/server/db/prisma";
import { ApiError } from "@/server/http/api-error";
import { upsertProjectDocument } from "@/server/projects/project-document";
import { getLocalUser, purgeLegacySeedProjects } from "@/server/projects/local-user";
import { diagramToDocument, toClientProject } from "@/server/projects/project-mapper";
import type { EditorDocument, MaketarProject } from "@/types/project";

export function createDefaultProject(name: string): MaketarProject {
  return {
    id: `project-${Date.now()}`,
    name,
    kind: "mixed",
    diagrams: 1,
    updatedAt: new Date().toISOString(),
  };
}

export async function listProjects() {
  const user = await getLocalUser();
  await purgeLegacySeedProjects(user.id);
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
  const result = await prisma.project.deleteMany({ where: { id: projectId, userId: user.id } });
  if (result.count === 0) {
    throw ApiError.notFound("Proyecto no encontrado.");
  }
}

export { upsertProjectDocument };
