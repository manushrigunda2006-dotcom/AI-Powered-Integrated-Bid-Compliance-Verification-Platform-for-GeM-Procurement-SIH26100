import { NextResponse } from 'next/server';
import { tenderService } from '@/services/tenderService';
import { bidderService } from '@/services/bidderService';
import { checkRateLimit, createRateLimitResponse, applyRateLimitHeaders } from '@/lib/rate-limit';

export async function GET(request: Request) {
  // Check Rate Limit (Read tier: 120/min Auth, 60/min Anon)
  const rateLimit = await checkRateLimit(request, 'read');
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit);
  }

  try {
    const { searchParams } = new URL(request.url);
    const tenderId = searchParams.get('id');

    if (!tenderId) {
      const tenders = await tenderService.getTenders();
      const response = NextResponse.json({ tenders });
      return applyRateLimitHeaders(response, rateLimit);
    }

    // Parallelize independent tender and bidder lookups
    const [tender, bidders] = await Promise.all([
      tenderService.getTender(tenderId),
      bidderService.getBiddersForTender(tenderId),
    ]);

    const response = NextResponse.json({
      tender,
      bidders,
    });
    return applyRateLimitHeaders(response, rateLimit);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tenders';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Check Rate Limit (Mutation tier: 30/min Auth, 10/min Anon)
  const rateLimit = await checkRateLimit(request, 'mutation');
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit);
  }

  try {
    const body = await request.json();
    const newTender = await tenderService.createTender(body);
    const response = NextResponse.json({ tender: newTender }, { status: 201 });
    return applyRateLimitHeaders(response, rateLimit);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create tender';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

