import type { SuperAgendaProgram, SuperAgendaSelector } from "./agendaTypes";
import type { AgendaModeKey } from "./config";
import { buildProgram, rule } from "./agendaProgramSource";

type AgendaModeDefinition = {
  label: string;
  description: string;
};

const selector = {
  and: (...selectors: SuperAgendaSelector[]): SuperAgendaSelector => ({ kind: "and", selectors }),
  auto: (
    by: "category" | "planning" | "priority" | "property" | "tags" | "todo",
    property?: string,
  ): SuperAgendaSelector => ({ kind: "auto", by, property }),
  discard: (inner: SuperAgendaSelector): SuperAgendaSelector => ({
    kind: "discard",
    selector: inner,
  }),
  not: (inner: SuperAgendaSelector): SuperAgendaSelector => ({ kind: "not", selector: inner }),
  or: (...selectors: SuperAgendaSelector[]): SuperAgendaSelector => ({ kind: "or", selectors }),
  effort: (operator: "<=" | ">=", value: string): SuperAgendaSelector => ({
    kind: "effort",
    operator,
    value,
  }),
  priority: (operator: "<=" | "=" | ">=", value: string): SuperAgendaSelector => ({
    kind: "priority",
    operator,
    value,
  }),
  property: (key: string, values?: string[]): SuperAgendaSelector => ({
    kind: "property",
    key,
    values,
  }),
  tag: (...values: string[]): SuperAgendaSelector => ({ kind: "tag", values }),
  take: (count: number, inner: SuperAgendaSelector): SuperAgendaSelector => ({
    kind: "take",
    count,
    selector: inner,
  }),
  todo: (...values: string[]): SuperAgendaSelector => ({ kind: "todo", values }),
};

const atomic = {
  anything: { kind: "anything" } as SuperAgendaSelector,
  blocked: { kind: "blocked" } as SuperAgendaSelector,
  closed: { kind: "closed" } as SuperAgendaSelector,
  deadline: { kind: "deadline" } as SuperAgendaSelector,
  done: { kind: "done" } as SuperAgendaSelector,
  memory: { kind: "memory" } as SuperAgendaSelector,
  scheduled: { kind: "scheduled" } as SuperAgendaSelector,
  timeGrid: { kind: "time-grid" } as SuperAgendaSelector,
};

