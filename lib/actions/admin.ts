"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function assignClinicManagerRole(userId: string) {
  const clinicManagerRole = await prisma.role.findUnique({
    where: { name: "CLINIC_MANAGER" },
  });

  if (!clinicManagerRole) {
    throw new Error("Clinic Manager role not found.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { roleId: clinicManagerRole.id },
  });

  revalidatePath("/admin");
}
