import { z } from "zod";

import { editorStorageVersion } from "@/shared/config/editor";

const WireShapeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
}).passthrough();

const WirePageSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  shapes: z.array(WireShapeSchema),
}).passthrough();

const FlowNodeSchema = z.object({
  id: z.string().min(1),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }).passthrough(),
  data: z.object({
    label: z.string(),
    variant: z.string().min(1),
  }).passthrough(),
}).passthrough();

const FlowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
}).passthrough();

export const EditorDocumentSchema = z.object({
  version: z.number().int().positive().max(editorStorageVersion),
  pages: z.array(WirePageSchema).min(1),
  currentPageId: z.string().min(1),
  mode: z.enum(["wireframe", "diagram"]),
  zoom: z.number().positive(),
  showGrid: z.boolean(),
  snapToGrid: z.boolean(),
  gridSize: z.number().int().positive(),
  diagramNodes: z.array(FlowNodeSchema),
  diagramEdges: z.array(FlowEdgeSchema),
  updatedAt: z.string().optional(),
}).passthrough().superRefine((document, ctx) => {
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
