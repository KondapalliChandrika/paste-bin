import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase, getPaste, incrementViewCount } from "@/lib/db";
import { isPasteAvailable } from "@/lib/paste";
import { getCurrentTime, getExpiryTimestamp } from "@/lib/time";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase();

    const { id } = await params;

    const testNowHeader = request.headers.get("x-test-now-ms");
    const currentTime = getCurrentTime(testNowHeader);

    const paste = await getPaste(id);
    if (!paste) {
      return NextResponse.json({ error: "Paste not found" }, { status: 404 });
    }

    // Normalize DB values - handle BigInt properly
    paste.created_at =
      typeof paste.created_at === "bigint"
        ? Number(paste.created_at)
        : Number(paste.created_at);

    paste.ttl_seconds =
      paste.ttl_seconds === null || paste.ttl_seconds === undefined
        ? null
        : typeof paste.ttl_seconds === "bigint"
          ? Number(paste.ttl_seconds)
          : Number(paste.ttl_seconds);


    if (!isPasteAvailable(paste, currentTime)) {
      return NextResponse.json({ error: "Paste not found" }, { status: 404 });
    }

    await incrementViewCount(id);

    const updatedViewCount = paste.view_count + 1;
    const remainingViews =
      paste.max_views !== null
        ? Math.max(0, paste.max_views - updatedViewCount)
        : null;

    const expiresAt = getExpiryTimestamp(paste.created_at, paste.ttl_seconds);

    return NextResponse.json({
      content: paste.content,
      remaining_views: remainingViews,
      expires_at: expiresAt,
    });
  } catch (error) {
    console.error("Fetch paste error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
