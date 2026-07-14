import { NextRequest, NextResponse } from "next/server";
import { getFacebookPostsPage, isFacebookFeedConfigured } from "@/lib/facebook";

export async function GET(request: NextRequest) {
  if (!isFacebookFeedConfigured()) {
    return NextResponse.json({ posts: [], nextCursor: null }, { status: 503 });
  }

  const { searchParams } = request.nextUrl;
  const after = searchParams.get("after") || undefined;
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") || 8), 1),
    24
  );

  const page = await getFacebookPostsPage({
    limit,
    after,
    dynamic: true,
  });

  return NextResponse.json(page);
}
