import { z } from "zod";

import { editorStorageVersion } from "@/shared/config/editor";

const WirePageSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  shapes: z.array(z.record(z.string(), z.unknown())),
});

export const EditorDocumentSchema = z.object({
  version: z.number().int().positive().max(editorStorageVersion),
  pages: z.array(WirePageSchema).min(1),
  currentPageId: z.string().min(1),
  mode: z.enum(["wireframe", "diagram"]),
  zoom: z.number().positive(),
  showGrid: z.boolean(),
  snapToGrid: z.boolean(),
  gridSize: z.number().int().positive(),
  diagramNodes: z.array(z.record(z.string(), z.unknown())),
  diagramEdges: z.array(z.record(z.string(), z.unknown())),
  updatedAt: z.string().optional(),
}).superRefine((document, ctx) => {
  if (!document.pages.some((page) => page.id === document.currentPageId)) {
    ctx.addIssue({
      code: "custom",
      message: "currentPageId debe existir en pages.",
      path: ["currentPageId"],
    });
  }
});

export const UpdateDocumentBodySchema = z.object({
  document: EditorDocumentSchema,
});

export type EditorDocumentInput = z.infer<typeof EditorDocumentSchema>;
