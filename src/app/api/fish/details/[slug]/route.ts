import { NextResponse, NextRequest } from 'next/server';
import { getFishDetails } from '../../../../../../lib/db/fish';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const slug = resolvedParams.slug;
    const lang = request.nextUrl.searchParams.get('lang') || 'de';
    console.log(`[API /details] Awaited slug: ${slug}, lang: ${lang}`);

    if (!slug) {
      return NextResponse.json({ message: "Slug is required" }, { status: 400 });
    }

    const fishData = await getFishDetails(slug, lang);

    if (!fishData) {
      return NextResponse.json({ message: "Fish not found" }, { status: 404 });
    }

    return NextResponse.json(fishData);

  } catch (error: any) {
    console.error("[API /details] General Error:", error.message);
    return NextResponse.json({ message: error.message || "Failed to fetch fish details" }, { status: 500 });
  }
}