export const agendaPrograms: Record<AgendaModeKey, SuperAgendaProgram> = {
  classic: buildProgram({
    key: "classic",
    label: "Classic Super Agenda",
    shortLabel: "Classic",
    description: "A browser version of the README pattern: today, important, waiting, backlog.",
    intent: "Make the consume order legible while preserving the daily agenda surface.",
    rules: [
      rule({
        id: "today",
        title: "Today",
        subtitle: "Timed rows or explicit TODAY/NEXT execution state.",
        selector: selector.or(atomic.timeGrid, selector.todo("TODAY", "NEXT")),
        order: 0,
        tone: "focus",
        face: "time grid accent",
        transformer: "uppercase-title",
      }),
      rule({
        id: "important",
        title: "Important",
        subtitle: "Deadline pressure, blocker edges, priority A, and focus tags are pulled first.",
        selector: selector.or(
          atomic.deadline,
          atomic.blocked,
          selector.priority("<=", "A"),
          selector.tag("focus", "ops"),
        ),
        order: 0,
        tone: "deadline",
        transformer: "deadline-risk-label",
      }),
      rule({
        id: "context",
        title: "Record / Memory Context",
        subtitle: "Items carrying record, memory, attachment, or ID evidence.",
        selector: selector.or(atomic.memory, selector.tag("record", "memory", "attach")),
        order: 1,
        tone: "steady",
      }),
      rule({
        id: "waiting",
        title: "WAITING items",
        subtitle: "Parked rows stay visible but no longer pollute the execution lane.",
        selector: selector.todo("WAIT", "WAITING"),
        order: 8,
        tone: "waiting",
      }),
      rule({
        id: "someday",
        title: "Closed / Review Tail",
        subtitle: "Recent DONE/CLOSED rows are sorted near the end for review context.",
        selector: selector.or(atomic.done, atomic.closed),
        order: 9,
        tone: "done",
      }),
    ],
  }),
  strict: buildProgram({
    key: "strict",
    label: "Strict Consume Pipeline",
    shortLabel: "Strict",
    description: "Shows discard and take semantics explicitly before emitting final sections.",
    intent:
      "Use org-super-agenda as an explicit narrowing workflow instead of a decorative sorter.",
    rules: [
      rule({
        id: "discard-done",
        title: "Discard completed rows",
        subtitle: "Consumes DONE/CLOSED before the rest of the pipeline sees them.",
        selector: selector.discard(selector.or(atomic.done, atomic.closed)),
        order: -3,
        tone: "done",
      }),
      rule({
        id: "take-pressure",
        title: "Take first 3 pressure rows",
        subtitle: "A bounded working set: deadlines, blockers, and priority A win.",
        selector: selector.take(
          3,
          selector.or(atomic.deadline, atomic.blocked, selector.priority("<=", "A")),
        ),
        order: -2,
        tone: "critical",
      }),
      rule({
        id: "quick-effort",
        title: "Small effort wins",
        subtitle: "Effort-aware rows at or below one hour become quick execution candidates.",
        selector: selector.effort("<=", "1h"),
        order: -1,
        tone: "focus",
      }),
      rule({
        id: "ordered-front",
        title: "ORDERED project front",
        subtitle: "Parser-owned blocker edges expose the first actionable child.",
        selector: selector.and(atomic.blocked, selector.property("ID")),
        order: 0,
        tone: "critical",
      }),
      rule({
        id: "waiting",
        title: "Waiting state",
        subtitle: "Rows intentionally blocked by human or external dependency.",
        selector: selector.todo("WAIT", "WAITING"),
        order: 8,
        orderMulti: "tail-review",
        tone: "waiting",
      }),
      rule({
        id: "scheduled",
        title: "Remaining scheduled work",
        subtitle: "Everything scheduled after the narrowing rules has run.",
        selector: atomic.scheduled,
        order: 8,
        orderMulti: "tail-review",
        tone: "steady",
      }),
    ],
  }),
  auto: buildProgram({
    key: "auto",
    label: "Auto Grouping",
    shortLabel: "Auto",
    description: "Turns parser metadata into generated agenda sections.",
    intent: "Use :auto-* selectors as first-class UI structure, not hidden implementation detail.",
    rules: [
      rule({
        id: "auto-priority",
        title: "Priority",
        subtitle: "Creates generated sections from parsed priority cookies and agenda sort keys.",
        selector: selector.auto("priority"),
        order: -1,
        tone: "critical",
      }),
      rule({
        id: "auto-area",
        title: "AREA",
        subtitle: "Creates one section for each AREA property value.",
        selector: selector.auto("property", "AREA"),
        order: 0,
        tone: "focus",
      }),
      rule({
        id: "auto-todo",
        title: "TODO keyword",
        subtitle: "Remaining rows are grouped by TODO state.",
        selector: selector.auto("todo"),
        order: 3,
        tone: "steady",
      }),
      rule({
        id: "auto-tags",
        title: "Tag signature",
        subtitle: "Rows with the same effective tag set collapse into the same section.",
        selector: selector.auto("tags"),
        order: 5,
        tone: "waiting",
      }),
      rule({
        id: "auto-planning",
        title: "Planning date",
        subtitle: "Date buckets mirror :auto-planning for any remaining rows.",
        selector: selector.auto("planning"),
        order: 7,
        tone: "deadline",
      }),
    ],
  }),
  agent: buildProgram({
    key: "agent",
    label: "Agent Context Agenda",
    shortLabel: "Agent",
    description: "Connects agenda evidence with AI-ready context packs.",
    intent:
      "Bridge agenda grouping, parser receipts, and LLM handoff prompts without hiding rules.",
    rules: [
      rule({
        id: "agent-risk",
        title: "Risk handoff",
        subtitle: "Deadlines and blockers become the first agent brief.",
        selector: selector.and(
          selector.or(atomic.deadline, atomic.blocked),
          selector.not(selector.todo("WAIT", "WAITING")),
        ),
        order: -1,
        tone: "critical",
      }),
      rule({
        id: "agent-memory",
        title: "Memory-backed records",
        subtitle:
          "Rows with stable IDs, record tags, or parser receipts are useful prompt context.",
        selector: selector.or(
          atomic.memory,
          selector.property("ID"),
          selector.tag("record", "memory"),
        ),
        order: 0,
        tone: "focus",
        transformer: "agent-context-label",
      }),
      rule({
        id: "agent-attachment",
        title: "Attachment / artifact rows",
        subtitle: "Attachment and research rows are separated for retrieval-aware follow-up.",
        selector: selector.or(selector.tag("attach", "research"), selector.property("DIR")),
        order: 2,
        tone: "waiting",
      }),
      rule({
        id: "agent-log",
        title: "Progress log source",
        subtitle: "DONE/CLOSED rows supply recent progress memory.",
        selector: selector.or(atomic.done, atomic.closed),
        order: 8,
        tone: "done",
      }),
    ],
  }),
};

export const agendaModeDefinitions: Record<AgendaModeKey, AgendaModeDefinition> =
  Object.fromEntries(
    Object.entries(agendaPrograms).map(([key, program]) => [
      key,
      { label: program.shortLabel, description: program.description },
    ]),
  ) as Record<AgendaModeKey, AgendaModeDefinition>;
