// ─────────────────────────────────────────────────────────────────
// TE PDF Upload + Text Extraction Endpoint
// Accepts pre-rendered page images from client → vision LLM
// Handles scanned/image-based PDFs the old approach couldn't
// ─────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const mode = (formData.get('mode') as string) || 'extract';
    const imagesJson = formData.get('images') as string | null;

    if (!file && !imagesJson) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file?.name?.replace(/\.pdf$/i, '') || 'untitled';

    // Must have rendered page images from client
    if (!imagesJson) {
      return NextResponse.json({
        error: 'Could not extract text from this PDF. Try re-uploading — the browser will render pages as images for better text extraction.',
        fileName,
        needsClientRender: true,
      }, { status: 422 });
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({
        error: 'API key not configured. Unable to process PDF.',
        fileName,
      }, { status: 500 });
    }

    const images = JSON.parse(imagesJson) as string[];
    if (images.length === 0) {
      return NextResponse.json({
        error: 'Could not render any pages from this PDF.',
        fileName,
      }, { status: 422 });
    }

    // Build vision LLM request
    const contentParts: any[] = [
      {
        type: 'text',
        text: mode === 'extract'
          ? 'This is a government Request for Tender (RFT) or procurement PDF. Extract ALL readable text from every page shown. Return the complete text content. Do NOT summarize or omit any content.'
          : 'This is a bid submission PDF. Extract ALL readable text from every page. Pay special attention to: security certifications (ISO 27001), insurance coverage, WHS policies, modern slavery statements, conflict of interest, data security compliance, financial viability/turnover, and government contract experience. Return the complete text.',
      },
    ];

    for (const img of images.slice(0, 10)) {
      contentParts.push({
        type: 'image_url',
        image_url: { url: img },
      });
    }

    const llmRes = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://tender-intelligence.vercel.app',
        'X-Title': 'Tender Evaluator',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: contentParts }],
        temperature: 0.1,
        max_tokens: 16000,
      }),
    });

    const llmData = await llmRes.json();
    const text = llmData.choices?.[0]?.message?.content || '';

    if (!text || text.length < 50) {
      return NextResponse.json({
        error: 'Vision LLM could not extract text from these page images.',
        fileName,
        llmRaw: JSON.stringify(llmData).substring(0, 200),
      }, { status: 422 });
    }

    const textPreview = text.substring(0, 50000);

    // Evidence extraction mode
    if (mode === 'evidence') {
      try {
        const evidenceRes = await fetch(OPENROUTER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://tender-intelligence.vercel.app',
            'X-Title': 'Tender Evaluator',
          },
          body: JSON.stringify({
            model: 'deepseek/deepseek-v4-flash',
            messages: [
              {
                role: 'system',
                content: `Extract evidence from bid submission text for procurement compliance gates.

Return ONLY JSON where keys are gate IDs and values are evidence excerpts.

Gate IDs:
- gate_capability: Government/existing contract experience
- gate_iso27001: ISO 27001 / infosec certification
- gate_insurance: Public liability / PI insurance ($10M+)
- gate_whs: WHS / safety policy and track record
- gate_modern_slavery: Modern slavery statement
- gate_conflict: Conflict of interest declaration
- gate_data_security: Data security / PSPF compliance
- gate_financial: Financial viability / turnover ($5M+)

Only include gates with actual evidence. Return {} if none found.`,
              },
              { role: 'user', content: textPreview },
            ],
            temperature: 0.1,
            max_tokens: 4000,
            response_format: { type: 'json_object' },
          }),
        });

        const evidenceData = await evidenceRes.json();
        let evidence = {};
        try {
          evidence = JSON.parse(evidenceData.choices?.[0]?.message?.content || '{}');
        } catch {}

        return NextResponse.json({
          fileName,
          pages: images.length,
          extractionMethod: 'llm-vision',
          text: textPreview.substring(0, 3000),
          evidence,
          source: 'llm-evidence',
        });
      } catch {}
    }

    return NextResponse.json({
      fileName,
      pages: images.length,
      text: textPreview,
      extractionMethod: 'llm-vision',
      source: 'llm-vision',
    });
  } catch (error: any) {
    console.error('[TE Upload] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process PDF' }, { status: 500 });
  }
}