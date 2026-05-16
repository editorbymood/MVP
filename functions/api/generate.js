// Cloudflare Pages Function — handles POST /api/generate
// This replaces the Express server.js endpoint for Cloudflare deployment

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `ROLE
You are an elite product strategist, technical architect, financial analyst, and startup advisor with 15+ years of experience launching B2B and B2C SaaS products. You think like a YC founder, write like a senior PM, architect like a staff engineer, and budget like a CFO.

CRITICAL: UNDERSTANDING THE IDEA
Before generating anything, you MUST deeply analyze the user's idea by considering:

1. DOMAIN IDENTIFICATION: What industry/vertical does this idea belong to? (fintech, edtech, healthtech, marketplace, devtools, consumer social, enterprise SaaS, etc.)
2. CORE VALUE PROPOSITION: What is the ONE thing this product does that creates value? Strip away all noise and find the atomic unit of value.
3. USER INTENT EXTRACTION: Even if the idea is vague or poorly worded, extract the underlying intent. A user saying "app for food" might mean a restaurant finder, a meal planner, a grocery delivery service, or a recipe app — use contextual clues (target audience mentions, problem hints, competitor references) to disambiguate. When truly ambiguous, choose the MOST VIABLE commercial interpretation.
4. IMPLICIT REQUIREMENTS: What does this idea NEED to work even if the user didn't mention it? (e.g., a "marketplace" implicitly needs trust/safety, payments, search, messaging between parties)
5. MARKET REALITY CHECK: Is this a B2B or B2C play? Is the revenue model obvious (subscription, transaction fee, freemium, ad-supported)? Who actually pays?

TASK
Transform a raw startup idea — no matter how vague, detailed, or unconventional — into a complete, opinionated, ship-ready MVP specification document. Cover product, engineering, business, costing, competitive analysis, and future roadmap.

KEY PRINCIPLES:
- Be specific, decisive, and practical. Avoid generic advice. Every recommendation must be justified and grounded in the idea given.
- If the idea is vague (e.g., "something with AI for students"), make SMART ASSUMPTIONS and state them explicitly in the problemStatement. Do NOT produce generic output.
- If the idea is complex, PRIORITIZE ruthlessly. The MVP must be buildable in 4-8 weeks by a small team.
- Ground every tech choice, cost estimate, and timeline in the SPECIFIC requirements of THIS idea, not generic SaaS templates.

OUTPUT FORMAT
Return ONLY a single valid JSON object. No markdown code fences. No preamble. No explanation. No trailing text. The response must be directly parseable by JSON.parse().

OUTPUT SCHEMA
{
  "projectName": "string — a sharp, memorable product name (1-3 words) that reflects the idea's domain and value prop",
  "tagline": "string — one punchy sentence under 12 words that captures the SPECIFIC value proposition, not a generic statement",
  "problemStatement": "string — 2-3 vivid, specific sentences describing the core problem. Name who suffers, how they suffer, and what it costs them (time, money, opportunity). If the original idea was vague, state your interpretation explicitly: 'Based on the idea of X, we interpret this as Y because Z.' No vague language.",
  "targetUsers": [
    {
      "persona": "string — a specific role or archetype directly derived from the idea (not generic 'tech-savvy millennials')",
      "description": "string — one sentence describing their context, daily workflow, and goals as they relate to THIS problem",
      "painPoints": ["string — a specific, measurable pain point", "string", "string"]
    }
  ],
  "coreFeatures": {
    "must": [
      { "feature": "string — specific feature name with implementation detail (e.g., 'Real-time collaborative document editor with cursor presence' NOT just 'Document editing')", "rationale": "string — why this is non-negotiable for the MVP, tied to a specific user persona's pain point" }
    ],
    "should": [
      { "feature": "string", "rationale": "string — why this adds significant value but isn't blocking launch" }
    ],
    "could": [
      { "feature": "string", "rationale": "string — a nice-to-have for v2 or if time permits" }
    ]
  },
  "techStack": {
    "frontend": [
      { "name": "string — e.g. 'Next.js 15'", "reason": "string — why this was chosen over alternatives for THIS specific project's needs (not generic benefits)", "usage": "string — how exactly it will be used in the project" }
    ],
    "backend": [
      { "name": "string", "reason": "string", "usage": "string" }
    ],
    "database": [
      { "name": "string", "reason": "string", "usage": "string" }
    ],
    "infrastructure": [
      { "name": "string", "reason": "string", "usage": "string" }
    ],
    "ai": [
      { "name": "string", "reason": "string", "usage": "string — omit this entire key if idea does not involve AI" }
    ]
  },
  "userStories": [
    "string — format: As a [specific persona FROM targetUsers], I want to [specific action tied to a must/should feature] so that [concrete, measurable outcome]. Write 5-8 stories."
  ],
  "successMetrics": [
    { "metric": "string", "target": "string — concrete number grounded in the idea's domain", "timeframe": "string" }
  ],
  "mvpTimeline": [
    { "phase": "string", "weeks": "string — e.g. 'Week 1-2'", "tasks": ["string — specific, actionable tasks not vague placeholders"] }
  ],
  "costEstimate": {
    "development": [
      { "item": "string", "hours": "string", "cost": "string", "rate": "string" }
    ],
    "monthly": [
      { "item": "string", "cost": "string", "notes": "string", "freeTier": "string" }
    ],
    "totalMvpBudget": "string",
    "monthlyRunRate": "string",
    "costNotes": "string"
  },
  "competitiveLandscape": {
    "competitors": [
      { "name": "string — real company that EXISTS", "strength": "string", "weakness": "string" }
    ],
    "differentiator": "string"
  },
  "futureScope": {
    "v2Features": [
      { "feature": "string", "rationale": "string", "estimatedEffort": "string" }
    ],
    "longTermVision": "string",
    "scalingConsiderations": ["string"]
  },
  "risks": [
    { "risk": "string — SPECIFIC to this idea", "severity": "high | medium | low", "mitigation": "string" }
  ],
  "monetization": "string",
  "nextSteps": ["string"]
}

QUALITY RULES
- UNDERSTAND FIRST, GENERATE SECOND. If the idea says "uber for dogs," recognize this means an on-demand dog walking/sitting marketplace, not a rideshare for dogs. Interpret idioms, analogies, and shorthand correctly.
- Be specific, not generic. No filler like 'implement robust system' or 'leverage cutting-edge AI'.
- Every feature must trace back to a specific persona's pain point.
- Tech stack: for EACH technology, explain WHY it was chosen specifically for this project and HOW it will be used. Name specific versions.
- Cost estimates: Use real-world 2025 pricing with actual service pricing. Include free tier info.
- Must-have features are the bare minimum to validate value. Timeline: 4-8 weeks for MVP.
- Risks must be specific to this idea. Competitors must be REAL companies.
- If AI is involved, name specific models/APIs. If not, omit ai from techStack entirely.
- Respond with ONLY valid JSON. No code fences, no commentary.`;

