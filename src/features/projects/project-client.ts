import {
  deleteLocalProject,
  getDeletedProjectIds,
  getLocalBundles,
  getLocalDocument,
  getLocalProjects,
  markLocalProjectDeleted,
  migrateLegacyLocalStorage,
  saveLocalDocument,
  saveLocalProject,
  unmarkLocalProjectDeleted,
} from "@/lib/storage/indexed-db";
import type { EditorDocument, MaketarProject } from "@/types/project";

type ApiProjectResponse = { projects: MaketarProject[] };
type ApiProjectOneResponse = { project: MaketarProject; document?: EditorDocument };

const jsonHeaders = { "Content-Type": "application/json" };
const legacySeedProjects = new Map([
  ["project-1", "Dashboard SaaS"],
  ["project-2", "Checkout Flow"],
  ["project-3", "Arquitectura App"],
]);

async function api<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, headers: { ...jsonHeaders, ...init?.headers } });
  if (!response.ok) throw new Error(`API ${response.status}`);
  return response.json() as Promise<T>;
}

const projectTime = (project: MaketarProject) => {
  const parsed = Date.parse(project.updatedAt);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const byUpdatedAtDesc = (a: MaketarProject, b: MaketarProject) => projectTime(b) - projectTime(a);

export async function loadProjects() {
  await migrateLegacyLocalStorage();
  const deletedProjectIds = new Set(await getDeletedProjectIds());
  const rawLocalProjects = await getLocalProjects().catch(() => []);
  await Promise.all(rawLocalProjects.filter(isLegacySeedProject).map((project) => deleteLocalProject(project.id)));
  const localProjects = rawLocalProjects.filter((project) => !deletedProjectIds.has(project.id) && !isLegacySeedProject(project));
  try {
    let { projects } = await api<ApiProjectResponse>("/api/projects");
    projects = projects.filter((project) => !deletedProjectIds.has(project.id) && !isLegacySeedProject(project));

    if (deletedProjectIds.size) {
      await Promise.allSettled(
        Array.from(deletedProjectIds).map((projectId) => api(`/api/projects/${projectId}`, { method: "DELETE" })),
      );
      ({ projects } = await api<ApiProjectResponse>("/api/projects"));
      projects = projects.filter((project) => !deletedProjectIds.has(project.id) && !isLegacySeedProject(project));
    }

    const remoteIds = new Set(projects.map((project) => project.id));
    const missingProjects = localProjects.filter((project) => !remoteIds.has(project.id));
    if (missingProjects.length) {
      await Promise.allSettled(
        missingProjects.map(async (project) =>
          api<ApiProjectOneResponse>("/api/projects", {
            method: "POST",
            body: JSON.stringify({ project, document: await getLocalDocument(project.id).catch(() => undefined) }),
          }),
        ),
      );
      ({ projects } = await api<ApiProjectResponse>("/api/projects"));
      projects = projects.filter((project) => !deletedProjectIds.has(project.id) && !isLegacySeedProject(project));
    }
    const merged = mergeProjects(localProjects, projects).filter((project) => !deletedProjectIds.has(project.id));
    await Promise.all(merged.map((project) => saveLocalProject(project)));
    return { projects: merged, online: true };
  } catch {
    return { projects: localProjects.sort(byUpdatedAtDesc), online: false };
  }
}

function isLegacySeedProject(project: MaketarProject) {
  return legacySeedProjects.get(project.id) === project.name;
}

export async function createProject(project: MaketarProject, document?: EditorDocument) {
  await unmarkLocalProjectDeleted(project.id);
  await saveLocalProject(project);
  if (document) await saveLocalDocument(project.id, document, true);
  try {
    const result = await api<ApiProjectOneResponse>("/api/projects", {
      method: "POST",
      body: JSON.stringify({ project, document }),
    });
    await saveLocalProject(result.project);
    if (result.document) await saveLocalDocument(result.project.id, result.document, false);
    return { project: result.project, online: true };
  } catch {
    return { project, online: false };
  }
}

export async function updateProject(project: MaketarProject) {
  await saveLocalProject(project);
  try {
    const result = await api<ApiProjectOneResponse>(`/api/projects/${project.id}`, {
      method: "PATCH",
      body: JSON.stringify({ project }),
    });
    await saveLocalProject(result.project);
    return { project: result.project, online: true };
  } catch {
    return { project, online: false };
  }
}

export async function removeProject(projectId: string) {
  await markLocalProjectDeleted(projectId);
  await deleteLocalProject(projectId);
  try {
    await api(`/api/projects/${projectId}`, { method: "DELETE" });
    return { online: true };
  } catch {
    return { online: false };
  }
}

export async function loadProjectDocument(projectId: string) {
  const localDocument = await getLocalDocument(projectId).catch(() => undefined);
  try {
    const result = await api<ApiProjectOneResponse>(`/api/projects/${projectId}`);
    if (result.document && isRemoteNewer(result.document, localDocument)) {
      await saveLocalDocument(projectId, result.document, false);
      return { document: result.document, online: true };
    }
    if (localDocument) return { document: localDocument, online: true };
    return { document: result.document, online: true };
  } catch {
    return { document: localDocument, online: false };
  }
}

export async function saveProjectDocument(projectId: string, document: EditorDocument) {
  const nextDocument = { ...document, updatedAt: new Date().toISOString() };
  await saveLocalDocument(projectId, nextDocument, true);
  try {
    await api(`/api/projects/${projectId}/document`, {
      method: "PATCH",
      body: JSON.stringify({ document: nextDocument }),
    });
    await saveLocalDocument(projectId, nextDocument, false);
    return { online: true };
  } catch {
    return { online: false };
  }
}

export async function syncLocalPendingProjects() {
  const bundles = await getLocalBundles().catch(() => []);
  for (const bundle of bundles) {
    if (!bundle.pendingSync) continue;
    await createProject(bundle.project, bundle.document).catch(() => undefined);
  }
}

function mergeProjects(local: MaketarProject[], remote: MaketarProject[]) {
  const byId = new Map<string, MaketarProject>();
  for (const project of [...local, ...remote]) {
    const current = byId.get(project.id);
    if (!current || projectTime(project) >= projectTime(current)) {
      byId.set(project.id, project);
    }
  }
  return Array.from(byId.values()).sort(byUpdatedAtDesc);
}

function isRemoteNewer(remote?: EditorDocument, local?: EditorDocument) {
  if (!remote) return false;
  if (!local) return true;
  return Date.parse(remote.updatedAt ?? "0") >= Date.parse(local.updatedAt ?? "0");
}
