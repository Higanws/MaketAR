import { prisma } from "@/server/db/prisma";

export const localUserEmail = "local@maketar.app";

import { legacySeedProjects, isLegacySeedProject } from "@/shared/config/legacy-seeds";

export { legacySeedProjects, isLegacySeedProject };

export async function getLocalUser() {
  return prisma.user.upsert({
    where: { email: localUserEmail },
    update: {},
    create: { email: localUserEmail },
  });
}

export async function purgeLegacySeedProjects(userId: string) {
  await prisma.project.deleteMany({
    where: {
      userId,
      OR: [...legacySeedProjects],
    },
  });
}