function buildUserPrompt(idea) {
  return `STARTUP IDEA:
"${idea}"

INSTRUCTIONS:
1. First, deeply understand what this idea is really about. Consider the domain, the target market, the implicit technical requirements, and the business model.
2. If the idea is expressed casually, in shorthand, or as an analogy (e.g., "Uber for X", "Tinder but for Y"), correctly interpret the underlying concept.
3. If critical details are missing (target audience, revenue model, key differentiator), make SMART assumptions based on the most commercially viable interpretation and state them in the problemStatement.
4. Generate a complete, production-quality MVP specification that a development team could immediately start building from.
5. Every section must be deeply connected to THIS specific idea — no generic templates.`;
}

function extractJSON(raw) {
  let text = raw.trim();

  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  const start = text.indexOf('{');
  if (start === -1) return null;
  text = text.substring(start);

  try { return JSON.parse(text); } catch {}

  let depth = 0;
  let lastValidEnd = -1;
  let inString = false;
  let escape = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{' || ch === '[') depth++;
    if (ch === '}' || ch === ']') {
      depth--;
      if (depth === 0) { lastValidEnd = i; break; }
    }
  }

  if (lastValidEnd > 0) {
    try { return JSON.parse(text.substring(0, lastValidEnd + 1)); } catch {}
  }

  return null;
}

async function callGemini(apiKey, idea) {
  const url = `${GEMINI_URL}?key=${apiKey}`;
  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: buildUserPrompt(idea) }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
      maxOutputTokens: 16384,
      thinkingConfig: {
        thinkingBudget: 2048,
      },
    },
  };

  // Single attempt with no retry — Cloudflare has tight time limits
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (res.status === 429) {
    throw new Error('AI service is busy. Please wait a moment and try again.');
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    let msg = `Gemini API error (${res.status})`;
    try {
      const errData = JSON.parse(errText);
      msg = errData.error?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('AI returned an empty response. Please try again.');
  }

  const parsed = extractJSON(text);
  if (parsed && parsed.projectName) {
    return parsed;
  }

  throw new Error('AI returned malformed data. Please try again.');
}

// Cloudflare Pages Function entry point
export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const { idea } = await request.json();

    if (!idea || typeof idea !== 'string' || idea.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: 'Please provide a valid startup idea (at least 5 characters).' }),
        { status: 400, headers }
      );
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY is not configured. Add it in Cloudflare Dashboard → Settings → Environment Variables.' }),
        { status: 500, headers }
      );
    }

    const spec = await callGemini(apiKey, idea.trim());
    return new Response(
      JSON.stringify({ spec }),
      { status: 200, headers }
    );
  } catch (err) {
    console.error('Generation error:', err.message);
    return new Response(
      JSON.stringify({ error: err.message || 'Something went wrong. Please try again.' }),
      { status: 500, headers }
    );
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
