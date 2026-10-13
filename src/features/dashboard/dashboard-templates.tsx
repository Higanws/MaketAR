import { AppWindow, CloudCog, LayoutDashboard, PanelTop, Smartphone, Workflow } from "lucide-react";
import { createElement, type ElementType } from "react";

import type { FlowTemplateType } from "@/entities/flow/flow.types";
import type { ProjectKind } from "@/entities/project/project.types";
import type { TemplateType } from "@/entities/wireframe/wireframe.types";

type IconComponent = ElementType<{ size?: number; strokeWidth?: number; className?: string }>;

export type DashboardTemplate = {
  name: string;
  kind: ProjectKind;
  template?: TemplateType;
  flowTemplate?: FlowTemplateType;
  description: string;
};

export const dashboardTemplates: DashboardTemplate[] = [
  { name: "Dashboard SaaS", kind: "mixed", template: "dashboard", description: "Panel web con sidebar, metricas y tabla." },
  { name: "Landing Page", kind: "mixed", template: "landing", description: "Hero, navegacion, CTA y preview visual." },
  { name: "Mobile App", kind: "mixed", template: "mobile", description: "Pantalla mobile lista para maquetar." },
  { name: "Formulario", kind: "mixed", template: "form", description: "Pantalla de registro con panel de marca." },
  { name: "Arquitectura tecnica", kind: "mixed", template: "architecture", description: "Mapa cloud con capas, datos y storage." },
  { name: "Flujo de compra", kind: "mixed", flowTemplate: "purchase-flow", description: "Checkout con pago aprobado, reintento y confirmacion." },
  { name: "Flujo de aprobacion", kind: "mixed", flowTemplate: "approval-flow", description: "Solicitud, revision, decision y notificacion." },
  { name: "Flujo de soporte", kind: "mixed", flowTemplate: "support-flow", description: "Ticket, clasificacion, escalamiento y cierre." },
];

const templateIcons: Record<TemplateType, IconComponent> = {
  dashboard: LayoutDashboard,
  landing: PanelTop,
  mobile: Smartphone,
  form: AppWindow,
  architecture: CloudCog,
};

export const wireframeDashboardTemplates = dashboardTemplates.filter((template) => template.template);
export const flowDashboardTemplates = dashboardTemplates.filter((template) => template.flowTemplate);

export function TemplateIcon({ template }: { template?: TemplateType }) {
  if (!template) return <Workflow size={16} strokeWidth={1.8} />;
  return createElement(templateIcons[template], { size: 16, strokeWidth: 1.8 });
}
