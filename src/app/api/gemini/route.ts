import { NextResponse } from 'next/server';
import {
  isGeminiConfigured,
  DEFAULT_GEMINI_MODEL,
  GEMINI_FALLBACK_MESSAGE,
  analyzeRfpWithGemini,
  generateComplianceExplanationsWithGemini,
  analyzeCrossEntityWithGemini,
  generateRiskAssessmentExplanationWithGemini,
  GeminiFullEvaluationResult,
} from '@/lib/gemini';
import { bidderService } from '@/services/bidderService';
import { tenderService } from '@/services/tenderService';
import { complianceService } from '@/services/complianceService';
import { verificationService } from '@/services/verificationService';
import { auditService } from '@/services/auditService';
import { scoringEngine } from '@/lib/engine/scoring';

export async function GET() {
  return NextResponse.json({
    success: true,
    configured: isGeminiConfigured(),
    model: DEFAULT_GEMINI_MODEL,
    fallbackMessage: GEMINI_FALLBACK_MESSAGE,
    disclaimer:
      'AI-assisted procurement insights are advisory and non-authoritative under GFR 2017. Final adjudication rests solely with the competent human officer.',
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing "action" parameter in request body' },
        { status: 400 }
      );
    }

    if (action === 'ANALYZE_RFP') {
      const { rfpText } = body;
      if (!rfpText || typeof rfpText !== 'string') {
        return NextResponse.json(
          { error: 'Missing or invalid "rfpText" parameter' },
          { status: 400 }
        );
      }

      const analysis = await analyzeRfpWithGemini(rfpText);

      await auditService.recordAuditLog({
        actor: 'SYSTEM',
        action: 'AI_RFP_ANALYSIS',
        metadata: {
          char_count: rfpText.length,
          clauses_extracted: analysis.requirements.length,
          documents_required: analysis.required_documents.length,
          is_ai_generated: analysis.is_ai_generated,
        },
      });

      return NextResponse.json({
        success: true,
        analysis,
        isGeminiConfigured: isGeminiConfigured(),
        fallbackMessage: isGeminiConfigured() ? null : GEMINI_FALLBACK_MESSAGE,
      });
    }

    if (action === 'ANALYZE_BIDDER') {
      const { bidderId, tenderId: reqTenderId } = body;
      if (!bidderId) {
        return NextResponse.json(
          { error: 'Missing "bidderId" parameter' },
          { status: 400 }
        );
      }

      const bidder = await bidderService.getBidder(bidderId);
      if (!bidder) {
        return NextResponse.json(
          { error: 'Bidder not found: ' + bidderId },
          { status: 404 }
        );
      }

      const targetTenderId = reqTenderId || bidder.tender_id;
      const [tender, clauseResults, registrySummary] = await Promise.all([
        tenderService.getTender(targetTenderId),
        complianceService.getComplianceResultsForBidder(bidder.id),
        verificationService.getRegistryVerifications(bidder.id),
      ]);

      const report = scoringEngine.compileEvaluationReport({
        tender,
        bidder,
        clauseResults,
        registrySummary,
      });

      const [riskExplanation, clauseExplanations, crossEntityAnalysis] =
        await Promise.all([
          generateRiskAssessmentExplanationWithGemini({
            bidder,
            tender,
            report,
          }),
          generateComplianceExplanationsWithGemini({
            bidder,
            tender,
            clauseResults,
          }),
          analyzeCrossEntityWithGemini({
            gstEntityName: report.cross_entity_check.gst_entity_name,
            oemEntityName: report.cross_entity_check.oem_entity_name,
            bankEntityName: report.cross_entity_check.bank_entity_name,
            levenshteinDistance: report.cross_entity_check.levenshtein_distance,
            similarityRatio: report.cross_entity_check.similarity_ratio,
            companyName: bidder.company_name,
          }),
        ]);

      const evaluation: GeminiFullEvaluationResult = {
        is_ai_assisted: true,
        model_used: DEFAULT_GEMINI_MODEL,
        timestamp: new Date().toISOString(),
        risk_explanation: riskExplanation,
        clause_explanations: clauseExplanations,
        cross_entity_analysis: crossEntityAnalysis,
        audit_disclaimer:
          'AI-assisted advisory evaluation under GeM GTC. Deterministic scoring and human officer adjudication remain legally binding under GFR 2017.',
      };

      await auditService.recordAuditLog({
        actor: 'SYSTEM',
        tenderId: tender.id,
        bidderId: bidder.id,
        action: 'GEMINI_AI_ANALYSIS',
        metadata: {
          model: DEFAULT_GEMINI_MODEL,
          risk_level: report.risk_level,
          overall_score: report.overall_score,
          is_configured: isGeminiConfigured(),
          clauses_analyzed: clauseResults.length,
          cross_entity_coherent: crossEntityAnalysis.is_coherent,
        },
      });

      const updatedAuditLogs = await auditService.getAuditLogsForBidder(bidder.id);

      return NextResponse.json({
        success: true,
        aiEvaluation: evaluation,
        auditLogs: updatedAuditLogs,
        isGeminiConfigured: isGeminiConfigured(),
        fallbackMessage: isGeminiConfigured() ? null : GEMINI_FALLBACK_MESSAGE,
      });
    }

    if (action === 'EXPLAIN_CLAUSE') {
      const { bidderId, clauseCode } = body;
      if (!bidderId || !clauseCode) {
        return NextResponse.json(
          { error: 'Missing bidderId or clauseCode' },
          { status: 400 }
        );
      }

      const bidder = await bidderService.getBidder(bidderId);
      if (!bidder) {
        return NextResponse.json({ error: 'Bidder not found' }, { status: 404 });
      }

      const clauseResults = await complianceService.getComplianceResultsForBidder(bidder.id);
      const targetClause = clauseResults.find((c) => c.clause_code === clauseCode);

      if (!targetClause) {
        return NextResponse.json({ error: 'Clause not found' }, { status: 404 });
      }

      const explanations = await generateComplianceExplanationsWithGemini({
        bidder,
        clauseResults: [targetClause],
      });

      return NextResponse.json({
        success: true,
        clauseExplanation: explanations[clauseCode] || null,
      });
    }

    return NextResponse.json(
      { error: 'Unsupported action: ' + action },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Gemini AI service error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
