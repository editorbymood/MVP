import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Gemini REST API — using gemini-2.5-flash with thinking enabled for deep reasoning
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
      { "name": "string — e.g. 'Next.js 15'", "reason": "string — why this was chosen over alternatives for THIS specific project's needs (not generic benefits)", "usage": "string — how exactly it will be used in the project, e.g. 'App Router for page layouts, Server Components for fast initial load, API routes for lightweight endpoints'" }
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
      { "item": "string — e.g. 'Frontend Development (Next.js + 6 pages)'", "hours": "string — e.g. '60-80 hrs'", "cost": "string — e.g. '$3,000 - $4,000'", "rate": "string — e.g. '$50/hr (mid-level freelancer)'" }
    ],
    "monthly": [
      { "item": "string — e.g. 'Vercel Pro'", "cost": "string — e.g. '$20/mo'", "notes": "string — what this covers", "freeTier": "string — e.g. 'Hobby tier is free for up to 100GB bandwidth' or 'N/A'" }
    ],
    "totalMvpBudget": "string — specific range e.g. '$8,500 - $14,000'",
    "monthlyRunRate": "string — specific range e.g. '$85 - $250/mo'",
    "costNotes": "string — 2-3 sentences with assumptions: developer rate, region, freelancer vs agency, what's included/excluded"
  },
  "competitiveLandscape": {
    "competitors": [
      { "name": "string — real company that EXISTS and competes in this space", "strength": "string — what they do well that's relevant", "weakness": "string — specific gap that this MVP exploits" }
    ],
    "differentiator": "string — what makes THIS product fundamentally different, not just 'better UX'"
  },
  "futureScope": {
    "v2Features": [
      { "feature": "string", "rationale": "string", "estimatedEffort": "string" }
    ],
    "longTermVision": "string",
    "scalingConsiderations": ["string"]
  },
  "risks": [
    { "risk": "string — a risk SPECIFIC to this idea and domain, not generic startup risks", "severity": "high | medium | low", "mitigation": "string — actionable mitigation strategy" }
  ],
  "monetization": "string — pricing model, free tier, path to $1k MRR with specific price points grounded in what comparable products charge.",
  "nextSteps": ["string — 5-6 immediate, concrete actions for the next 7 days, starting with the single most important validation step."]
}

QUALITY RULES
- UNDERSTAND FIRST, GENERATE SECOND. If the idea says "uber for dogs," recognize this means an on-demand dog walking/sitting marketplace, not a rideshare for dogs. Interpret idioms, analogies, and shorthand correctly.
- Be specific, not generic. No filler like 'implement robust system' or 'leverage cutting-edge AI'.
- Every feature must trace back to a specific persona's pain point. If you can't justify why a feature solves a real pain, don't include it.
- Tech stack: for EACH technology, explain WHY it was chosen specifically for this project (not generic benefits), and HOW it will be used in the codebase. Name specific versions. Compare briefly to alternatives when relevant (e.g. 'Next.js over Vite SPA for SEO-critical landing pages' or 'Supabase over Firebase for PostgreSQL compatibility and row-level security').
- Cost estimates: Use real-world 2025 pricing. Development costs should assume a mid-level freelancer ($40-$80/hr depending on complexity). Monthly costs must use actual service pricing (Vercel: $20/mo Pro, Supabase: free to $25/mo, OpenAI API: $0.50/1M input tokens for GPT-4o-mini, Stripe: 2.9% + $0.30, AWS S3: ~$0.023/GB, etc.). Include free tier information where available.
- Must-have features are the bare minimum to validate value. Timeline: 4-8 weeks for MVP.
- Risks must be specific to this idea and its domain. User stories must reference defined personas.
- Competitors must be REAL companies that actually exist. Metrics must be outcome-based, not vanity.
- If AI is involved, name specific models, APIs, and strategies. If not, omit ai from techStack entirely.
- Respond with ONLY valid JSON. No code fences, no commentary.`;

// Extract valid JSON from raw text — handles thinking tokens, fences, truncation
function extractJSON(raw) {
  let text = raw.trim();

  // Strip markdown code fences
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  // Find the first '{' and extract from there
  const start = text.indexOf('{');
  if (start === -1) return null;
  text = text.substring(start);

  // Try parsing as-is first
  try { return JSON.parse(text); } catch {}

  // If truncated, find the last valid closing brace using bracket matching
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

// Build a richer user prompt that gives the model more to work with
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

// Direct REST API call to Gemini with retry + exponential backoff
async function callGemini(apiKey, idea, retries = 2) {
  const url = `${GEMINI_URL}?key=${apiKey}`;
  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: buildUserPrompt(idea) }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
      maxOutputTokens: 16384,
      thinkingConfig: {
        thinkingBudget: 4096,
      },
    },
  };

  for (let i = 0; i < retries; i++) {
    try {
      // 25s timeout — must finish before Cloudflare's ~30s limit
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(25000),
      });

      if (res.status === 429) {
        const wait = Math.pow(2, i) * 2000;
        console.log(`Rate limited. Retrying in ${wait}ms (attempt ${i + 1}/${retries})...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        let msg = `Gemini API error (${res.status})`;
        try {
          const errData = JSON.parse(errText);
          msg = errData.error?.message || msg;
        } catch {}
        throw Object.assign(new Error(msg), { status: res.status });
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        console.log(`Empty response on attempt ${i + 1}. Retrying...`);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }

      // Try to parse JSON
      const parsed = extractJSON(text);
      if (parsed && parsed.projectName) {
        return parsed;
      }

      // JSON parse failed — log and retry
      console.log(`Malformed JSON on attempt ${i + 1}. Raw (first 200 chars): ${text.substring(0, 200)}`);
      if (i < retries - 1) {
        console.log(`Retrying generation...`);
        await new Promise(r => setTimeout(r, 1500));
        continue;
      }
    } catch (err) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        console.error(`Attempt ${i + 1} timed out after 25s`);
        if (i < retries - 1) {
          continue;
        }
        throw Object.assign(
          new Error('The AI is taking too long to respond. Please try again — shorter ideas generate faster.'),
          { status: 504 }
        );
      }
      if (err.status) throw err; // propagate HTTP errors
      console.error(`Attempt ${i + 1} error:`, err.message);
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      throw err;
    }
  }

  throw new Error('Failed to generate a valid spec after multiple attempts. Please try again.');
}

app.post('/api/generate', async (req, res) => {
  const { idea } = req.body;

  if (!idea || typeof idea !== 'string' || idea.trim().length < 5) {
    return res.status(400).json({ error: 'Please provide a valid startup idea (at least 5 characters).' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured. Add it to your .env file.' });
  }

  try {
    const parsed = await callGemini(apiKey, idea.trim());
    return res.json({ spec: parsed });
  } catch (err) {
    console.error('Generation error:', err.message);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ SpecForge API running on http://localhost:${PORT}`);
  console.log(`   Model: ${GEMINI_MODEL} (REST API)`);
});
