# StreamVitals

StreamVitals — OneAquaHealth IEEE Global Hackathon 2026, Track 3: AI-Supported Assessment

**We don't use AI to decide whether the stream is healthy; we use AI to make sure the thing being assessed is actually what the citizen observed.**

## What It Does

A citizen answers guided questions about an urban stream, or types a free-text observation. If they use free text, a bounded **AI Observation Quality Gate** converts it into structured fields — flagging contradictions and unsupported claims. The citizen confirms every field. A separate **deterministic evidence engine** (never called "AI") evaluates confirmed observations against real, cited rules from the OneAquaHealth Key Indicators Factsheets and produces a triage tier with a full **Rule Inspector** showing exactly which observation and which sourced rule produced it.

**AI may interpret input. AI may not adjudicate.**

## How It's Built

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **AI Layer**: Groq (`llama-3.1-8b-instant`) — bounded extraction only, never adjudication
- **Evidence Engine**: Pure TypeScript, zero network calls, named rules from cited factsheets
- **Validation**: Zod schemas for all AI outputs; manual fallback fully functional
- **FHIR Export**: FHIR R4 Bundle with QuestionnaireResponse and Observation resources
- **Testing**: Node.js test runner (38 evidence engine tests + 13 FHIR tests + 10 AI containment tests)

## Benchmark Results

```
Deterministic repeatability: 5/5 identical outputs
Invalid-input safety: 10/10 rejected correctly
Missing-data safety: 4/4 unknowns correctly prevented from becoming "healthy"
Rule traceability: 3/3 assessments linked to a source rule
AI schema validity: 3/3 candidate outputs conform to schema
AI containment: 10/10 hostile candidates rejected
Human-confirmation enforcement: 3/3 AI candidates blocked until confirmed
Evidence traceability: 3/3 drivers resolve to real indicator ID, rule, and source field
City separation: 1/1 same input → same verdict
FHIR schema conformance: 13/13 tests passed
Execution latency: p50=0.007ms, p95=0.033ms (100 iterations)
```

*Self-consistency / rule-conformance on internally constructed scenarios — not an accuracy claim.*

## How to Run Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run all tests
npm test

# Run evidence engine tests only
node run-tests.js

# Run FHIR tests only
node run-fhir-tests.js

# Run benchmark
node run-benchmark.js
```

## Architecture

1. **Intake**: Guided questions (with visual anchors) or free-text box
2. **AI Gate**: Extracts evidence spans, maps to fixed enum vocabulary, flags contradictions
3. **Confirmation**: Citizen reviews every field with evidence spans and confidence toggle
4. **Evidence Engine**: Deterministic rule-based assessment producing triage tier (T1/T2/T3) + data status (SUFFICIENT/PARTIAL/INSUFFICIENT)
5. **Rule Inspector**: Full chain — observation → indicator → rule → source citation → One Health text
6. **Reference Context**: Same observation against five OneAquaHealth research cities
7. **FHIR Export**: R4 Bundle with disclaimer: "draft implementation guide, not certified"
8. **Provenance Manifest**: Source file, URL, retrieval date, SHA-256, document version

## Data Sources

- **OneAquaHealth Key Indicators Factsheets**: Zenodo doi:10.5281/zenodo.20345207 (CC-BY 4.0, lead author Maria João Feio)
- **OAH-FHIR Implementation Guide**: https://build.fhir.org/ig/hl7-eu/oah/ (draft/CI-build, not certified)
- **Resilience Map**: https://apps.oneaquahealth.eu/resmap/ (client-side SPA)
- **Five Research Cities**: Coimbra (PT), Benevento (IT), Ghent (BE), Oslo (NO), Toulouse (FR)

## What's Next

- Per-city reference data population from OAH Resilience Map API
- Additional FHIR extensions confirmed in OAH CI-build
- Multilingual label expansion
- Vercel Hobby deployment with environment variables configured
