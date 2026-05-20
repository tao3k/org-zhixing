export type AgentMemoryView = {
  rawText: string;
  cards: AgentMemoryCardView[];
  stats: AgentMemoryStats;
};

export type AgentMemoryStats = {
  cards: number;
  actionCards: number;
  evidence: number;
  authority: number;
  links: number;
};

export type AgentMemoryCardView = {
  code: string;
  severity: string;
  title: string;
  source: string;
  fact: string;
  state: string | null;
  tags: string[];
  evidence: string[];
  authority: string[];
  links: string[];
  next: string | null;
  contract: string | null;
};

type MutableMemoryCard = AgentMemoryCardView;

export const parseAgentMemoryText = (rawText: string): AgentMemoryView => {
  const cards = rawText
    .split(/\n{2,}/)
    .map((block) => parseMemoryCard(block.trim()))
    .filter((card): card is AgentMemoryCardView => card !== null);
  return {
    rawText,
    cards,
    stats: memoryStats(cards),
  };
};

const parseMemoryCard = (block: string): AgentMemoryCardView | null => {
  if (!block || block.startsWith("[ok]")) {
    return null;
  }
  const lines = block.split("\n").map((line) => line.trim());
  const header = /^\[([^\]]+)\]\s+([^:]+):\s+(.+)$/.exec(lines[0] ?? "");
  if (!header) {
    return null;
  }
  const card: MutableMemoryCard = {
    code: header[1],
    severity: header[2],
    title: header[3],
    source: "",
    fact: "",
    state: null,
    tags: [],
    evidence: [],
    authority: [],
    links: [],
    next: null,
    contract: null,
  };
  for (const line of lines.slice(1)) {
    applyMemoryLine(card, line);
  }
  return card.fact ? card : null;
};

const applyMemoryLine = (card: MutableMemoryCard, line: string): void => {
  if (line.startsWith("@ ")) {
    card.source = line.slice(2).trim();
    return;
  }
  const separator = line.indexOf(":");
  if (separator < 0) {
    return;
  }
  const key = line.slice(0, separator);
  const value = line.slice(separator + 1).trim();
  switch (key) {
    case "fact":
      card.fact = value;
      break;
    case "state":
      card.state = value;
      break;
    case "tags":
      card.tags = splitList(value, ":");
      break;
    case "evidence":
      card.evidence = splitList(value, ",");
      break;
    case "authority":
      card.authority = splitList(value, ";");
      break;
    case "links":
      card.links = splitList(value, ",");
      break;
    case "next":
      card.next = value;
      break;
    case "contract":
      card.contract = value;
      break;
  }
};

const splitList = (value: string, separator: string): string[] =>
  value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);

const memoryStats = (cards: AgentMemoryCardView[]): AgentMemoryStats => ({
  cards: cards.length,
  actionCards: cards.filter((card) => card.severity.toLowerCase() === "action").length,
  evidence: cards.reduce((total, card) => total + card.evidence.length, 0),
  authority: cards.reduce((total, card) => total + card.authority.length, 0),
  links: cards.reduce((total, card) => total + card.links.length, 0),
});
