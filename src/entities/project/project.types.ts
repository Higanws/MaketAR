import type { TemplateType } from "@/entities/wireframe/wireframe.types";
import type { FlowTemplateType } from "@/entities/flow/flow.types";

export type ProjectKind = "mixed";

export type Project = {
  id: string;
  name: string;
  kind: ProjectKind;
  template?: TemplateType;
  flowTemplate?: FlowTemplateType;
  updatedAt: string;
  diagrams: number;
};
