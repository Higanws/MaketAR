// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/server/http/api-error";

const prismaMock = {
  user: {
    upsert: vi.fn(),
  },
  project: {
    deleteMany: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
  },
  diagram: {
    findFirst: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
};

vi.mock("@/server/db/prisma", () => ({
  prisma: prismaMock,
}));

describe("project-repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.user.upsert.mockResolvedValue({ id: "user-1", email: "local@maketar.app" });
  });

  it("createDefaultProject builds a mixed project", async () => {
    const { createDefaultProject } = await import("@/server/projects/project-repository");
    const project = createDefaultProject("Demo");
    expect(project.name).toBe("Demo");
    expect(project.kind).toBe("mixed");
    expect(project.diagrams).toBe(1);
  });

  it("deleteProject throws when project does not exist", async () => {
    prismaMock.project.deleteMany.mockResolvedValue({ count: 0 });
    const { deleteProject } = await import("@/server/projects/project-repository");
    await expect(deleteProject("missing")).rejects.toEqual(ApiError.notFound("Proyecto no encontrado."));
  });
});
