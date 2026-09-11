import { NextResponse } from 'next/server';
import { adjudicationService } from '@/services/adjudicationService';
import { bidderService } from '@/services/bidderService';
import { auditService } from '@/services/auditService';
import { checkRateLimit, createRateLimitResponse, applyRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(request: Request) {
  // Check Rate Limit (Mutation tier: 30/min Auth, 10/min Anon, composite key)
  const rateLimit = await checkRateLimit(request, 'mutation');
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit);
  }

  try {
    const body = await request.json();
    const { bidderId, decision, remarks, officerName } = body;

    if (!bidderId || !decision || !remarks) {
      return NextResponse.json(
        { error: 'Missing required fields: bidderId, decision, remarks' },
        { status: 400 }
      );
    }

    let action: 'APPROVE_QUALIFICATION' | 'REQUEST_CLARIFICATION' | 'REJECT_DISQUALIFY' = 'APPROVE_QUALIFICATION';
    if (decision === 'CLARIFICATION_REQUESTED') action = 'REQUEST_CLARIFICATION';
    else if (decision === 'DISQUALIFIED') action = 'REJECT_DISQUALIFY';

    await adjudicationService.commitAdjudication({
      bidderId,
      action,
      remarks,
      officerName: officerName || 'ABCD',
    });

    // Parallelize independent post-adjudication lookups
    const [updatedBidder, auditLogs] = await Promise.all([
      bidderService.getBidder(bidderId),
      auditService.getAuditLogsForBidder(bidderId),
    ]);

    const response = NextResponse.json({
      success: true,
      bidder: updatedBidder,
      auditLogs,
    });
    return applyRateLimitHeaders(response, rateLimit);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to record officer decision';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
