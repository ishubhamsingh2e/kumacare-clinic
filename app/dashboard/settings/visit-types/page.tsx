import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/permissions";
import { VisitTypeManager } from "@/components/settings/visit-type-manager";

export default async function VisitTypesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const activeClinicId = session.user.activeClinicId;

  if (!activeClinicId) {
    redirect("/dashboard/settings");
  }

  const canManageSettings = await hasPermission(PERMISSIONS.USER_MANAGE);

  if (!canManageSettings) {
    redirect("/dashboard/settings");
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: activeClinicId },
  });

  if (!clinic) {
    redirect("/dashboard/settings");
  }

  const visitTypes = await prisma.visitType.findMany({
    where: { clinicId: activeClinicId },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  return (
    <VisitTypeManager 
      clinic={clinic}
      initialVisitTypes={visitTypes}
    />
  );
}
