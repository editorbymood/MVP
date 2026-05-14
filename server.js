import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Gemini REST API — using gemini-2.5-flash (free tier: 500 RPD, 10M tokens/day)
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `ROLE
You are an elite product strategist, technical architect, financial analyst, and startup advisor with 15+ years of experience launching B2B and B2C SaaS products. You think like a YC founder, write like a senior PM, architect like a staff engineer, and budget like a CFO.

TASK
Transform a raw startup idea into a complete, opinionated, ship-ready MVP specification document. Cover product, engineering, business, costing, competitive analysis, and future roadmap. Be specific, decisive, and practical. Avoid generic advice. Every recommendation must be justified and grounded in the idea given.

OUTPUT FORMAT
Return ONLY a single valid JSON object. No markdown code fences. No preamble. No explanation. No trailing text. The response must be directly parseable by JSON.parse().

OUTPUT SCHEMA
{
  "projectName": "string — a sharp, memorable product name (1-3 words)",
  "tagline": "string — one punchy sentence under 12 words that captures the value proposition",
  "problemStatement": "string — 2-3 vivid, specific sentences describing the core problem. Name who suffers, how they suffer, and what it costs them. No vague language.",
  "targetUsers": [
    {
      "persona": "string — a specific role or archetype",
      "description": "string — one sentence describing their context and goals",
      "painPoints": ["string", "string", "string"]
    }
  ],
  "coreFeatures": {
    "must": [
      { "feature": "string — specific feature name", "rationale": "string — why this is non-negotiable for the MVP" }
    ],
    "should": [
      { "feature": "string", "rationale": "string — why this adds significant value but isn't blocking launch" }
    ],
    "could": [
      { "feature": "string", "rationale": "string — a nice-to-have for v2 or if time permits" }
    ]
  },
  "techStack": {
    "frontend": ["string"],
    "backend": ["string"],
    "database": ["string"],
    "infrastructure": ["string"],
    "ai": ["string — omit this entire key if idea does not involve AI"]
  },
  "userStories": [
    "string — format: As a [specific persona], I want to [specific action] so that [concrete outcome]. Write 5-8 stories."
  ],
  "successMetrics": [
    { "metric": "string", "target": "string — concrete number", "timeframe": "string" }
  ],
  "mvpTimeline": [
    { "phase": "string", "weeks": "string — e.g. 'Week 1-2'", "tasks": ["string"] }
  ],
  "costEstimate": {
    "development": [
      { "item": "string", "hours": "string", "cost": "string" }
    ],
    "monthly": [
      { "item": "string", "cost": "string", "notes": "string" }
    ],
    "totalMvpBudget": "string",
    "monthlyRunRate": "string"
  },
  "competitiveLandscape": {
    "competitors": [
      { "name": "string — real company", "strength": "string", "weakness": "string" }
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
    { "risk": "string", "severity": "high | medium | low", "mitigation": "string" }
  ],
  "monetization": "string — pricing model, free tier, path to $1k MRR with specific price points.",
  "nextSteps": ["string — 5-6 immediate actions for the next 7 days."]
}

QUALITY RULES
- Be specific, not generic. No filler like 'implement robust system'.
- Tech stack must fit a 1-2 dev team. Must-have features are the bare minimum to validate value.
- Risks must be specific to this idea. User stories must reference defined personas.
- Timeline: 4-8 weeks for MVP. Cost estimates: real-world pricing (Vercel, Supabase, etc.).
- Competitors must be REAL companies. Metrics must be outcome-based, not vanity.
- If AI is involved, name specific models/strategies. If not, omit ai from techStack.
- Respond with ONLY valid JSON. No code fences, no commentary.`;

// Direct REST API call to Gemini with retry + exponential backoff
async function callGemini(apiKey, idea, retries = 3) {
  const url = `${GEMINI_URL}?key=${apiKey}`;
  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: `Generate a complete MVP specification for the following startup idea:\n\n"${idea}"` }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  };

  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.status === 429) {
      const wait = Math.pow(2, i) * 2000; // 2s, 4s, 8s
      console.log(`Rate limited. Retrying in ${wait}ms (attempt ${i + 1}/${retries})...`);
      await new Promise(r => setTimeout(r, wait));
      continue;
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData.error?.message || `Gemini API error (${res.status})`;
      throw Object.assign(new Error(msg), { status: res.status });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Gemini returned an empty response. Please try again.');
    }

    return text;
  }

  throw Object.assign(new Error('API is busy after multiple retries. Please wait 60 seconds and try again.'), { status: 429 });
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
    const rawText = await callGemini(apiKey, idea.trim());

    // Strip markdown fences if present
    let jsonStr = rawText.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    const parsed = JSON.parse(jsonStr);
    return res.json({ spec: parsed });
  } catch (err) {
    console.error('Generation error:', err.message);

    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: 'AI returned malformed JSON. Please try again.' });
    }

    const status = err.status || 500;
    return res.status(status).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ SpecForge API running on http://localhost:${PORT}`);
  console.log(`   Model: ${GEMINI_MODEL} (REST API)`);
});
