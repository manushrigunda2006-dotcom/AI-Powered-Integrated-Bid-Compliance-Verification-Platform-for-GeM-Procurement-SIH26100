import { NextResponse } from 'next/server';
import { bidderService } from '@/services/bidderService';
import { verificationService } from '@/services/verificationService';
import { complianceService } from '@/services/complianceService';
import { auditService } from '@/services/auditService';
import { scoringEngine } from '@/lib/engine/scoring';
import { tenderService } from '@/services/tenderService';
import { documentService } from '@/services/documentService';
import { ComplianceResult } from '@/lib/types';
import { checkRateLimit, createRateLimitResponse, applyRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(request: Request) {
  // Check Rate Limit (Verification tier: 15/min Auth, 5/min Anon, composite key)
  const rateLimit = await checkRateLimit(request, 'verification');
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit);
  }

  try {
    const body = await request.json();
    const { bidderId } = body;

    if (!bidderId) {
      return NextResponse.json({ error: 'Missing bidderId parameter' }, { status: 400 });
    }

    const bidder = await bidderService.getBidder(bidderId);
    if (!bidder) {
      return NextResponse.json({ error: `Bidder not found: ${bidderId}` }, { status: 404 });
    }

    // Parallelize 4 independent database/service operations
    const [tender, registrySummary, clauseResults, bidderDocs] = await Promise.all([
      tenderService.getTender(bidder.tender_id),
      verificationService.getRegistryVerifications(bidder.id),
      complianceService.getComplianceResultsForBidder(bidder.id),
      documentService.getDocumentsForBidder(bidder.id),
    ]);

    // Cross-check bidder submitted documents against Tender's Required Documents
    if (tender.required_documents && tender.required_documents.length > 0) {
      for (const reqDoc of tender.required_documents) {
        if (reqDoc.is_mandatory) {
          const hasDoc = bidderDocs.some((d) => d.doc_type === reqDoc.document_type);
          if (!hasDoc) {
            // Check if already represented in clauseResults
            const existingMissing = clauseResults.find(
              (cr) =>
                cr.status === 'MISSING_DOC' &&
                (cr.clause_code === reqDoc.document_type ||
                 cr.clause_title.toLowerCase().includes(reqDoc.display_name.toLowerCase()) ||
                 cr.clause_title.toLowerCase().includes(reqDoc.document_type.toLowerCase()))
            );

            if (!existingMissing) {
              // Append explicit missing document breach
              clauseResults.push({
                id: `cr-missing-${reqDoc.id}-${bidder.id}`,
                requirement_id: reqDoc.id,
                bidder_id: bidder.id,
                clause_code: reqDoc.document_type,
                clause_title: `Mandatory Document: ${reqDoc.display_name}`,
                category: 'STATUTORY',
                is_mandatory: true,
                status: 'MISSING_DOC',
                risk_weight: 25,
                score_contribution: 0,
                threshold_display: reqDoc.display_name,
                extracted_display: 'MISSING_DOC (Not Uploaded)',
                human_explanation: `Tender mandatory requirement: Bidder document packet is missing required document "${reqDoc.display_name}" (${reqDoc.document_type}).`,
              });
            }
          }
        }
      }
    }

    // Record COMPLIANCE_RUN audit event
    await auditService.recordAuditLog({
      actor: 'SYSTEM',
      tenderId: tender.id,
      bidderId: bidder.id,
      action: 'COMPLIANCE_RUN',
      metadata: {
        bidder_company: bidder.company_name,
        clauses_evaluated: clauseResults.length,
        missing_docs: clauseResults.filter((cr) => cr.status === 'MISSING_DOC').length,
        non_compliant: clauseResults.filter((cr) => cr.status === 'NON_COMPLIANT').length,
      },
    });

    const auditLogs = await auditService.getAuditLogsForBidder(bidder.id);

    const report = scoringEngine.compileEvaluationReport({
      tender,
      bidder,
      clauseResults,
      registrySummary,
    });

    const response = NextResponse.json({
      success: true,
      report,
      bidder,
      auditLogs,
    });
    return applyRateLimitHeaders(response, rateLimit);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to execute verification';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
