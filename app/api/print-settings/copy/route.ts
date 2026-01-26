import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST - Copy print settings from one clinic to another
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a doctor
    if (!session.user.title || !session.user.title.startsWith("Dr")) {
      return NextResponse.json(
        { error: "Only doctors can copy print settings" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { sourceClinicId, targetClinicId } = body;

    if (!sourceClinicId || !targetClinicId) {
      return NextResponse.json(
        { error: "Source and target clinic IDs are required" },
        { status: 400 },
      );
    }

    // Verify doctor belongs to both clinics
    const sourceMembership = await prisma.clinicMember.findFirst({
      where: {
        userId: session.user.id,
        clinicId: sourceClinicId,
      },
    });

    const targetMembership = await prisma.clinicMember.findFirst({
      where: {
        userId: session.user.id,
        clinicId: targetClinicId,
      },
    });

    if (!sourceMembership || !targetMembership) {
      return NextResponse.json(
        { error: "You must be a member of both clinics to copy settings" },
        { status: 403 },
      );
    }

    // Fetch source settings
    const sourceSettings = await prisma.printSettings.findUnique({
      where: {
        doctorId_clinicId: {
          doctorId: session.user.id,
          clinicId: sourceClinicId,
        },
      },
    });

    if (!sourceSettings) {
      return NextResponse.json(
        { error: "No print settings found for source clinic" },
        { status: 404 },
      );
    }

    // Copy settings to target clinic (exclude id, doctorId, clinicId, timestamps)
    const { id, doctorId, clinicId, createdAt, updatedAt, ...settingsToCopy } = sourceSettings;

    const newSettings = await prisma.printSettings.upsert({
      where: {
        doctorId_clinicId: {
          doctorId: session.user.id,
          clinicId: targetClinicId,
        },
      },
      update: settingsToCopy as any,
      create: {
        doctorId: session.user.id,
        clinicId: targetClinicId,
        ...settingsToCopy as any,
      },
    });

    return NextResponse.json({ success: true, settings: newSettings });
  } catch (error) {
    console.error("Copy print settings error:", error);
    return NextResponse.json(
      { error: "Failed to copy print settings" },
      { status: 500 },
    );
  }
}
