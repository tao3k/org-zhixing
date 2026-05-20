import type {
  SuperAgendaProgram,
  SuperAgendaSelector,
  SuperAgendaSelectorCapability,
} from "./agendaTypes";

export const selectorCapabilities: Omit<SuperAgendaSelectorCapability, "active">[] = [
  capability(
    "anything",
    ":anything",
    "Catch all",
    "core",
    "native",
    "Catch-all selector used for Other items and terminal discard rules.",
  ),
  capability(
    "deadline",
    ":deadline",
    "Deadline rows",
    "core",
    "parser-backed",
    "Backed by agendaView kind=deadline from native Org planning.",
  ),
  capability(
    "scheduled",
    ":scheduled",
    "Scheduled rows",
    "core",
    "parser-backed",
    "Backed by agendaView kind=scheduled.",
  ),
  capability(
    "time-grid",
    ":time-grid",
    "Timed rows",
    "core",
    "parser-backed",
    "Backed by parsed Org timestamps with start/end time.",
  ),
  capability(
    "todo",
    ":todo",
    "TODO keyword",
    "core",
    "parser-backed",
    "Uses parsed TODO keyword and done/todo state.",
  ),
  capability(
    "tag",
    ":tag",
    "Effective tags",
    "core",
    "parser-backed",
    "Uses inherited effectiveTags from the parser DTO.",
  ),
  capability(
    "category",
    ":category",
    "Category",
    "core",
    "parser-backed",
    "Available from agendaView category when present.",
  ),
  capability(
    "property",
    ":property",
    "Property drawer",
    "core",
    "parser-backed",
    "Matches parsed Org property drawer values such as AREA, ID, DIR, EFFORT.",
  ),
  capability(
    "log",
    ":log closed",
    "Closed log",
    "core",
    "partial",
    "Closed rows are available; full agenda log-mode clock separation is not wired yet.",
  ),
  capability(
    "children",
    ":children",
    "ORDERED blockers",
    "core",
    "agent-extension",
    "Org Zhixing exposes parser-owned blocker chains instead of recomputing children in TS.",
  ),
  capability(
    "implicit-or",
    "implicit OR",
    "Selector OR",
    "control",
    "native",
    "Multiple selector clauses in a rule are treated as an org-super-agenda OR group.",
  ),
  capability(
    "and",
    ":and",
    "Intersection",
    "control",
    "native",
    "All nested selectors must match before the rule consumes the item.",
  ),
  capability(
    "not",
    ":not",
    "Negation",
    "control",
    "native",
    "Inverts nested selector matches and composes with discard.",
  ),
  capability(
    "discard",
    ":discard",
    "Consume without section",
    "control",
    "native",
    "Matched rows are consumed and do not produce a visible group.",
  ),
  capability(
    "take",
    ":take",
    "Bounded group",
    "control",
    "native",
    "Emits first N matched rows and hides the rest from downstream selectors.",
  ),
  capability(
    "order",
    ":order",
    "Section order",
    "control",
    "native",
    "Groups are sorted by explicit order, then section name.",
  ),
  capability(
    "order-multi",
    ":order-multi",
    "Shared order",
    "control",
    "native",
    "Program source emits shared order blocks and the UI keeps each compiled section interactive.",
  ),
  capability(
    "auto-category",
    ":auto-category",
    "Auto category",
    "auto",
    "native",
    "Execution engine can bucket remaining rows by category.",
  ),
  capability(
    "auto-planning",
    ":auto-planning",
    "Auto planning",
    "auto",
    "native",
    "Buckets rows by display planning date.",
  ),
  capability(
    "auto-property",
    ":auto-property",
    "Auto property",
    "auto",
    "native",
    "Buckets rows by a selected property such as AREA.",
  ),
  capability(
    "auto-tags",
    ":auto-tags",
    "Auto tags",
    "auto",
    "native",
    "Buckets rows by exact effective tag signature.",
  ),
  capability(
    "auto-todo",
    ":auto-todo",
    "Auto TODO",
    "auto",
    "native",
    "Buckets rows by parsed TODO keyword.",
  ),
  capability(
    "auto-group",
    ":auto-group",
    "agenda-group property",
    "auto",
    "partial",
    'Can be expressed as :auto-property "agenda-group"; inheritance policy is still parser-dependent.',
  ),
  capability(
    "auto-priority",
    ":auto-priority",
    "Auto priority",
    "auto",
    "native",
    "Buckets remaining rows by parsed priority cookies exposed through agenda sort keys.",
  ),
  capability(
    "auto-outline-path",
    ":auto-outline-path",
    "Outline path",
    "auto",
    "planned",
    "The view index has outline strings; agenda cards still need stable outline-path linkage.",
  ),
  capability(
    "auto-parent",
    ":auto-parent",
    "Parent heading",
    "auto",
    "planned",
    "Requires parent identity in agenda DTO rather than title-only inference.",
  ),
  capability(
    "auto-ts",
    ":auto-ts",
    "Latest timestamp",
    "auto",
    "planned",
    "Requires a latest-timestamp projection beyond scheduled/deadline/closed.",
  ),
  capability(
    "auto-map",
    ":auto-map",
    "Custom grouping function",
    "auto",
    "planned",
    "Will need a safe typed callback model, not arbitrary browser eval.",
  ),
  capability(
    "face",
    ":face",
    "Visual face",
    "display",
    "partial",
    "Program metadata is preserved and group chrome exposes the token.",
  ),
  capability(
    "transformer",
    ":transformer",
    "Item transformer",
    "display",
    "native",
    "Safe typed transformers can relabel card titles without arbitrary browser eval.",
  ),
  capability(
    "priority",
    ":priority",
    "Priority selector",
    "advanced",
    "parser-backed",
    "Matches priority cookies from agenda sort keys with typed A/B/C comparison.",
  ),
  capability(
    "effort",
    ":effort<= / :effort>=",
    "Effort compare",
    "advanced",
    "parser-backed",
    "Parses EFFORT properties into minutes before comparing selector thresholds.",
  ),
  capability(
    "heading-regexp",
    ":heading-regexp",
    "Heading regexp",
    "advanced",
    "planned",
    "Title text is available, but regexp UI needs safe authoring.",
  ),
  capability(
    "regexp",
    ":regexp",
    "Agenda row regexp",
    "advanced",
    "planned",
    "Full row string matching should be backed by a stable rendered row contract.",
  ),
  capability(
    "pred",
    ":pred",
    "Predicate",
    "advanced",
    "planned",
    "Arbitrary predicates are intentionally deferred for safety and portability.",
  ),
  capability(
    "file-path",
    ":file-path",
    "File path",
    "advanced",
    "planned",
    "Needs source-file identity on agenda cards.",
  ),
  capability(
    "habit",
    ":habit",
    "Habit",
    "advanced",
    "planned",
    "Requires native habit metadata from the parser.",
  ),
  capability(
    "agent-memory",
    "agent:memory",
    "AI memory signal",
    "agent",
    "agent-extension",
    "Org Zhixing adds stable ID, receipts, and memory tags as agent-ready selectors.",
  ),
];

