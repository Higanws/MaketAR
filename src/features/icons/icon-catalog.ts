import type { ElementType } from "react";
import * as TablerIcons from "react-icons/tb";

import { cloudIconCatalog } from "@/lib/cloud-icon-catalog";

export type CustomIcon = {
  id: string;
  name: string;
  packageName: string;
  svgSrc: string;
};

export type IconComponent = ElementType<{ size?: number; strokeWidth?: number; className?: string }>;
export type IconCatalogItem = {
  name: string;
  label: string;
  set: string;
  icon?: IconComponent;
  svgSrc?: string;
};

const iconModules: Array<{ source: string; module: Record<string, unknown>; prefix: string }> = [
  { source: "Tabler Icons", module: TablerIcons, prefix: "Tb" },
];

const iconNameBlocklist = new Set([
  "createLucideIcon",
  "default",
  "icons",
  "Icon",
  "LucideIcon",
  "LucideProps",
]);

const formatIconLabel = (name: string, prefix?: string) => {
  const withoutPrefix = prefix && name.startsWith(prefix) ? name.slice(prefix.length) : name.replace(/Icon$/, "");
  return withoutPrefix
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/\bSvg\b/g, "SVG")
    .trim();
};

const isIconComponent = (icon: unknown) =>
  typeof icon === "function" ||
  (typeof icon === "object" && icon !== null && "$$typeof" in icon);

const canonicalIconLabel = (label: string) =>
  label
    .replace(/\s+(Filled|Off|Alternate)$/i, "")
    .replace(/\s+\d+$/i, "")
    .trim()
    .toLowerCase();

const isPreferredLineIcon = (name: string, label: string) =>
  !/(Filled|Off)$/.test(name) && !/\s(Filled|Off)$/i.test(label);

const devIconPackages: Array<{ name: string; terms: string[]; exactNames?: string[] }> = [
  {
    name: "UX y wireframes",
    terms: [],
    exactNames: [
      "TbLayout",
      "TbLayoutNavbar",
      "TbLayoutSidebar",
      "TbLayoutDashboard",
      "TbLayoutGrid",
      "TbLayoutList",
      "TbLayoutKanban",
      "TbComponents",
      "TbForms",
      "TbInputSearch",
      "TbInputCheck",
      "TbTable",
      "TbTablePlus",
      "TbAppWindow",
      "TbBrowser",
      "TbDeviceDesktop",
      "TbDeviceMobile",
      "TbDeviceTablet",
      "TbClick",
      "TbPointer",
      "TbCursorText",
      "TbTypography",
      "TbTextSize",
      "TbPalette",
      "TbRuler",
      "TbRulerMeasure",
      "TbSpacingHorizontal",
      "TbSpacingVertical",
      "TbColumns",
      "TbLayoutRows",
      "TbFocus",
      "TbTemplate",
      "TbFrame",
      "TbVectorBezier",
      "TbBoxModel",
      "TbCheckbox",
      "TbToggleLeft",
      "TbCards",
      "TbPhoto",
      "TbIcons",
      "TbMessageCircle",
      "TbUser",
      "TbUsers",
      "TbUserScreen",
    ],
  },
  {
    name: "Diagramas de flujo",
    terms: [],
    exactNames: [
      "TbRoute",
      "TbRoute2",
      "TbRouteAltRight",
      "TbRouteSquare",
      "TbArrowsRightLeft",
      "TbArrowRight",
      "TbArrowDown",
      "TbArrowBigRight",
      "TbCornerDownRight",
      "TbGitBranch",
      "TbSitemap",
      "TbHierarchy",
      "TbHierarchy2",
      "TbHierarchy3",
      "TbTopologyFullHierarchy",
      "TbAffiliate",
      "TbNetwork",
      "TbSubtask",
      "TbChecklist",
      "TbListTree",
      "TbTimeline",
      "TbTimelineEvent",
      "TbDiamond",
      "TbSquare",
      "TbCircle",
      "TbTriangle",
      "TbHexagon",
      "TbDatabase",
      "TbCloud",
      "TbServer",
      "TbApi",
      "TbWebhook",
      "TbPlugConnected",
      "TbChartArrows",
      "TbChartDots",
      "TbChartInfographic",
    ],
  },
  {
    name: "Cloud y DevOps",
    terms: [
      "amazon", "aws", "azure", "googlecloud", "gcp", "cloudflare", "docker", "kubernetes",
      "terraform", "jenkins", "githubactions", "gitlab", "vercel", "netlify", "firebase",
      "supabase", "nginx", "linux", "ubuntu", "debian", "alpine", "redhat", "server",
      "container", "brandaws", "brandazure", "brandcloudflare", "branddocker",
    ],
  },
  {
    name: "Bases de datos",
    terms: [
      "database", "postgres", "postgresql", "mysql", "mariadb", "mongodb", "mongoose",
      "redis", "sqlite", "cassandra", "elastic", "elasticsearch", "dynamo", "dynamodb",
      "supabase", "firebase", "prisma", "graphql", "neo4j", "influx", "cockroach",
    ],
  },
  {
    name: "Lenguajes y frameworks",
    terms: [
      "javascript", "typescript", "react", "next", "node", "nodedotjs", "python", "java",
      "go", "golang", "rust", "php", "laravel", "vue", "angular", "svelte", "astro",
      "nestjs", "express", "graphql", "tailwind", "vite", "webpack", "html", "css",
      "sass", "spring", "django", "flask", "fastapi",
    ],
  },
  {
    name: "Herramientas dev",
    terms: [
      "git", "github", "gitlab", "bitbucket", "npm", "yarn", "pnpm", "bun", "deno",
      "vscode", "visualstudio", "terminal", "console", "code", "api", "webhook",
      "eslint", "prettier", "storybook", "figma", "postman", "swagger", "openapi",
      "jira", "notion", "slack", "obsidian", "package", "filecode",
    ],
  },
  {
    name: "VS Code y archivos",
    terms: [
      "vsc", "file", "folder", "terminal", "json", "markdown", "symbol", "debug",
      "sourcecontrol", "github", "azure", "database", "server", "package", "extensions",
    ],
  },
];

