import type { AgentMemoryCardView, AgentMemoryView } from "./memoryModel";

export const renderAgentMemory = (memory: AgentMemoryView | null): string => {
  if (!memory) {
    return `<div class="empty">Loading agent memory projection...</div>`;
  }
  if (memory.cards.length === 0) {
    return `
      <section class="memory-workbench">
        <header class="memory-header">
          <div>
            <p class="eyebrow">Agent memory</p>
            <h2>No active memory cards</h2>
            <p>The current Org source has no visible :memory: records for the agent memory profile.</p>
          </div>
        </header>
      </section>
    `;
  }
  return `
    <section class="memory-workbench" aria-label="Agent memory">
      <header class="memory-header">
        <div>
          <p class="eyebrow">Agent memory</p>
          <h2>Org-native memory graph</h2>
          <p>Facts promoted from ordinary Org headings, properties, links, planning timestamps, and lifecycle evidence.</p>
        </div>
        ${renderMemoryMetrics(memory)}
      </header>
      <div class="memory-layout">
        <section class="memory-stream" aria-label="Memory cards">
          ${memory.cards.map(renderMemoryCard).join("")}
        </section>
        <aside class="memory-inspector" aria-label="Agent memory contract">
          <div class="memory-inspector-section">
            <p class="eyebrow">Recall contract</p>
            <h3>What the agent may use</h3>
            <p>Each card keeps a fact, its source location, evidence categories, authority reasons, and the next decision rule together.</p>
          </div>
          <div class="memory-inspector-section">
            <p class="eyebrow">Compact prompt view</p>
            <pre><code>${escapeHtml(memory.rawText)}</code></pre>
          </div>
        </aside>
      </div>
    </section>
  `;
};

const renderMemoryMetrics = (memory: AgentMemoryView): string => `
  <dl class="memory-metrics" aria-label="Memory metrics">
    <div>
      <dt>cards</dt>
      <dd>${memory.stats.cards}</dd>
    </div>
    <div>
      <dt>action</dt>
      <dd>${memory.stats.actionCards}</dd>
    </div>
    <div>
      <dt>evidence</dt>
      <dd>${memory.stats.evidence}</dd>
    </div>
    <div>
      <dt>authority</dt>
      <dd>${memory.stats.authority}</dd>
    </div>
  </dl>
`;

const renderMemoryCard = (card: AgentMemoryCardView): string => `
  <article class="memory-card memory-card--${memoryTone(card)}">
    <header>
      <span>${escapeHtml(card.code)}</span>
      <strong>${escapeHtml(card.severity)}</strong>
      <small>${escapeHtml(card.source || "source pending")}</small>
    </header>
    <h3>${escapeHtml(card.fact)}</h3>
    <p>${escapeHtml(card.title)}</p>
    ${renderTags(card)}
    <div class="memory-card-grid">
      ${renderMemoryList("Evidence", card.evidence)}
      ${renderMemoryList("Authority", card.authority)}
      ${renderMemoryList("Links", card.links)}
    </div>
    ${
      card.next
        ? `<div class="memory-next"><span>next</span><p>${escapeHtml(card.next)}</p></div>`
        : ""
    }
  </article>
`;

const renderTags = (card: AgentMemoryCardView): string => {
  const tags = [card.state, ...card.tags].filter((tag): tag is string => Boolean(tag));
  return tags.length > 0
    ? `<div class="memory-tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>`
    : "";
};

const renderMemoryList = (label: string, items: string[]): string => `
  <section>
    <h4>${escapeHtml(label)}</h4>
    ${
      items.length > 0
        ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
        : `<p>None</p>`
    }
  </section>
`;

const memoryTone = (card: AgentMemoryCardView): string => {
  const severity = card.severity.toLowerCase();
  if (severity === "action") return "action";
  if (severity === "suppressed") return "suppressed";
  return "info";
};

const escapeHtml = (value: string | number): string =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
