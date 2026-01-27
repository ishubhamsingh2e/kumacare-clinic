import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermissionForClinic } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/permissions";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const doctorRate = await prisma.doctorVisitRate.findUnique({
      where: { id },
      include: {
        VisitType: true,
      },
    });

    if (!doctorRate) {
      return NextResponse.json(
        { error: "Doctor rate not found" },
        { status: 404 },
      );
    }

    // Verify user has permission to manage doctor rates
    const canManage = await hasPermissionForClinic(
      doctorRate.VisitType.clinicId,
      [PERMISSIONS.DOCTOR_RATE_MANAGE, PERMISSIONS.SETTINGS_MANAGE]
    );

    if (!canManage) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    await prisma.doctorVisitRate.delete({ where: { id } });

    return NextResponse.json({
      message: "Custom rate removed, will use default rate",
    });
  } catch (error) {
    console.error("Error deleting doctor rate:", error);
    return NextResponse.json(
      { error: "Failed to delete doctor rate" },
      { status: 500 },
    );
  }
}
