import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { hasPermission } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/permissions";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canUpdate = await hasPermission(PERMISSIONS.CLINIC_UPDATE);
    if (!canUpdate) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const clinicId = formData.get("clinicId") as string;

    if (!file || !type || !clinicId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "clinics");
    await mkdir(uploadDir, { recursive: true });

    const fileExt = path.extname(file.name);
    const fileName = `${clinicId}-${type}-${Date.now()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/clinics/${fileName}`;

    await prisma.clinic.update({
      where: { id: clinicId },
      data: {
        [type === "cover" ? "coverImage" : "profileImage"]: imageUrl,
      },
    });

    return NextResponse.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 },
    );
  }
}
