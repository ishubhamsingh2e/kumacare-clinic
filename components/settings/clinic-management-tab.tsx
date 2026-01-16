
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ClinicProfileForm } from "@/components/forms/clinic-profile-form";
import { LocationManagement } from "@/components/clinic/location-management";
import { QRCodeGenerator } from "@/components/clinic/qr-code-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export async function ClinicManagementTab() {
  const session = await auth();
  const activeClinicId = session?.user?.activeClinicId;

  if (!activeClinicId) {
    return <p>No active clinic selected.</p>;
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: activeClinicId },
    include: {
      locations: true,
    },
  });

  if (!clinic) {
    return <p>Clinic not found.</p>;
  }

  const publicUrl = `/c/${clinic.slug || clinic.id}`;

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Manage your clinic&apos;s profile, locations, and sharing settings.
      </p>

      <Separator />

      {/* From Profile & Branding Tab */}
      <ClinicProfileForm clinic={clinic} />

      <Separator />
      
      {/* From Locations & Hours Tab */}
      <LocationManagement locations={clinic.locations} />

      <Separator />

      {/* From QR & Sharing Tab */}
      <h3 className="text-lg font-medium">Sharing</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Public Page Link</CardTitle>
            <CardDescription>
              Share this link with your patients or on social media.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md font-mono text-sm break-all">
              {process.env.NEXTAUTH_URL}/c/{clinic.slug || clinic.id}
            </div>
            <p className="text-xs text-muted-foreground italic">
              Note: Your page must be set to &quot;Published&quot; in the Profile tab to be visible to the public.
            </p>
          </CardContent>
        </Card>
        <QRCodeGenerator url={`${process.env.NEXTAUTH_URL}/c/${clinic.slug || clinic.id}`} clinicName={clinic.name} />
      </div>
    </div>
  );
}
