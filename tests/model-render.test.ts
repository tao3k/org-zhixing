import type { OrgizeViewIndexRecordDto } from "orgize/dto";
import { describe, expect, it } from "vitest";
import { createDocumentView, noteRecords, withAgendaView } from "../src/model";
import { renderView } from "../src/render";

describe("Org source view fallbacks", () => {
  it("uses semantic headings as Notes when a real attachment source has no :record: tags", () => {
    const document = createDocumentView([
      record({
        title: "Wallpaper Attachment Gallery",
        effectiveTags: ["ATTACH", "house"],
      }),
      record({
        rangeStart: 120,
        title: "Blog-only heading",
        effectiveTags: ["blog"],
      }),
    ]);

    expect(document.counts.records).toBe(1);
    expect(noteRecords(document).map((item) => item.title)).toEqual([
      "Wallpaper Attachment Gallery",
    ]);
    expect(renderView({ view: "records", document })).toContain("Wallpaper Attachment Gallery");
  });

  it("keeps explicit :record: notes as the primary Notes surface", () => {
    const document = createDocumentView([
      record({
        title: "Attachment-only heading",
        effectiveTags: ["ATTACH"],
      }),
      record({
        title: "Typed note",
        effectiveTags: ["record", "ATTACH"],
      }),
    ]);

    expect(document.counts.records).toBe(1);
    expect(noteRecords(document).map((item) => item.title)).toEqual(["Typed note"]);
  });

  it("shows source planning data when agenda projection has no rows in the configured window", () => {
    const document = createDocumentView([
      record({
        title: "Bathroom Design",
        effectiveTags: ["ATTACH", "house"],
        planning: {
          scheduled: "<2020-12-19 Sat>-<2020-12-19 Sat>",
        },
      }),
    ]);
    const projected = withAgendaView(
      document,
      {
        schemaVersion: 1,
        totalCandidates: 0,
        sortStrategy: [],
        cards: [],
        skipped: [],
      },
      {
        start: { year: 2026, month: 5, day: 15 },
        days: 7,
        end: { year: 2026, month: 5, day: 21 },
        label: "2026-05-15 to 2026-05-21",
        limit: 32,
        mode: "classic",
      },
    );

    const html = renderView({ view: "agenda", document: projected });

    expect(projected.counts.agenda).toBe(1);
    expect(html).toContain("No agenda rows in 2026-05-15 to 2026-05-21");
    expect(html).toContain("Bathroom Design");
    expect(html).toContain("&lt;2020-12-19 Sat&gt;-&lt;2020-12-19 Sat&gt;");
  });
});

const record = ({
  bodyPreview = "",
  effectiveTags = [],
  level = 1,
  outline,
  planning = {},
  properties = [],
  rangeStart = 0,
  title,
  todo = null,
  todoState = null,
}: Partial<OrgizeViewIndexRecordDto> & { title: string }): OrgizeViewIndexRecordDto => ({
  bodyPreview,
  effectiveTags,
  level,
  outline: outline ?? title,
  planning,
  properties,
  rangeStart,
  title,
  todo,
  todoState,
});
