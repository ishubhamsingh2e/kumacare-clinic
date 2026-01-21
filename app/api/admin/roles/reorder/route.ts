import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is ADMIN
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { roleId, direction } = await req.json();

    if (!roleId || !direction) {
      return NextResponse.json(
        { error: "Role ID and direction are required" },
        { status: 400 },
      );
    }

    if (!["up", "down"].includes(direction)) {
      return NextResponse.json(
        { error: "Direction must be 'up' or 'down'" },
        { status: 400 },
      );
    }

    // Get the current role
    const currentRole = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!currentRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Get all roles ordered by priority
    const allRoles = await prisma.role.findMany({
      orderBy: { priority: "desc" },
    });

    const currentIndex = allRoles.findIndex((r) => r.id === roleId);

    if (currentIndex === -1) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Calculate target index
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    // Check bounds
    if (targetIndex < 0 || targetIndex >= allRoles.length) {
      return NextResponse.json(
        { error: "Cannot move role in that direction" },
        { status: 400 },
      );
    }

    const targetRole = allRoles[targetIndex];

    // Swap priorities
    await prisma.$transaction([
      prisma.role.update({
        where: { id: currentRole.id },
        data: { priority: targetRole.priority },
      }),
      prisma.role.update({
        where: { id: targetRole.id },
        data: { priority: currentRole.priority },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Role order updated successfully",
    });
  } catch (error) {
    console.error("Error reordering roles:", error);
    return NextResponse.json(
      { error: "Failed to reorder roles" },
      { status: 500 },
    );
  }
}
