import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a doctor
    if (!session.user.title || !session.user.title.startsWith("Dr")) {
      return NextResponse.json(
        { error: "Only doctors can upload print settings images" },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // header, footer, signature, watermark

    if (!file || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and SVG are allowed" },
        { status: 400 },
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 },
      );
    }

    // Validate type
    const validTypes = ["header", "footer", "signature", "watermark"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be header, footer, signature, or watermark" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create upload directory
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "print-settings",
      session.user.id,
    );
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const fileExt = path.extname(file.name);
    const fileName = `${type}-${Date.now()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file
    await writeFile(filePath, buffer);

    // Generate public URL
    const imageUrl = `/uploads/print-settings/${session.user.id}/${fileName}`;

    return NextResponse.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error("Print settings image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 },
    );
  }
}
