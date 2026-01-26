import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redis, CacheKeys, CacheTTL } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cacheKey = CacheKeys.userClinics(session.user.id);

    // Try to get from cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const clinics = await prisma.clinic.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          {
            ClinicMember: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
      },
      orderBy: { name: "asc" },
    });

    const response = { clinics };

    // Cache for 5 minutes
    await redis.set(cacheKey, response, CacheTTL.MEDIUM);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching clinics:", error);
    return NextResponse.json(
      { error: "Failed to fetch clinics" },
      { status: 500 },
    );
  }
}
