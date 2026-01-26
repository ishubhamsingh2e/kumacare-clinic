import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - Fetch print settings for doctor and clinic
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a doctor
    if (!session.user.title || !session.user.title.startsWith("Dr")) {
      return NextResponse.json(
        { error: "Only doctors can access print settings" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");

    if (!clinicId) {
      return NextResponse.json(
        { error: "Clinic ID is required" },
        { status: 400 },
      );
    }

    // Verify doctor belongs to this clinic
    const membership = await prisma.clinicMember.findFirst({
      where: {
        userId: session.user.id,
        clinicId: clinicId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this clinic" },
        { status: 403 },
      );
    }

    const settings = await prisma.printSettings.findUnique({
      where: {
        doctorId_clinicId: {
          doctorId: session.user.id,
          clinicId: clinicId,
        },
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Fetch print settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch print settings" },
      { status: 500 },
    );
  }
}

// POST - Create or update print settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a doctor
    if (!session.user.title || !session.user.title.startsWith("Dr")) {
      return NextResponse.json(
        { error: "Only doctors can create print settings" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { clinicId, ...settingsData } = body;

    if (!clinicId) {
      return NextResponse.json(
        { error: "Clinic ID is required" },
        { status: 400 },
      );
    }

    // Verify doctor belongs to this clinic
    const membership = await prisma.clinicMember.findFirst({
      where: {
        userId: session.user.id,
        clinicId: clinicId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this clinic" },
        { status: 403 },
      );
    }

    // Validate margins
    if (settingsData.marginTop !== undefined && (settingsData.marginTop < 0 || settingsData.marginTop > 100)) {
      return NextResponse.json(
        { error: "Top margin must be between 0 and 100mm" },
        { status: 400 },
      );
    }
    if (settingsData.marginBottom !== undefined && (settingsData.marginBottom < 0 || settingsData.marginBottom > 100)) {
      return NextResponse.json(
        { error: "Bottom margin must be between 0 and 100mm" },
        { status: 400 },
      );
    }
    if (settingsData.marginLeft !== undefined && (settingsData.marginLeft < 0 || settingsData.marginLeft > 100)) {
      return NextResponse.json(
        { error: "Left margin must be between 0 and 100mm" },
        { status: 400 },
      );
    }
    if (settingsData.marginRight !== undefined && (settingsData.marginRight < 0 || settingsData.marginRight > 100)) {
      return NextResponse.json(
        { error: "Right margin must be between 0 and 100mm" },
        { status: 400 },
      );
    }

    // Validate watermark opacity
    if (settingsData.watermarkOpacity !== undefined && (settingsData.watermarkOpacity < 0 || settingsData.watermarkOpacity > 1)) {
      return NextResponse.json(
        { error: "Watermark opacity must be between 0 and 1" },
        { status: 400 },
      );
    }

    // Upsert print settings
    const settings = await prisma.printSettings.upsert({
      where: {
        doctorId_clinicId: {
          doctorId: session.user.id,
          clinicId: clinicId,
        },
      },
      update: settingsData,
      create: {
        doctorId: session.user.id,
        clinicId: clinicId,
        ...settingsData,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Save print settings error:", error);
    return NextResponse.json(
      { error: "Failed to save print settings" },
      { status: 500 },
    );
  }
}
