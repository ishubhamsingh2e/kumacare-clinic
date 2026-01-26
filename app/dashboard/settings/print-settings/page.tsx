import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrintSettingsComponent } from "@/components/settings/print-settings";
import { prisma } from "@/lib/db";

export default async function PrintSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if user is a doctor
  if (!session.user.title || !session.user.title.startsWith("Dr")) {
    redirect("/dashboard/settings");
  }

  // Get doctor's clinics
  const memberships = await prisma.clinicMember.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      Clinic: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const clinics = memberships.map((m) => ({
    id: m.Clinic.id,
    name: m.Clinic.name,
  }));

  if (clinics.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Print Settings</h1>
          <p className="text-muted-foreground">
            Configure your OPD card print templates
          </p>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            You need to be a member of at least one clinic to configure print
            settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Print Settings</h1>
        <p className="text-muted-foreground">
          Configure your OPD card print templates for each clinic
        </p>
      </div>
      <PrintSettingsComponent clinics={clinics} />
    </div>
  );
}
