import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch pre-designed templates
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a doctor
    if (!session.user.title || !session.user.title.startsWith("Dr")) {
      return NextResponse.json(
        { error: "Only doctors can access templates" },
        { status: 403 },
      );
    }

    const templates = [
      {
        id: "classic",
        name: "Classic",
        description: "Traditional layout with clear sections",
        config: {
          marginTop: 20,
          marginBottom: 20,
          marginLeft: 15,
          marginRight: 15,
          templateType: "classic",
          useCustomHeader: false,
          useCustomFooter: false,
          headerFirstPageOnly: false,
          enableWatermark: false,
          watermarkOpacity: 0.1,
          patientInfoFields: ["name", "age", "gender", "phone", "address"],
          doctorInfoFields: ["name", "title", "licenseNumber", "phone"],
          useGenericName: false,
        },
      },
      {
        id: "modern",
        name: "Modern",
        description: "Clean layout with organized sections",
        config: {
          marginTop: 25,
          marginBottom: 20,
          marginLeft: 20,
          marginRight: 20,
          templateType: "modern",
          useCustomHeader: false,
          useCustomFooter: false,
          headerFirstPageOnly: false,
          enableWatermark: false,
          watermarkOpacity: 0.1,
          patientInfoFields: ["name", "age", "gender", "phone"],
          doctorInfoFields: ["name", "title", "phone"],
          useGenericName: false,
        },
      },
      {
        id: "minimal",
        name: "Minimal",
        description: "Compact design with essential information only",
        config: {
          marginTop: 15,
          marginBottom: 15,
          marginLeft: 15,
          marginRight: 15,
          templateType: "minimal",
          useCustomHeader: false,
          useCustomFooter: false,
          headerFirstPageOnly: false,
          enableWatermark: false,
          watermarkOpacity: 0.1,
          patientInfoFields: ["name", "age", "gender"],
          doctorInfoFields: ["name", "title"],
          useGenericName: false,
        },
      },
      {
        id: "professional",
        name: "Professional",
        description: "Formal layout with detailed information",
        config: {
          marginTop: 30,
          marginBottom: 20,
          marginLeft: 20,
          marginRight: 20,
          templateType: "professional",
          useCustomHeader: false,
          useCustomFooter: false,
          headerFirstPageOnly: false,
          enableWatermark: false,
          watermarkOpacity: 0.1,
          patientInfoFields: ["name", "age", "gender", "phone", "email"],
          doctorInfoFields: ["name", "title", "licenseNumber", "phone", "email"],
          useGenericName: false,
        },
      },
      {
        id: "medical",
        name: "Medical",
        description: "Clinical format with watermark support",
        config: {
          marginTop: 20,
          marginBottom: 20,
          marginLeft: 20,
          marginRight: 20,
          templateType: "medical",
          useCustomHeader: false,
          useCustomFooter: false,
          headerFirstPageOnly: false,
          enableWatermark: true,
          watermarkOpacity: 0.05,
          patientInfoFields: ["name", "age", "gender", "phone", "bloodGroup"],
          doctorInfoFields: ["name", "title", "licenseNumber", "phone"],
          useGenericName: true,
        },
      },
    ];

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Fetch templates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 },
    );
  }
}
