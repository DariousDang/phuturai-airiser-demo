import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  ClipboardText,
  Cloud,
  Copy,
  Desktop,
  HourglassMedium,
  Lightbulb,
  Quotes,
  ShieldCheck,
  Sparkle,
  UserCircle,
  Warning,
  WifiSlash,
} from "@phosphor-icons/react";
import { analyzeTranscript, askTranscript, getProviderStatus } from "./api";
import { SAMPLE_TRANSCRIPT, SUGGESTED_QUESTIONS } from "./data";
import type { Analysis, Answer, CitedItem, Evidence, ProviderStatus } from "./types";

type View = "brief" | "actions" | "ask";

function Citation({ evidence }: { evidence: Evidence }) {
  const lineLabel = evidence.lineStart === evidence.lineEnd
    ? `Line ${evidence.lineStart}`
    : `Lines ${evidence.lineStart}–${evidence.lineEnd}`;

  return (
    <details className="citation">
      <summary><Quotes size={14} weight="fill" /> {lineLabel}</summary>
      <blockquote>{evidence.quote}</blockquote>
    </details>
  );
}

function CitedList({ items, empty }: { items: CitedItem[]; empty: string }) {
  if (!items.length) return <p className="empty-copy">{empty}</p>;
  return (
    <ul className="cited-list">
      {items.map((item, index) => (
        <li key={`${item.text}-${index}`}>
          <CheckCircle size={18} weight="fill" aria-hidden="true" />
          <div>
            <p>{item.text}</p>
            <Citation evidence={item.evidence} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function LoadingState({ provider }: { provider: ProviderStatus | null }) {
  const local = provider?.provider !== "gemini";
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-orbit" aria-hidden="true"><Sparkle size={22} weight="fill" /></div>
      <div>
        <strong>Building verified memory</strong>
        <p>{local ? "Local Gemma is tracing every claim back to its source." : "The hosted preview is tracing every claim back to its source."}</p>
      </div>
      <div className="skeleton-lines" aria-hidden="true"><span /><span /><span /></div>
    </div>
  );
}

function EmptyState({ provider }: { provider: ProviderStatus | null }) {
  const local = provider?.provider !== "gemini";
  return (
    <div className="empty-state">
      <div className="empty-mark" aria-hidden="true"><Sparkle size={26} weight="fill" /></div>
      <p className="eyebrow">Ready to remember</p>
      <h2>Raw conversation in. Verified knowledge out.</h2>
      <p>{local ? "Gemma analyzes the transcript on this machine, revealing decisions, owners, deadlines, risks, and exact source lines." : "This hosted preview reveals decisions, owners, deadlines, risks, and exact source lines."}</p>
      <div className="empty-proof">
        <span><ShieldCheck size={16} weight="fill" /> Evidence attached</span>
        <span>{local ? <Desktop size={16} weight="fill" /> : <Cloud size={16} weight="fill" />} {local ? "Runs on this device" : "Hosted judge preview"}</span>
      </div>
    </div>
  );
}

function BriefView({ analysis }: { analysis: Analysis }) {
  return (
    <div className="result-stack">
      <section className="summary-block">
        <p className="eyebrow">Conversation brief</p>
        <h2>{analysis.title}</h2>
        <p className="summary-copy">{analysis.summary}</p>
      </section>

      <section className="knowledge-section">
        <div className="section-heading"><Lightbulb size={19} weight="fill" /><h3>Decisions</h3><span>{analysis.decisions.length}</span></div>
        <CitedList items={analysis.decisions} empty="No explicit decisions found." />
      </section>

      <div className="knowledge-columns">
        <section className="knowledge-section compact">
          <div className="section-heading"><ClipboardText size={19} weight="fill" /><h3>Facts</h3><span>{analysis.facts.length}</span></div>
          <CitedList items={analysis.facts} empty="No key facts found." />
        </section>
        <section className="knowledge-section compact risk-section">
          <div className="section-heading"><Warning size={19} weight="fill" /><h3>Risks</h3><span>{analysis.risks.length}</span></div>
          <CitedList items={analysis.risks} empty="No explicit risks found." />
        </section>
      </div>
    </div>
  );
}

function ActionsView({ analysis }: { analysis: Analysis }) {
  return (
    <section className="actions-view">
      <div className="actions-intro">
        <div><p className="eyebrow">Execution memory</p><h2>Every promise has an owner.</h2></div>
        <span>{analysis.actions.length} actions</span>
      </div>
      {analysis.actions.length ? (
        <div className="action-table">
          {analysis.actions.map((action, index) => (
            <article className="action-row" key={`${action.task}-${index}`}>
              <span className="action-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="action-main"><h3>{action.task}</h3><Citation evidence={action.evidence} /></div>
              <div className="action-meta"><span><UserCircle size={16} /> Owner</span><strong>{action.owner}</strong></div>
              <div className="action-meta"><span><HourglassMedium size={16} /> Due</span><strong>{action.deadline}</strong></div>
            </article>
          ))}
        </div>
      ) : <p className="empty-copy">No explicit action items found.</p>}
    </section>
  );
}

function AskView({ transcript, analysis }: { transcript: string; analysis: Analysis }) {
  const [question, setQuestion] = useState(SUGGESTED_QUESTIONS[0]);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  async function submitQuestion(nextQuestion = question) {
    const cleanQuestion = nextQuestion.trim();
    if (!cleanQuestion || asking) return;
    setQuestion(cleanQuestion);
    setAsking(true);
    setError("");
    try {
      setAnswer(await askTranscript(transcript, cleanQuestion));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Question failed.");
    } finally {
      setAsking(false);
    }
  }

  return (
    <section className="ask-view">
      <div className="ask-intro">
        <p className="eyebrow">Ask the memory</p>
        <h2>Answers that show their work.</h2>
        <p>Phuturai answers from this conversation only. When the evidence is missing, it says so.</p>
      </div>
      <div className="question-suggestions">
        {SUGGESTED_QUESTIONS.map((suggestion) => (
          <button type="button" key={suggestion} onClick={() => void submitQuestion(suggestion)} disabled={asking}>{suggestion}</button>
        ))}
      </div>
      <form className="question-form" onSubmit={(event) => { event.preventDefault(); void submitQuestion(); }}>
        <label htmlFor="question">Question about “{analysis.title}”</label>
        <div className="question-control">
          <input id="question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about a decision, person, or deadline" />
          <button type="submit" disabled={asking || question.trim().length < 3} aria-label="Ask transcript">
            {asking ? <span className="button-loader" /> : <ArrowRight size={20} weight="bold" />}
          </button>
        </div>
      </form>
      {error && <p className="inline-error" role="alert">{error}</p>}
      {answer && (
        <div className={`answer-block ${answer.confidence}`} aria-live="polite">
          <div className="answer-label">
            <span><Sparkle size={15} weight="fill" /> {answer.meta.mode === "ollama" ? "Local Gemma answer" : answer.meta.mode === "gemini" ? "Hosted Gemini answer" : "Rehearsal answer"}</span>
            <span className="confidence">{answer.confidence.replace("_", " ")}</span>
          </div>
          <p>{answer.answer}</p>
          {answer.citations.map((citation, index) => <Citation key={index} evidence={citation} />)}
        </div>
      )}
    </section>
  );
}

export default function App() {
  const [transcript, setTranscript] = useState(SAMPLE_TRANSCRIPT);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [view, setView] = useState<View>("brief");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);

  useEffect(() => {
    let active = true;
    void getProviderStatus()
      .then((status) => { if (active) setProviderStatus(status); })
      .catch(() => {
        if (active) setProviderStatus({ provider: "ollama", model: "gemma4:12b", ready: false, privacy: "local" });
      });
    return () => { active = false; };
  }, []);

  const lineCount = useMemo(() => transcript.split(/\r?\n/).length, [transcript]);
  const wordCount = useMemo(() => transcript.trim().split(/\s+/).filter(Boolean).length, [transcript]);

  async function analyze() {
    if (loading || transcript.trim().length < 40) return;
    setLoading(true);
    setError("");
    setAnalysis(null);
    try {
      const result = await analyzeTranscript(transcript);
      setAnalysis(result);
      setView("brief");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  async function copyKnowledge() {
    if (!analysis) return;
    const content = [
      analysis.title,
      analysis.summary,
      "",
      "Decisions",
      ...analysis.decisions.map((item) => `• ${item.text} [Lines ${item.evidence.lineStart}-${item.evidence.lineEnd}]`),
      "",
      "Actions",
      ...analysis.actions.map((item) => `• ${item.task} | ${item.owner} | ${item.deadline}`),
    ].join("\n");
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const resolvedProvider = analysis?.meta.mode || providerStatus?.provider;
  const statusLabel = providerStatus === null
    ? "Checking local model"
    : providerStatus.provider === "ollama" && providerStatus.ready
      ? `Local ${providerStatus.model}`
      : providerStatus.provider === "ollama"
        ? "Local model offline"
        : providerStatus.provider === "gemini"
          ? "Hosted Gemini preview"
          : "Rehearsal mode";

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="/" aria-label="Phuturai home">
          <span className="brand-mark"><span /></span>
          <span>Phuturai</span>
        </a>
        <div className="model-status">
          {providerStatus?.provider === "ollama" && !providerStatus.ready
            ? <WifiSlash size={15} aria-hidden="true" />
            : <span className={`status-dot ${resolvedProvider === "demo" ? "demo" : ""}`} />}
          {statusLabel}
        </div>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow">Private, verified AI memory</p>
          <h1>Your memory stays yours.</h1>
        </div>
        <p>Turn conversations into cited knowledge with Gemma running on your own machine. No meeting transcript needs to leave the device.</p>
      </section>

      <section className="workspace">
        <div className="transcript-panel">
          <div className="panel-heading">
            <div><span className="step">01</span><div><p className="eyebrow">Source</p><h2>Conversation transcript</h2></div></div>
            <button type="button" className="text-button" onClick={() => { setTranscript(SAMPLE_TRANSCRIPT); setAnalysis(null); setError(""); }}>Load sample</button>
          </div>
          <div className={`privacy-banner ${providerStatus?.privacy === "hosted" ? "hosted" : ""}`}>
            {providerStatus?.privacy === "hosted" ? <Cloud size={16} weight="fill" /> : <ShieldCheck size={16} weight="fill" />}
            <span>{providerStatus?.privacy === "hosted" ? "Hosted competition preview" : "Local processing · No transcript upload"}</span>
          </div>
          <label className="sr-only" htmlFor="transcript">Meeting transcript</label>
          <textarea
            id="transcript"
            value={transcript}
            onChange={(event) => { setTranscript(event.target.value); setAnalysis(null); }}
            spellCheck="false"
            placeholder="Paste a transcript with speakers, decisions, and action items..."
          />
          <div className="transcript-footer">
            <span>{lineCount} lines · {wordCount} words</span>
            <button className="primary-button" type="button" onClick={() => void analyze()} disabled={loading || transcript.trim().length < 40}>
              <span>{loading ? "Tracing evidence" : "Build knowledge"}</span>
              <span className="button-icon">{loading ? <span className="button-loader dark" /> : <ArrowRight size={18} weight="bold" />}</span>
            </button>
          </div>
          {error && <p className="panel-error" role="alert"><Warning size={16} weight="fill" /> {error}</p>}
        </div>

        <div className="memory-panel">
          <div className="memory-toolbar">
            <div className="view-tabs" role="tablist" aria-label="Knowledge views">
              {(["brief", "actions", "ask"] as View[]).map((tab) => (
                <button key={tab} role="tab" type="button" aria-selected={view === tab} onClick={() => setView(tab)} disabled={!analysis}>
                  {tab === "ask" ? "Ask memory" : tab[0].toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            {analysis && <button type="button" className="copy-button" onClick={() => void copyKnowledge()}><Copy size={16} /> {copied ? "Copied" : "Copy"}</button>}
          </div>
          <div className="memory-content">
            {loading ? <LoadingState provider={providerStatus} /> : !analysis ? <EmptyState provider={providerStatus} /> : view === "brief" ? (
              <BriefView analysis={analysis} />
            ) : view === "actions" ? (
              <ActionsView analysis={analysis} />
            ) : (
              <AskView transcript={transcript} analysis={analysis} />
            )}
          </div>
          {analysis && (
            <footer className="memory-footer">
              <span><ShieldCheck size={15} weight="fill" /> {analysis.meta.lineCount} source lines checked</span>
              <span>{analysis.meta.mode === "ollama" ? `${analysis.meta.model} · On-device` : analysis.meta.mode === "gemini" ? `${analysis.meta.model} · Hosted preview` : "Local rehearsal data"}</span>
            </footer>
          )}
        </div>
      </section>
    </main>
  );
}