const matchesAnyTerm = (value: string, terms: string[]) => {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  return terms.some((term) => normalized.includes(term.toLowerCase().replace(/[^a-z0-9]/g, "")));
};

const buildIconCatalog = ({ source, module, prefix }: (typeof iconModules)[number]) =>
  Object.entries(module)
    .filter(([name, icon]) => {
      if (iconNameBlocklist.has(name) || !isIconComponent(icon)) return false;
      return name.startsWith(prefix);
    })
    .flatMap(([name, icon]) => {
      const label = formatIconLabel(name, prefix);
      if (!isPreferredLineIcon(name, label)) return [];
      return devIconPackages
        .filter((pack) => pack.exactNames?.includes(name) || matchesAnyTerm(`${name} ${label} ${source}`, pack.terms))
        .map((pack) => ({
          name,
          label,
          set: pack.name,
          icon: icon as IconComponent,
        }));
    });

const developmentIconCatalog: IconCatalogItem[] = iconModules
  .flatMap(buildIconCatalog)
  .filter((item, index, items) =>
    items.findIndex(
      (candidate) =>
        candidate.set === item.set &&
        canonicalIconLabel(candidate.label) === canonicalIconLabel(item.label),
    ) === index,
  )
  .sort((a, b) => a.set.localeCompare(b.set) || a.label.localeCompare(b.label));
export const iconCatalog: IconCatalogItem[] = [
  ...cloudIconCatalog,
  ...developmentIconCatalog,
]
  .filter((item, index, items) =>
    items.findIndex(
      (candidate) =>
        candidate.set === item.set &&
        canonicalIconLabel(candidate.label) === canonicalIconLabel(item.label),
    ) === index,
  )
  .sort((a, b) => a.set.localeCompare(b.set) || a.label.localeCompare(b.label));
export const iconLookup = new Map(iconCatalog.map((item) => [`${item.set}:${item.name}`, item.icon]));
export const customIconsStorageKey = "maketar-custom-svg-icons";
export const customIconPackagesStorageKey = "maketar-custom-svg-packages";
export const builtInIconSets = ["AWS", "GCP", ...devIconPackages.map((item) => item.name)];
export const iconResultLimit = 240;
