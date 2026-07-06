import { z } from "zod";

export const ProjectKindSchema = z.literal("mixed");

export const FlowTemplateTypeSchema = z.enum(["purchase-flow", "approval-flow", "support-flow"]);

export const TemplateTypeSchema = z.enum(["dashboard", "landing", "mobile", "form", "architecture"]);

export const MaketarProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: ProjectKindSchema,
  template: TemplateTypeSchema.optional(),
  flowTemplate: FlowTemplateTypeSchema.optional(),
  updatedAt: z.string().min(1),
  diagrams: z.number().int().nonnegative(),
});

export const CreateProjectBodySchema = z.object({
  project: MaketarProjectSchema.optional(),
  document: z.unknown().optional(),
  name: z.string().min(1).optional(),
});

export const UpdateProjectBodySchema = z.object({
  project: MaketarProjectSchema.partial().optional(),
});

export type MaketarProjectInput = z.infer<typeof MaketarProjectSchema>;
export type CreateProjectBody = z.infer<typeof CreateProjectBodySchema>;
export type UpdateProjectBody = z.infer<typeof UpdateProjectBodySchema>;
