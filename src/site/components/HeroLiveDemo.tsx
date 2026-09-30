import { useEffect, useState } from "react";
import "../hero-live.css";

type Host = "codex" | "claude";
type Theme = "light" | "dark";

interface HeroLiveDemoProps {
  theme: Theme;
  hostLogos: Record<Host, string>;
  planbanMark: string;
}

interface Scene {
  host: Host;
  hostLabel: string;
  prompt: string;
  working: string[];
  reply: string;
}

// A fictional product board for the landing page. Nothing here is a real Planban roadmap Item.
const scenes: Scene[] = [{
  host: "codex",
  hostLabel: "Codex",
  prompt: "Start on the GitHub import, then hand it back for my review.",
  working: ["Reading the Item and its Spec", "Moving it to In Progress", "Building the import behind a flag", "Updating the summary and next action"],
  reply: "The GitHub import is built behind a flag. I moved the Item to In Progress and set the next action to your review."
}, {
  host: "claude",
  hostLabel: "Claude",
  prompt: "Group the Markdown export, Group progress, and History tab under one outcome, and put export first.",
  working: ["Reading the three Items", "Creating the Group", "Ranking the export first", "Writing the Group objective"],
  reply: "Created the Group “Read the Board anywhere” with the three Items inside. Export is ranked first, and the Group shows 0 of 3 complete."
}];

// step: 0 idle, 1 typing, 2 working, 3 board change, 4 reply, 5 hold, 6 reset
const stepDurations = [900, 3200, 3800, 1300, 3600, 4200, 700];
const workingLineInterval = 900;

const Folder = () => <i className="pb-live-folder" aria-hidden="true" />;

type Activity = "on" | "fading" | null;

const Card = ({ title, priority, summary, live, moved, group, progress, snapshot }: {
  title: string;
  priority: string;
  summary?: string;
  live?: Activity;
  moved?: boolean;
  group?: boolean;
  progress?: { done: number; active: number };
  snapshot?: Array<{ label: string; status: string; tone?: "ok" }>;
}) => <article className={`pb-live-card ${moved ? "moved" : ""}`}>
    {live ? <span className={`pb-live-activity ${live === "fading" ? "is-fading" : ""}`} aria-hidden="true"><i /><i /><i /><i /></span> : null}
    <div className="t"><span>{group ? <Folder /> : null}{title}</span><em>{priority}</em></div>
    {summary ? <div className="s">{summary}</div> : null}
    {progress ? <div className="pb"><i className="d" style={{ width: `${progress.done}%` }} /><i className="a" style={{ width: `${progress.active}%` }} /></div> : null}
    {snapshot ? <div className="snap">{snapshot.map(row => <div key={row.label}><span>{row.label}</span><b className={row.tone ?? ""}>{row.status}</b></div>)}</div> : null}
  </article>;

interface BoardState {
  sceneOne: boolean;
  changed: boolean;
  working: boolean;
  fading?: boolean;
}

export const DemoBoard = ({ planbanMark, state, compact = false }: { planbanMark: string; state: BoardState; compact?: boolean }) => {
  const { sceneOne, changed, working, fading = false } = state;
  const activity: Activity = working ? "on" : fading ? "fading" : null;
  const importMoved = sceneOne && changed;
  const grouped = !sceneOne && changed;
  return <div className={`pb-live-board ${compact ? "compact" : ""}`}>
    <div className="pb-live-board-head">
      <img src={planbanMark} alt="" width={18} height={14} />
      <span className="pb-live-crumb"><small>Planban /</small> Next release</span>
    </div>
    <div className="pb-live-columns">
      <div className="pb-live-column">
        <div className="pb-live-colh">In Progress <b>{importMoved ? 2 : 1}</b></div>
        {importMoved ? <Card title="Import Items from GitHub issues" priority="P1" live={activity} moved summary="Import runs behind a flag on the import branch. Owner: try it on a real repository, then decide whether to ship or revise." /> : null}
        <Card title="Add keyboard shortcuts for moving Items" priority="P1" summary="Shortcuts call the same move operation as drag. Verifying focus handling after a move." />
      </div>
      <div className="pb-live-column">
        <div className="pb-live-colh">Up Next <b>{importMoved ? 1 : 2}</b></div>
        {!importMoved ? <Card title="Import Items from GitHub issues" priority="P1" live={sceneOne ? activity : null} summary="Turn a filtered issue list into draft Items with titles, summaries, and links back to each issue." /> : null}
        <Card title="Board search and filters" priority="P1" group progress={{ done: 33, active: 34 }} snapshot={[{ label: "Search by title and id", status: "In Progress" }, { label: "Filter by tag and Status", status: "In Progress" }, { label: "Keep filters in the URL", status: "Complete", tone: "ok" }]} />
      </div>
      <div className="pb-live-column">
        <div className="pb-live-colh">Pending <b>{grouped ? 2 : 4}</b></div>
        {grouped ? <Card title="Read the Board anywhere" priority="P1" group live={activity} moved progress={{ done: 0, active: 0 }} snapshot={[{ label: "Export a Board to Markdown", status: "Pending" }, { label: "Show Group progress on the Main Board", status: "Pending" }, { label: "Add a History tab to Item details", status: "Pending" }]} /> : <>
          <Card title="Export a Board to Markdown" priority="P1" live={!sceneOne ? activity : null} />
          <Card title="Show Group progress on the Main Board" priority="P2" live={!sceneOne ? activity : null} />
          <Card title="Add a History tab to Item details" priority="P3" live={!sceneOne ? activity : null} />
        </>}
        <Card title="Archive and restore Boards" priority="P2" />
      </div>
    </div>
  </div>;
};

