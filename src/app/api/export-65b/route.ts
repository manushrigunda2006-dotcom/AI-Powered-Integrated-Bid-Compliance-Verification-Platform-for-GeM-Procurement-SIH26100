import { NextRequest, NextResponse } from 'next/server';
import { certificate65BService } from '@/services/certificate65BService';
import { bidderService } from '@/services/bidderService';
import { tenderService } from '@/services/tenderService';
import { complianceService } from '@/services/complianceService';
import { verificationService } from '@/services/verificationService';
import { auditService } from '@/services/auditService';
import { checkRateLimit, createRateLimitResponse } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Check Rate Limit (Document export tier: 10/min Auth, 4/min Anon, composite key)
  const rateLimit = await checkRateLimit(request, 'documentExport');
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit);
  }

  try {
    const { searchParams } = new URL(request.url);
    const bidderId = searchParams.get('bidderId') || 'bidder-01';
    const tenderId = searchParams.get('tenderId') || 'tender-gem-2026-cloud';

    const bidder = await bidderService.getBidder(bidderId);
    if (!bidder) {
      return NextResponse.json({ error: `Bidder not found: ${bidderId}` }, { status: 404 });
    }

    // Parallelize independent queries
    const [tender, complianceResults, registrySummary, auditLogs] = await Promise.all([
      tenderService.getTender(tenderId),
      complianceService.getComplianceResultsForBidder(bidderId),
      verificationService.getRegistryVerifications(bidderId).catch(() => null),
      auditService.getAuditLogsForBidder(bidderId).catch(() => []),
    ]);

    const { doc, filename } = await certificate65BService.generate65BCertificatePdf({
      tender,
      bidder,
      complianceResults,
      registrySummary,
      auditLogs,
    });

    const arrayBuffer = doc.output('arraybuffer');
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.reset.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error generating 65B certificate:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate 65B certificate' },
      { status: 500 }
    );
  }
}
