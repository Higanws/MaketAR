import {
  AppWindow,
  BoxSelect,
  Diamond,
  Image as ImageIcon,
  LayoutDashboard,
  Milestone,
  MoveRight,
  PanelTop,
  Smartphone,
  Square,
  Type,
} from "lucide-react";

import type { FlowNodeVariant } from "@/entities/flow/flow.types";
import type { TemplateType } from "@/entities/wireframe/wireframe.types";
import { DataFlowNodeIcon } from "@/features/editor/wireframe/DataFlowNodeIcon";
import type { IconComponent } from "@/features/icons/icon-catalog";

export const libraryItemButtonClass =
  "group flex h-[72px] cursor-grab flex-col items-start justify-between rounded-md border border-slate-200 bg-slate-50 p-2 text-left transition hover:border-blue-300 hover:bg-blue-50 active:cursor-grabbing";

export const diagramLibraryItemButtonClass =
  "group flex h-[74px] cursor-grab flex-col items-start justify-between rounded-md border border-slate-200 bg-slate-50 p-2 text-left transition hover:border-blue-300 hover:bg-blue-50 active:cursor-grabbing";

export const iconTileButtonClass =
  "group grid size-10 cursor-grab place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 active:cursor-grabbing";

export const diagramNodeTools: Array<{ variant: FlowNodeVariant; label: string; icon: IconComponent }> = [
  { variant: "start", label: "Inicio / Fin", icon: Milestone },
  { variant: "process", label: "Proceso", icon: Square },
  { variant: "decision", label: "Decision", icon: Diamond },
  { variant: "data", label: "Entrada / Salida", icon: DataFlowNodeIcon },
  { variant: "image", label: "Imagen", icon: ImageIcon },
  { variant: "text", label: "Texto", icon: Type },
  { variant: "group", label: "Grupo visual", icon: BoxSelect },
];

export const diagramConnectorTools = [
  { label: "Flecha", description: "Arrastra desde un punto del nodo hacia otro nodo.", icon: MoveRight },
  { label: "Etiqueta", description: "Haz doble click sobre una flecha para editar su texto.", icon: Type },
];

export const editorTemplateOptions: Array<{ type: Exclude<TemplateType, "architecture">; label: string }> = [
  { type: "dashboard", label: "Dashboard" },
  { type: "landing", label: "Landing" },
  { type: "mobile", label: "Mobile" },
  { type: "form", label: "Formulario" },
];

export const editorTemplateIcons: Record<Exclude<TemplateType, "architecture">, IconComponent> = {
  dashboard: LayoutDashboard,
  landing: PanelTop,
  mobile: Smartphone,
  form: AppWindow,
};
