import Link from "next/link";
import { indicators } from "@/data/indicators";

export const metadata = {
  title: "How it works — StreamVitals",
  description:
    "Why StreamVitals exists, how a monitoring session is assessed by deterministic rules, the published numbers, its honest limits, and what comes next.",
};

const pipeline = [
  {
    title: "Name the stream and the volunteer, start a session",
    body: "Session state persists in the browser (IndexedDB), so a refresh or a dropped connection on an open session does not erase what was recorded. Optionally capture the session's GPS location — it stays on the device, in the session record and its exports only.",
  },
  {
    title: "Choose one of the five official indicators",
    body: "Three are field-observable — BMI-01 Benthic Macroinvertebrates, BIR-04 Birds, INV-11 Invasive Alien Plants. Two are laboratory-only — FCL-06 Fecal Coliforms and DIA-10 Diatoms.",
  },
  {
    title: "Record what was observed",
    body: "Each field indicator offers exactly three observation states (nine states in total), plus photo capture and a field note. Lab indicators instead show a sample ID to write on the container and the factsheet's own collection protocol — pending lab analysis stays pending.",
  },
  {
    title: "The note check runs — deterministic, not AI",
    body: "Keyword and contradiction rules in src/lib/note-quality.ts flag assessment language ('healthy', 'tier 1', 'score') and notes that contradict the selected state. It warns, never blocks. 'Keep my note anyway' writes a note_flag that travels into the JSON and CSV exports instead of being hidden. Your note stays an observation; the assessment comes from the next step.",
  },
  {
    title: "The deterministic assessment runs — rules, not a model",
    body: "streamvitals-assessment/1.0.0 maps the observation state to a band (favorable / moderate / degraded, or pending for lab indicators) and attaches the chain of evidence: the rule that fired, the factsheet passage behind it, and the honesty caveats. The same state always produces the same band. The module never touches the network, the clock, or any AI — tests read its source and fail if it ever does.",
  },
  {
    title: "Ask the bounded Field Assistant",
    body: "In-scope protocol questions are answered from the OneAquaHealth factsheet text (Groq, openai/gpt-oss-120b, factsheet injected into the prompt). Meta questions and out-of-scope questions are answered locally with no model call at all. The assistant never scores — for health judgements it points back at the deterministic card.",
  },
  {
    title: "Review and export",
    body: "The review page shows exactly what was typed — names, states, notes, sample IDs — plus the session's assessment bands and, when a GPS location was captured, a GBIF baseline of records within 50 km (context only, labelled as such). Exports (CSV, JSON, print, Lab Submission Sheet) carry the bands, the engine version, the chain rule IDs, and the GPS coordinates. A share link (URL fragment + QR) moves the session to another device with no account — photos stay on the device that captured them.",
  },
];

const limits = [
  "Assessment is deterministic and auditable — but citizen states are tolerance/extent proxies, not laboratory indices: BMWP, IBD and IPS all require taxon-level lab identification (factsheet §§I, II).",
  "English-only UI. The factsheets are multilingual; the interface is not yet.",
  "Offline support is deliberately modest: a service worker lets already-visited pages reload without connectivity (asserted in the end-to-end suite) and shows a designed offline screen for pages that were never visited; the assistant and a first visit to any page still require a connection.",
  "The note-check rules and their tests were written by the same author, so the suite demonstrates self-consistency, not accuracy against a labelled corpus.",
  "Real-camera, real-sunlight readability testing on physical phones is pending; the end-to-end test runs in headless Chromium.",
  "Lab indicators produce no band in the field — a sample ID is not a measurement, and the rules refuse to grade what was not measured.",
];

