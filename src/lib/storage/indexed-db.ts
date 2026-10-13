import type { EditorDocument, MaketarProject, StoredProjectBundle } from "@/types/project";

const dbName = "maketar-local";
const dbVersion = 1;
const projectsStore = "projects";
const documentsStore = "documents";
const metaStore = "meta";

type DocumentRecord = {
  projectId: string;
  document: EditorDocument;
  pendingSync?: boolean;
};

const isBrowser = () => typeof window !== "undefined" && "indexedDB" in window;

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (!isBrowser()) {
      reject(new Error("IndexedDB no esta disponible."));
      return;
    }
    const request = window.indexedDB.open(dbName, dbVersion);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(projectsStore)) {
        db.createObjectStore(projectsStore, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(documentsStore)) {
        db.createObjectStore(documentsStore, { keyPath: "projectId" });
      }
      if (!db.objectStoreNames.contains(metaStore)) {
        db.createObjectStore(metaStore, { keyPath: "key" });
      }
    };
    request.onerror = () => reject(request.error ?? new Error("No se pudo abrir IndexedDB."));
    request.onsuccess = () => resolve(request.result);
  });
}

function tx<T>(
  storeName: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
) {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const request = run(transaction.objectStore(storeName));
        request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
        request.onsuccess = () => resolve(request.result);
        transaction.oncomplete = () => db.close();
        transaction.onerror = () => {
          db.close();
          reject(transaction.error ?? new Error("IndexedDB transaction failed."));
        };
      }),
  );
}

export async function getLocalProjects() {
  return tx<MaketarProject[]>(projectsStore, "readonly", (store) => store.getAll());
}

export async function saveLocalProject(project: MaketarProject) {
  await tx<IDBValidKey>(projectsStore, "readwrite", (store) => store.put(project));
}

export async function deleteLocalProject(projectId: string) {
  await tx<undefined>(projectsStore, "readwrite", (store) => store.delete(projectId));
  await tx<undefined>(documentsStore, "readwrite", (store) => store.delete(projectId));
}

export async function markLocalProjectDeleted(projectId: string) {
  const deletedProjectIds = new Set(await getDeletedProjectIds());
  deletedProjectIds.add(projectId);
  await setMeta("deletedProjectIds", Array.from(deletedProjectIds));
}

export async function unmarkLocalProjectDeleted(projectId: string) {
  const deletedProjectIds = new Set(await getDeletedProjectIds());
  deletedProjectIds.delete(projectId);
  await setMeta("deletedProjectIds", Array.from(deletedProjectIds));
}

export async function getDeletedProjectIds() {
  const deletedProjectIds = await getMeta<string[]>("deletedProjectIds").catch(() => []);
  return Array.isArray(deletedProjectIds) ? deletedProjectIds : [];
}

export async function getLocalDocument(projectId: string) {
  const record = await tx<DocumentRecord | undefined>(documentsStore, "readonly", (store) => store.get(projectId));
  return record?.document;
}

export async function isLocalDocumentPending(projectId: string) {
  const record = await tx<DocumentRecord | undefined>(documentsStore, "readonly", (store) => store.get(projectId));
  return Boolean(record?.pendingSync);
}

export async function saveLocalDocument(projectId: string, document: EditorDocument, pendingSync = false) {
  await tx<IDBValidKey>(documentsStore, "readwrite", (store) =>
    store.put({ projectId, document: { ...document, updatedAt: document.updatedAt ?? new Date().toISOString() }, pendingSync }),
  );
}

export async function getLocalBundles(): Promise<StoredProjectBundle[]> {
  const [projects, db] = await Promise.all([getLocalProjects(), openDb()]);
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(documentsStore, "readonly");
      const store = transaction.objectStore(documentsStore);
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const documents = new Map(
          (request.result as DocumentRecord[]).map((record) => [record.projectId, record]),
        );
        resolve(projects.map((project) => ({ project, document: documents.get(project.id)?.document, pendingSync: documents.get(project.id)?.pendingSync })));
      };
    });
  } finally {
    db.close();
  }
}

async function getMeta<T>(key: string) {
  const record = await tx<{ key: string; value: T } | undefined>(metaStore, "readonly", (store) => store.get(key));
  return record?.value;
}

async function setMeta<T>(key: string, value: T) {
  await tx<IDBValidKey>(metaStore, "readwrite", (store) => store.put({ key, value }));
}

export async function migrateLegacyLocalStorage() {
  if (!isBrowser()) return false;
  const migrated = await getMeta<boolean>("legacyLocalStorageMigrated").catch(() => false);
  if (migrated) return false;
  const savedProjects = window.localStorage.getItem("maketar-projects");
  if (!savedProjects) {
    await setMeta("legacyLocalStorageMigrated", true);
    return false;
  }
  try {
    const projects = JSON.parse(savedProjects) as MaketarProject[];
    for (const project of projects) {
      await saveLocalProject({ ...project, kind: "mixed" });
      const savedDocument = window.localStorage.getItem(`maketar-editor-${project.id}`);
      if (savedDocument) {
        await saveLocalDocument(project.id, JSON.parse(savedDocument) as EditorDocument, true);
      }
    }
    await setMeta("legacyLocalStorageMigrated", true);
    return projects.length > 0;
  } catch {
    await setMeta("legacyLocalStorageMigrated", true);
    return false;
  }
}
