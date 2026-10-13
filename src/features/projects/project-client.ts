import {
  deleteLocalProject,
  getDeletedProjectIds,
  getLocalBundles,
  getLocalDocument,
  getLocalProjects,
  isLocalDocumentPending,
  markLocalProjectDeleted,
  migrateLegacyLocalStorage,
  saveLocalDocument,
  saveLocalProject,
  unmarkLocalProjectDeleted,
} from "@/lib/storage/indexed-db";
import type { EditorDocument, MaketarProject } from "@/types/project";
import { parseApiResponse, ProjectClientError } from "@/features/projects/project-client-error";

export { ProjectClientError } from "@/features/projects/project-client-error";

type ApiProjectResponse = { projects: MaketarProject[] };
type ApiProjectOneResponse = { project: MaketarProject; document?: EditorDocument };

const jsonHeaders = { "Content-Type": "application/json" };
import { isLegacySeedProject } from "@/shared/config/legacy-seeds";

async function api<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, headers: { ...jsonHeaders, ...init?.headers } });
  return parseApiResponse<T>(response);
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
    await syncLocalPendingProjects();
    ({ projects } = await api<ApiProjectResponse>("/api/projects"));
    projects = projects.filter((project) => !deletedProjectIds.has(project.id) && !isLegacySeedProject(project));
    const merged = mergeProjects(localProjects, projects).filter((project) => !deletedProjectIds.has(project.id));
    await Promise.all(merged.map((project) => saveLocalProject(project)));
    return { projects: merged, online: true as const };
  } catch (error) {
    return { projects: localProjects.sort(byUpdatedAtDesc), ...syncFailure(error) };
  }
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
    return { project: result.project, online: true as const };
  } catch (error) {
    return { project, ...syncFailure(error) };
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
    return { project: result.project, online: true as const };
  } catch (error) {
    return { project, ...syncFailure(error) };
  }
}

export async function removeProject(projectId: string) {
  await markLocalProjectDeleted(projectId);
  await deleteLocalProject(projectId);
  try {
    await api(`/api/projects/${projectId}`, { method: "DELETE" });
    return { online: true as const };
  } catch (error) {
    return syncFailure(error);
  }
}

export async function loadProjectDocument(projectId: string) {
  const localDocument = await getLocalDocument(projectId).catch(() => undefined);
  const pendingSync = await isLocalDocumentPending(projectId).catch(() => false);
  try {
    const result = await api<ApiProjectOneResponse>(`/api/projects/${projectId}`);
    if (result.document && isRemoteNewer(result.document, localDocument, pendingSync)) {
      await saveLocalDocument(projectId, result.document, false);
      return { document: result.document, online: true as const };
    }
    if (localDocument) return { document: localDocument, online: true as const };
    return { document: result.document, online: true as const };
  } catch (error) {
    return { document: localDocument, ...syncFailure(error) };
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
    return { online: true as const };
  } catch (error) {
    return syncFailure(error);
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

function documentTime(value?: string) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isRemoteNewer(remote?: EditorDocument, local?: EditorDocument, pendingSync = false) {
  if (!remote) return false;
  if (!local) return true;
  const remoteTime = documentTime(remote.updatedAt);
  const localTime = documentTime(local.updatedAt);
  if (pendingSync && localTime >= remoteTime) return false;
  return remoteTime >= localTime;
}

function syncFailure(error: unknown) {
  if (error instanceof ProjectClientError) {
    return { online: false as const, error };
  }
  return { online: false as const, offline: true as const };
}
