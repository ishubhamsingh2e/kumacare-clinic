import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermissionForClinic } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const clinicId = searchParams.get("clinicId");

    if (!clinicId) {
      return NextResponse.json(
        { error: "Clinic ID required" },
        { status: 400 },
      );
    }

    // Verify user has access to this clinic
    const hasAccess = await hasPermissionForClinic(clinicId, PERMISSIONS.TEAM_READ);

    if (!hasAccess) {
      return NextResponse.json({ error: "No access to this clinic" }, { status: 403 });
    }

    const visitTypes = await prisma.visitType.findMany({
      where: { clinicId },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });

    return NextResponse.json(visitTypes);
  } catch (error) {
    console.error("Error fetching visit types:", error);
    return NextResponse.json(
      { error: "Failed to fetch visit types" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { clinicId, name, description, defaultRate, isDefault } = body;

    if (!clinicId || !name) {
      return NextResponse.json(
        { error: "Clinic ID and name required" },
        { status: 400 },
      );
    }

    // Verify user has permission to manage visit types
    const canManage = await hasPermissionForClinic(
      clinicId,
      [PERMISSIONS.VISIT_TYPE_MANAGE, PERMISSIONS.SETTINGS_MANAGE]
    );

    if (!canManage) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.visitType.updateMany({
        where: { clinicId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const visitType = await prisma.visitType.create({
      data: {
        clinicId,
        name,
        description: description || null,
        defaultRate: defaultRate || 0,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(visitType, { status: 201 });
  } catch (error: any) {
    console.error("Error creating visit type:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Visit type with this name already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create visit type" },
      { status: 500 },
    );
  }
}