const roadmap = [
  {
    title: "Field pilot",
    body: "Run the companion beside volunteers at OneAquaHealth research-city streams. The comparison we do not yet have — paper sheet versus phone on the same visit — is the validation this project still owes the framework.",
  },
  {
    title: "Multilingual volunteer labels",
    body: "The Key Indicators factsheets exist in several languages; volunteer-facing state labels currently exist in English only.",
  },
  {
    title: "Pipeline hand-off",
    body: "CSV/JSON exports already carry indicator IDs, states, notes, note flags, GPS, bands, and rule IDs in a fixed schema; the next step is ingesting them into the OneAquaHealth Citizen Science App pipeline instead of manual review.",
  },
  {
    title: "Server-side sync",
    body: "Share links cover device-to-device hand-off today (URL fragment + QR, no account). A real datastore with background replication and conflict handling is the next step — not claimed in this build.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fc]">
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-12">
        <div className="inline-flex items-center gap-2 mb-6 bg-[rgba(13,155,110,0.08)] border border-[rgba(13,155,110,0.15)] px-4 py-2 rounded-full">
          <span className="w-1.5 h-1.5 bg-[#0a7d58] rounded-full" />
          <span className="text-xs font-semibold text-[#075d44] tracking-wide uppercase">How it works</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-black leading-[1.05]">
          Record what was seen.
          <br />
          Never what should be concluded.
        </h1>
        <p className="text-lg text-[rgba(0,0,0,0.62)] leading-relaxed max-w-2xl mb-6">
          StreamVitals is the Field Companion submitted to the OneAquaHealth IEEE Global
          Hackathon 2026, Track 3. It walks a volunteer through the five official Key
          Indicators, keeps the observation structured, assesses it with deterministic
          rules you can audit line by line, and hands a reviewer clean, source-traceable
          data. Everything on this page can be checked against the repository or the
          live app.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/field" className="btn-pill-accent">
            Start monitoring
          </Link>
          <a href="https://github.com/kathir-iTech/streamvitals" className="btn-pill-outline">
            Open the repository
          </a>
        </div>
      </div>

      <section className="max-w-4xl mx-auto px-6 py-12 border-t border-[rgba(0,0,0,0.06)]">
        <h2 className="text-3xl font-black tracking-tighter mb-6 text-black">Why it exists</h2>
        <div className="space-y-4 text-[rgba(0,0,0,0.6)] leading-relaxed">
          <p>
            The OneAquaHealth Key Indicators factsheet tells research teams what to
            measure. A volunteer standing at a stream on a Saturday morning rarely has it
            open — and the sheet is written for specialists: Latin names, lab protocols,
            section numbers.
          </p>
          <p>
            When the sheet and the sighting do not line up, the free-text note fills the
            gap: <em>&ldquo;healthy stream.&rdquo;</em> That single word is an
            assessment, not an observation, and it is exactly what makes volunteer data
            unusable downstream. Most entries to a hackathon answer this by adding more
            AI on top. We made the assessment itself deterministic instead: rules score
            the observation, every score carries its chain of evidence, and AI stays at
            the edges where it explains — never where it judges.
          </p>
          <p className="text-black font-semibold">
            Deterministic rules assess. AI may explain — AI never scores.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12 border-t border-[rgba(0,0,0,0.06)]">
        <h2 className="text-3xl font-black tracking-tighter mb-2 text-black">
          Every indicator is a health indicator
        </h2>
        <p className="text-sm text-[rgba(0,0,0,0.62)] mb-8 leading-relaxed">
          Each card quotes the factsheet&apos;s own <em>Importance of indicator</em>{" "}
          section, carried verbatim in <code className="text-[#0a7d58]">indicators.json</code>{" "}
          as <code className="text-[#0a7d58]">why_this_matters</code> with its source
          section named. Nothing was paraphrased or invented.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {indicators.map((ind) => (
            <div
              key={ind.id}
              className="bg-white border border-[rgba(0,0,0,0.06)] rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    ind.lab_only
                      ? "bg-[rgba(232,93,58,0.1)] text-[#c2410c]"
                      : "bg-[rgba(13,155,110,0.08)] text-[#0a7d58]"
                  }`}
                >
                  {ind.id}
                </span>
                <span className="text-xs text-[rgba(0,0,0,0.55)]">
                  {ind.lab_only ? "Lab-only" : "Field-observable"}
                </span>
              </div>
              <h3 className="text-base font-bold text-black mb-2">{ind.name}</h3>
              <p className="text-sm text-[rgba(0,0,0,0.55)] leading-relaxed mb-3">
                &ldquo;{ind.why_this_matters}&rdquo;
              </p>
              <p className="text-xs text-[rgba(0,0,0,0.55)]">
                Source:{" "}
                {(ind.why_this_matters_source || "").replace(
                  "(factsheet_text.txt)",
                  "— OneAquaHealth Key Indicators Factsheets, doi:10.5281/zenodo.20345207"
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12 border-t border-[rgba(0,0,0,0.06)]">
        <h2 className="text-3xl font-black tracking-tighter mb-8 text-black">
          How a session runs
        </h2>
        <ol className="space-y-6">
          {pipeline.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="shrink-0 w-8 h-8 rounded-full bg-black text-white text-sm font-bold flex items-center justify-center"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="text-base font-bold text-black mb-1">{step.title}</h3>
                <p className="text-sm text-[rgba(0,0,0,0.55)] leading-relaxed">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="py-12 border-t border-[rgba(0,0,0,0.06)]">
        <div className="max-w-4xl mx-auto px-6 mb-8">
          <h2 className="text-3xl font-black tracking-tighter mb-2 text-black">
            Published numbers
          </h2>
          <p className="text-sm text-[rgba(0,0,0,0.62)]">
            Countable from the repository, not marketing estimates.
          </p>
        </div>
        <div className="stats-strip">
          <div className="stat-item">
            <span className="text-3xl font-black tracking-tighter text-[#0a7d58]">68</span>
            <span className="text-xs text-[rgba(0,0,0,0.62)] font-medium">
              Automated tests (Vitest)
            </span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="text-3xl font-black tracking-tighter text-[#0a7d58]">9</span>
            <span className="text-xs text-[rgba(0,0,0,0.62)] font-medium">
              Citizen observation states
            </span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="text-3xl font-black tracking-tighter text-[#0a7d58]">0</span>
            <span className="text-xs text-[rgba(0,0,0,0.62)] font-medium">
              AI calls in the assessment path
            </span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="text-3xl font-black tracking-tighter text-[#0a7d58]">
              ~1.9 s
            </span>
            <span className="text-xs text-[rgba(0,0,0,0.62)] font-medium">
              Median assistant answer (n=5)
            </span>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 pt-8 text-sm text-[rgba(0,0,0,0.62)] leading-relaxed space-y-3">
          <p>
            The end-to-end smoke test (Playwright) walks the entire session — states,
            note gate, sample IDs, assistant, export, frequencies — and fails if the
            review page ever shows data the volunteer did not enter. Screenshots from
            every run are committed under{" "}
            <code className="text-[#0a7d58]">tests/artifacts/</code>. A second spec
            scans five routes with axe-core and fails on any critical WCAG A/AA
            violation (currently zero violations at every impact level); a third cuts
            the network to prove already-visited pages reload from the service worker
            while uncached pages get the designed offline screen. The ~1.9 s figure
            is the median of five live probes against the deployed app on 2 October 2026
            (min 1.4 s, max 4.1 s); latency moves with the model provider.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12 border-t border-[rgba(0,0,0,0.06)]">
        <h2 className="text-3xl font-black tracking-tighter mb-6 text-black">
          Honest limits
        </h2>
        <ul className="space-y-3">
          {limits.map((limit) => (
            <li key={limit} className="flex gap-3 text-sm text-[rgba(0,0,0,0.6)] leading-relaxed">
              <span className="text-[#c2410c] font-bold shrink-0">×</span>
              <span>{limit}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12 border-t border-[rgba(0,0,0,0.06)]">
        <h2 className="text-3xl font-black tracking-tighter mb-6 text-black">
          Evidence you can check
        </h2>
        <ul className="space-y-3 text-sm leading-relaxed">
          <li>
            <a className="text-[#0a7d58] font-semibold hover:underline" href="https://streamvitals.vercel.app">
              streamvitals.vercel.app
            </a>{" "}
            <span className="text-[rgba(0,0,0,0.62)]">— the deployed app you are reading this from</span>
          </li>
          <li>
            <a className="text-[#0a7d58] font-semibold hover:underline" href="/provenance">
              /provenance
            </a>{" "}
            <span className="text-[rgba(0,0,0,0.62)]">
              — machine-readable track, DOI, citation, and AI-boundary statement
            </span>
          </li>
          <li>
            <a
              className="text-[#0a7d58] font-semibold hover:underline"
              href="https://doi.org/10.5281/zenodo.20345207"
            >
              doi:10.5281/zenodo.20345207
            </a>{" "}
            <span className="text-[rgba(0,0,0,0.62)]">
              — the source factsheets (CC-BY 4.0), 14 authors
            </span>
          </li>
          <li>
            <a
              className="text-[#0a7d58] font-semibold hover:underline"
              href="https://github.com/kathir-iTech/streamvitals"
            >
              github.com/kathir-iTech/streamvitals
            </a>{" "}
            <span className="text-[rgba(0,0,0,0.62)]">
              — run <code className="text-[#0a7d58]">npm test</code> for the 68 tests,
              <code className="text-[#0a7d58]"> npm run e2e</code> for the full session walkthrough
            </span>
          </li>
          <li>
            <code className="text-[#0a7d58]">src/lib/assessment/engine.ts</code>{" "}
            <span className="text-[rgba(0,0,0,0.62)]">
              — the whole assessment: rules, chains, caveats. Its test suite reads the
              source and fails if it ever imports a model, calls the network, or reads
              the clock.
            </span>
          </li>
        </ul>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12 border-t border-[rgba(0,0,0,0.06)]">
        <h2 className="text-3xl font-black tracking-tighter mb-6 text-black">
          What comes next
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roadmap.map((item, index) => (
            <div key={item.title} className="step-card">
              <span className="text-xs font-bold text-[#0a7d58] uppercase tracking-wider">
                {index + 1} of {roadmap.length}
              </span>
              <h3 className="text-base font-bold text-black mt-2 mb-2">{item.title}</h3>
              <p className="text-sm text-[rgba(0,0,0,0.55)] leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
