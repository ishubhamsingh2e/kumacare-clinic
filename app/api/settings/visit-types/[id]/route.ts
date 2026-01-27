import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermissionForClinic } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/permissions";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, description, defaultRate, isDefault, isActive } = body;

    const visitType = await prisma.visitType.findUnique({
      where: { id },
    });

    if (!visitType) {
      return NextResponse.json(
        { error: "Visit type not found" },
        { status: 404 },
      );
    }

    // Verify user has permission to manage visit types
    const canManage = await hasPermissionForClinic(visitType.clinicId, [
      PERMISSIONS.VISIT_TYPE_MANAGE,
      PERMISSIONS.SETTINGS_MANAGE,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // If setting as default, unset other defaults
    if (isDefault && !visitType.isDefault) {
      await prisma.visitType.updateMany({
        where: { clinicId: visitType.clinicId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.visitType.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(defaultRate !== undefined && { defaultRate }),
        ...(isDefault !== undefined && { isDefault }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating visit type:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Visit type with this name already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to update visit type" },
      { status: 500 },
    );
  }
}

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

    const visitType = await prisma.visitType.findUnique({
      where: { id },
      include: {
        Bookings: { take: 1 },
      },
    });

    if (!visitType) {
      return NextResponse.json(
        { error: "Visit type not found" },
        { status: 404 },
      );
    }

    // Verify user has permission to manage visit types
    const canManage = await hasPermissionForClinic(visitType.clinicId, [
      PERMISSIONS.VISIT_TYPE_MANAGE,
      PERMISSIONS.SETTINGS_MANAGE,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // If visit type has bookings, just deactivate it
    if (visitType.Bookings.length > 0) {
      const updated = await prisma.visitType.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        message: "Visit type deactivated (has existing bookings)",
        visitType: updated,
      });
    }

    // No bookings, safe to delete
    await prisma.visitType.delete({ where: { id } });

    return NextResponse.json({
      message: "Visit type deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting visit type:", error);
    return NextResponse.json(
      { error: "Failed to delete visit type" },
      { status: 500 },
    );
  }
}
