import type {
  SuperAgendaProgram,
  SuperAgendaProgramRule,
  SuperAgendaSelector,
} from "./agendaTypes";

export const selectorToSexp = (item: SuperAgendaSelector): string => writeSelector(item);

export const buildProgram = (program: Omit<SuperAgendaProgram, "source">): SuperAgendaProgram => ({
  ...program,
  source: programSource(program),
});

export const rule = (definition: SuperAgendaProgramRule): SuperAgendaProgramRule => definition;

const writeSelector = (item: SuperAgendaSelector): string => {
  switch (item.kind) {
    case "anything":
      return ":anything t";
    case "blocked":
      return ':and (:children todo :property "ORDERED")';
    case "category":
      return `:category ${selectorValues(item.values)}`;
    case "closed":
      return ":log closed";
    case "deadline":
      return ":deadline t";
    case "done":
      return ':todo ("DONE" "CANCELED")';
    case "memory":
      return ':or (:property "ID" :tag ("record" "memory"))';
    case "effort":
      return `:effort${item.operator} ${quote(item.value)}`;
    case "priority":
      return item.operator === "="
        ? `:priority ${quote(item.value)}`
        : `:priority${item.operator} ${quote(item.value)}`;
    case "property":
      return item.values
        ? `:property (${quote(item.key)} ${selectorValues(item.values)})`
        : `:property ${quote(item.key)}`;
    case "scheduled":
      return ":scheduled t";
    case "tag":
      return `:tag ${selectorValues(item.values)}`;
    case "time-grid":
      return ":time-grid t";
    case "todo":
      return `:todo ${selectorValues(item.values)}`;
    case "and":
      return `:and (${item.selectors.map(writeSelector).join(" ")})`;
    case "not":
      return `:not (${writeSelector(item.selector)})`;
    case "or":
      return item.selectors.map(writeSelector).join(" ");
    case "take":
      return `:take (${item.count} (${writeSelector(item.selector)}))`;
    case "discard":
      return `:discard (${writeSelector(item.selector)})`;
    case "auto":
      return item.by === "property"
        ? `:auto-property ${quote(item.property ?? "")}`
        : `:auto-${item.by} t`;
  }
};

const programSource = (program: Omit<SuperAgendaProgram, "source">): string => {
  const consumed = new Set<string>();
  const lines = program.rules.flatMap((programRule) => {
    if (!programRule.orderMulti || consumed.has(programRule.id)) {
      return consumed.has(programRule.id) ? [] : [`  ${programRuleSource(programRule, true)}`];
    }

    const siblings = program.rules.filter(
      (ruleItem) => ruleItem.orderMulti === programRule.orderMulti,
    );
    if (siblings.length < 2) {
      return [`  ${programRuleSource(programRule, true)}`];
    }

    siblings.forEach((ruleItem) => consumed.add(ruleItem.id));
    return [
      `  (:order-multi (${programRule.order}\n${siblings
        .map((ruleItem) => `    ${programRuleSource(ruleItem, false)}`)
        .join("\n")}))`,
    ];
  });
  return `(setq org-super-agenda-groups\n '(\n${lines.join("\n")}\n   ))`;
};

const programRuleSource = (programRule: SuperAgendaProgramRule, includeOrder: boolean): string => {
  const attrs = [
    `:name ${quote(programRule.title)}`,
    selectorToSexp(programRule.selector),
    includeOrder && programRule.order !== 0 ? `:order ${programRule.order}` : null,
    programRule.face ? `:face ${quote(programRule.face)}` : null,
    programRule.transformer ? `:transformer ${quote(programRule.transformer)}` : null,
  ].filter(Boolean);
  return `(${attrs.join("\n   ")})`;
};

const selectorValues = (values: string[]): string =>
  values.length === 1 ? quote(values[0]) : `(${values.map(quote).join(" ")})`;

const quote = (value: string): string => `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
