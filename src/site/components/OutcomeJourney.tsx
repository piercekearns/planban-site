import "../outcome-journey.css";

// One fictional Item followed from idea to accepted outcome. Nothing here is real Planban roadmap content.
const stages = [{
  label: "Scoped",
  actor: "Agent",
  status: "Pending",
  line: "Spec written: purpose, scope, acceptance.",
  caption: "From a note or an issue."
}, {
  label: "Planned",
  actor: "Agent",
  status: "Up Next",
  line: "Plan: 3 phases, owner gate after phase 1.",
  caption: "Only when the work needs one."
}, {
  label: "Building",
  actor: "Agent",
  status: "In Progress",
  line: "Phase 2 of 3. Runs behind a flag.",
  caption: "The blue edge means an agent is on it now.",
  live: true
}, {
  label: "Needs you",
  actor: "You",
  status: "In Progress",
  line: "Owner: try it on a real repo, then ship or revise.",
  caption: "One next action says what to decide.",
  owner: true
}, {
  label: "Done",
  actor: "You",
  status: "Complete",
  line: "Shipped in v1.2. Accepted by you.",
  caption: "Only you mark it Complete.",
  done: true
}] as const;

export const OutcomeJourney = () => <div className="pb-journey">
    <div className="pb-journey-item">
      <span className="pb-journey-item-label">Following one Item</span>
      <strong>Import Items from GitHub issues</strong>
      <em>P1</em>
    </div>
    <ol className="pb-journey-track" aria-label="The Item from scoped to done">
      {stages.map(stage => <li className={`pb-journey-stage ${"done" in stage ? "is-done" : ""}`} key={stage.label}>
          <div className="pb-journey-head">
            <span className={`pb-journey-actor ${stage.actor === "You" ? "you" : "agent"}`}>{stage.actor}</span>
            <strong>{stage.label}</strong>
          </div>
          <div className="pb-live-card pb-journey-card">
            {"live" in stage ? <span className="pb-live-activity" aria-hidden="true"><i /><i /><i /><i /></span> : null}
            <span className={`pb-journey-status s-${stage.status.toLowerCase().replace(" ", "-")}`}>{stage.status}</span>
            <div className={`s ${"owner" in stage ? "owner" : ""}`}>{stage.line}</div>
          </div>
          <p className="pb-journey-caption">{stage.caption}</p>
        </li>)}
    </ol>
  </div>;
