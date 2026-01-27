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
    const doctorId = searchParams.get("doctorId");
    const clinicId = searchParams.get("clinicId");

    if (!doctorId || !clinicId) {
      return NextResponse.json(
        { error: "Doctor ID and Clinic ID required" },
        { status: 400 },
      );
    }

    // Verify user has access to this clinic
    const hasAccess = await hasPermissionForClinic(clinicId, PERMISSIONS.TEAM_READ);

    if (!hasAccess) {
      return NextResponse.json({ error: "No access to this clinic" }, { status: 403 });
    }

    // Get all visit types for the clinic
    const visitTypes = await prisma.visitType.findMany({
      where: { clinicId, isActive: true },
      orderBy: { name: "asc" },
    });

    // Get custom rates for this doctor
    const customRates = await prisma.doctorVisitRate.findMany({
      where: {
        doctorId,
        VisitType: { clinicId },
        isActive: true,
      },
      include: { VisitType: true },
    });

    // Combine into response with default rates
    const rates = visitTypes.map((vt) => {
      const customRate = customRates.find((cr) => cr.visitTypeId === vt.id);
      return {
        visitTypeId: vt.id,
        visitTypeName: vt.name,
        defaultRate: vt.defaultRate,
        customRate: customRate ? customRate.rate : null,
        effectiveRate: customRate ? customRate.rate : vt.defaultRate,
        hasCustomRate: !!customRate,
        customRateId: customRate?.id || null,
      };
    });

    return NextResponse.json(rates);
  } catch (error) {
    console.error("Error fetching doctor rates:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor rates" },
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
    const { doctorId, visitTypeId, rate } = body;

    if (!doctorId || !visitTypeId || rate === undefined) {
      return NextResponse.json(
        { error: "Doctor ID, Visit Type ID, and rate required" },
        { status: 400 },
      );
    }

    // Get visit type to find clinic
    const visitType = await prisma.visitType.findUnique({
      where: { id: visitTypeId },
    });

    if (!visitType) {
      return NextResponse.json(
        { error: "Visit type not found" },
        { status: 404 },
      );
    }

    // Verify user has permission to manage doctor rates
    const canManage = await hasPermissionForClinic(
      visitType.clinicId,
      [PERMISSIONS.DOCTOR_RATE_MANAGE, PERMISSIONS.SETTINGS_MANAGE]
    );

    if (!canManage) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Upsert doctor rate
    const doctorRate = await prisma.doctorVisitRate.upsert({
      where: {
        doctorId_visitTypeId: {
          doctorId,
          visitTypeId,
        },
      },
      create: {
        doctorId,
        visitTypeId,
        rate,
      },
      update: {
        rate,
        isActive: true,
      },
    });

    return NextResponse.json(doctorRate);
  } catch (error) {
    console.error("Error setting doctor rate:", error);
    return NextResponse.json(
      { error: "Failed to set doctor rate" },
      { status: 500 },
    );
  }
}
