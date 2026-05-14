#!/usr/bin/env python3
"""
SpecForge — Standalone Python API Test & Fallback
Tests your Gemini API key and generates a complete MVP spec from the command line.
Usage: python3 test_api.py "Your startup idea here"
"""

import sys
import json
import time
import urllib.request
import urllib.error
import os

# ── Config ──
API_KEY = os.environ.get("GEMINI_API_KEY", "")
MODEL = "gemini-2.5-flash"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"

SYSTEM_PROMPT = """You are an elite product strategist. Transform a startup idea into a complete MVP specification. Return ONLY valid JSON with these fields:
projectName, tagline, problemStatement, targetUsers (array of {persona, description, painPoints}), 
coreFeatures ({must, should, could} arrays of {feature, rationale}), 
techStack ({frontend, backend, database, infrastructure, ai}), 
userStories (array of strings), successMetrics (array of {metric, target, timeframe}), 
mvpTimeline (array of {phase, weeks, tasks}), 
costEstimate ({development: [{item, hours, cost}], monthly: [{item, cost, notes}], totalMvpBudget, monthlyRunRate}),
competitiveLandscape ({competitors: [{name, strength, weakness}], differentiator}),
futureScope ({v2Features: [{feature, rationale, estimatedEffort}], longTermVision, scalingConsiderations}),
risks (array of {risk, severity, mitigation}), 
monetization (string), nextSteps (array of strings).
Be specific, practical, use real competitor names, real pricing. No markdown fences. Pure JSON only."""


def call_gemini(idea: str, retries: int = 3) -> dict:
    """Call Gemini API with retry + exponential backoff."""
    payload = json.dumps({
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": f'Generate a complete MVP specification for: "{idea}"'}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.7,
            "maxOutputTokens": 8192,
        },
    }).encode("utf-8")

    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                URL,
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = json.loads(resp.read().decode())
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                # Strip markdown fences if present
                text = text.strip()
                if text.startswith("```"):
                    text = text.split("\n", 1)[1] if "\n" in text else text[3:]
                    if text.endswith("```"):
                        text = text[:-3]
                return json.loads(text.strip())

        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = (2 ** attempt) * 2
                print(f"⏳ Rate limited. Waiting {wait}s before retry {attempt + 1}/{retries}...")
                time.sleep(wait)
                continue
            body = e.read().decode() if e.fp else ""
            raise RuntimeError(f"API error {e.code}: {body[:300]}")

        except json.JSONDecodeError:
            raise RuntimeError("Gemini returned invalid JSON. Try again.")

    raise RuntimeError("API busy after retries. Wait 60s and try again.")


def print_spec(spec: dict):
    """Pretty-print the spec to terminal."""
    print("\n" + "=" * 60)
    print(f"  🚀 {spec.get('projectName', 'Untitled')}")
    print(f"  {spec.get('tagline', '')}")
    print("=" * 60)

    # Problem
    print(f"\n📋 PROBLEM STATEMENT\n{spec.get('problemStatement', 'N/A')}")

    # Users
    print("\n👥 TARGET USERS")
    for u in spec.get("targetUsers", []):
        print(f"  • {u['persona']}: {u['description']}")
        for pp in u.get("painPoints", []):
            print(f"    - {pp}")

    # Features
    print("\n⚡ CORE FEATURES")
    for priority in ["must", "should", "could"]:
        items = spec.get("coreFeatures", {}).get(priority, [])
        if items:
            print(f"  [{priority.upper()} HAVE]")
            for f in items:
                print(f"    • {f['feature']} — {f['rationale']}")

    # Tech Stack
    print("\n🛠 TECH STACK")
    for cat, techs in spec.get("techStack", {}).items():
        if techs:
            print(f"  {cat}: {', '.join(techs)}")

    # Timeline
    print("\n📅 TIMELINE")
    for p in spec.get("mvpTimeline", []):
        print(f"  {p['phase']} ({p['weeks']})")
        for t in p.get("tasks", []):
            print(f"    → {t}")

    # Costing
    cost = spec.get("costEstimate", {})
    print(f"\n💰 COST ESTIMATE")
    print(f"  Total MVP Budget: {cost.get('totalMvpBudget', 'N/A')}")
    print(f"  Monthly Run Rate: {cost.get('monthlyRunRate', 'N/A')}")
    for d in cost.get("development", []):
        print(f"    • {d['item']}: {d['hours']} — {d['cost']}")

    # Competitors
    cl = spec.get("competitiveLandscape", {})
    if cl:
        print(f"\n🏆 COMPETITORS")
        print(f"  Differentiator: {cl.get('differentiator', 'N/A')}")
        for c in cl.get("competitors", []):
            print(f"  • {c['name']}: ✓ {c['strength']} | ✗ {c['weakness']}")

    # Risks
    print("\n⚠️  RISKS")
    for r in spec.get("risks", []):
        print(f"  [{r['severity'].upper()}] {r['risk']}")
        print(f"    Mitigation: {r['mitigation']}")

    # Monetization
    print(f"\n💵 MONETIZATION\n{spec.get('monetization', 'N/A')}")

    # Next Steps
    print("\n🎯 NEXT STEPS (First 7 Days)")
    for i, s in enumerate(spec.get("nextSteps", []), 1):
        print(f"  {i}. {s}")

    print("\n" + "=" * 60)


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 test_api.py \"Your startup idea here\"")
        print("Example: python3 test_api.py \"AI-powered meal planner for fitness enthusiasts\"")
        sys.exit(1)

    idea = " ".join(sys.argv[1:])
    print(f"🔄 Generating MVP spec for: \"{idea}\"")
    print(f"   Model: {MODEL}")
    print(f"   This takes 15-30 seconds...\n")

    try:
        spec = call_gemini(idea)
        print_spec(spec)

        # Save JSON to file
        outfile = "spec_output.json"
        with open(outfile, "w") as f:
            json.dump(spec, f, indent=2)
        print(f"\n✅ Full JSON saved to {outfile}")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