export const DemoItemDetail = () => <div className="pb-live-detail">
    <div className="pb-live-detail-head">
      <span className="pb-live-detail-back" aria-hidden="true">←</span>
      <div><small>PLANBAN / NEXT RELEASE</small><strong>Import Items from GitHub issues</strong></div>
    </div>
    <div className="pb-live-detail-card">
      <div><small>Status</small><span className="pb-live-select">In Progress <i aria-hidden="true">⌄</i></span></div>
      <div><small>Next action</small><p>Owner: try the import on a real repository behind the flag, then decide whether to ship, revise, or hold for the next release.</p></div>
    </div>
    <div className="pb-live-detail-card">
      <div className="pb-live-tabs"><span className="active">Spec</span><span>Plan</span></div>
      <h4>Import Items from GitHub issues Spec</h4>
      <h5>Purpose</h5>
      <p>Planning that already lives in issues should become Items without retyping.</p>
      <h5>Target outcome</h5>
      <p>A filtered issue list becomes draft Items with titles, summaries, priorities, and links back, reviewed by the owner before they join the Board.</p>
    </div>
  </div>;

export const HeroLiveDemo = ({ theme, hostLogos, planbanMark }: HeroLiveDemoProps) => {
  // Start animated to match the server render; the effect below switches to the
  // settled frame for reduced-motion visitors after hydration.
  const [reducedMotion, setReducedMotion] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState(0);
  const [workIndex, setWorkIndex] = useState(0);
  const scene = scenes[sceneIndex] ?? scenes[0]!;

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener?.("change", sync);
    return () => media.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setStep(5);
      setTyped(scene.prompt.length);
      setWorkIndex(scene.working.length);
      return;
    }
    const timer = window.setTimeout(() => {
      if (step === 6) {
        setSceneIndex(index => (index + 1) % scenes.length);
        setTyped(0);
        setWorkIndex(0);
        setStep(0);
        return;
      }
      setStep(step + 1);
    }, stepDurations[step]);
    return () => window.clearTimeout(timer);
  }, [step, reducedMotion, scene.prompt.length, scene.working.length]);

  useEffect(() => {
    if (step !== 1 || reducedMotion) return;
    const total = scene.prompt.length;
    const interval = window.setInterval(() => {
      setTyped(current => (current >= total ? total : current + 1));
    }, Math.max(22, 2800 / total));
    return () => window.clearInterval(interval);
  }, [step, scene.prompt.length, reducedMotion]);

  useEffect(() => {
    if (step !== 2 || reducedMotion) return;
    setWorkIndex(0);
    const interval = window.setInterval(() => {
      setWorkIndex(current => Math.min(current + 1, scene.working.length));
    }, workingLineInterval);
    return () => window.clearInterval(interval);
  }, [step, scene.working.length, reducedMotion]);

  const sent = step >= 2;
  const working = step === 2 || step === 3;
  const changed = step >= 3;
  const replied = step >= 4;
  const fading = step === 4;
  const resetting = step === 6;
  const visibleLines = working || replied ? scene.working.slice(0, replied ? scene.working.length : Math.max(1, workIndex + 1)) : [];

  return <div className={`pb-live ${theme} host-${scene.host} ${resetting ? "is-resetting" : ""}`} role="img" aria-label="Animated demo: a prompt typed in Codex or Claude changes the Planban board beside it">
    <div className="pb-live-agent">
      <div className="pb-live-agent-head">
        <img src={hostLogos[scene.host]} alt="" width={18} height={18} />
        <strong>{scene.hostLabel}</strong>
        <span className="pb-live-agent-thread">new thread</span>
      </div>
      <div className="pb-live-thread">
        {sent ? <div className="pb-live-bubble user">{scene.prompt}</div> : null}
        {visibleLines.length ? <ul className="pb-live-working" aria-live="polite">
          {visibleLines.map((line, index) => {
            const isLast = index === visibleLines.length - 1;
            const done = replied || !isLast;
            return <li key={line} className={done ? "done" : "active"}>
              <i aria-hidden="true" />
              <span>{line}</span>
            </li>;
          })}
        </ul> : null}
        {replied ? <div className="pb-live-bubble agent">{scene.reply}</div> : null}
      </div>
      <div className={`pb-live-composer ${sent ? "is-sent" : ""}`}>
        <span className="pb-live-composer-text">{sent ? "" : scene.prompt.slice(0, typed)}<i className={`pb-live-caret ${step === 1 ? "on" : ""}`} aria-hidden="true" /></span>
        {!sent && typed === 0 ? <span className="pb-live-placeholder">Do anything</span> : null}
        <span className="pb-live-send" aria-hidden="true">↑</span>
      </div>
    </div>
    <DemoBoard planbanMark={planbanMark} state={{ sceneOne: sceneIndex === 0, changed, working, fading }} />
  </div>;
};