export const selectorCapabilityViews = (
  program: SuperAgendaProgram,
): SuperAgendaSelectorCapability[] => {
  const activeIds = activeCapabilityIds(program);
  return selectorCapabilities.map((capabilityItem) => ({
    ...capabilityItem,
    active:
      capabilityItem.id === "order"
        ? program.rules.some((programRule) => programRule.order !== 0)
        : activeIds.has(capabilityItem.id),
  }));
};

function capability(
  id: string,
  selectorName: string,
  label: string,
  family: SuperAgendaSelectorCapability["family"],
  status: SuperAgendaSelectorCapability["status"],
  detail: string,
): Omit<SuperAgendaSelectorCapability, "active"> {
  return { id, selector: selectorName, label, family, status, detail };
}

const activeCapabilityIds = (program: SuperAgendaProgram): Set<string> => {
  const ids = new Set<string>();
  for (const programRule of program.rules) {
    collectSelectorCapabilityIds(programRule.selector, ids);
    if (programRule.face) ids.add("face");
    if (programRule.orderMulti) ids.add("order-multi");
    if (programRule.transformer) ids.add("transformer");
  }
  return ids;
};

const collectSelectorCapabilityIds = (item: SuperAgendaSelector, ids: Set<string>): void => {
  ids.add(capabilityIdForSelector(item));
  switch (item.kind) {
    case "and":
    case "or":
      item.selectors.forEach((inner) => collectSelectorCapabilityIds(inner, ids));
      break;
    case "not":
    case "take":
    case "discard":
      collectSelectorCapabilityIds(item.selector, ids);
      break;
    case "auto":
      if (item.by === "property" && item.property === "agenda-group") ids.add("auto-group");
      break;
    default:
      break;
  }
};

const capabilityIdForSelector = (item: SuperAgendaSelector): string => {
  switch (item.kind) {
    case "auto":
      return `auto-${item.by}`;
    case "blocked":
      return "children";
    case "closed":
      return "log";
    case "done":
      return "todo";
    case "memory":
      return "agent-memory";
    case "or":
      return "implicit-or";
    case "time-grid":
      return "time-grid";
    default:
      return item.kind;
  }
};
