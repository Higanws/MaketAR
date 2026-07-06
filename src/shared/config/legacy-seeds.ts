export const legacySeedProjects = [
  { id: "project-1", name: "Dashboard SaaS" },
  { id: "project-2", name: "Checkout Flow" },
  { id: "project-3", name: "Arquitectura App" },
];

const legacySeedProjectMap = new Map(
  legacySeedProjects.map((project) => [project.id, project.name]),
);

export function isLegacySeedProject(project: { id: string; name: string }) {
  return legacySeedProjectMap.get(project.id) === project.name;
}
