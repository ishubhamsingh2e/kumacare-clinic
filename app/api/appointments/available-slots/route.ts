import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDoctorAvailability } from "@/lib/actions/bookings";
import { redis, CacheKeys, CacheTTL } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");
    const clinicId = searchParams.get("clinicId");
    const dateStr = searchParams.get("date");

    if (!doctorId || !clinicId || !dateStr) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    const cacheKey = CacheKeys.availableSlots(doctorId, dateStr);
    
    // Try to get from cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const date = new Date(dateStr);
    const result = await getDoctorAvailability(doctorId, date, clinicId);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Format slots as time strings (e.g., "09:00 - 09:30")
    const formattedSlots = result.slots.map((slot) => {
      const startTime = new Date(slot.start).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const endTime = new Date(slot.end).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return `${startTime} - ${endTime}`;
    });

    const response = { slots: formattedSlots };
    
    // Cache for 1 minute (short TTL as slots can change frequently)
    await redis.set(cacheKey, response, CacheTTL.SHORT);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch available slots" },
      { status: 500 },
    );
  }
}
