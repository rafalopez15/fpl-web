import { describe, expect, it } from "vitest";
import { PAGES, pageMetadata } from "@/lib/pages";

describe("pages", () => {
  it.each(Object.entries(PAGES))(
    "gives %s a title and a one-sentence description",
    (_, { title, description }) => {
      expect(title).not.toBe("");
      expect(description).toMatch(/^[A-Z][^.]*\.$/);
    },
  );

  it("sets the title and description for link previews too", () => {
    expect(pageMetadata("players")).toEqual({
      title: "Players",
      description: "Every FPL player's price, form and stats.",
      openGraph: {
        title: "Players",
        description: "Every FPL player's price, form and stats.",
        siteName: "FPL Social",
        type: "website",
      },
    });
  });

  it("takes a record's own title", () => {
    expect(pageMetadata("standings", "FPLDev standings")).toMatchObject({
      title: "FPLDev standings",
      description: "A mini-league's standings.",
      openGraph: { title: "FPLDev standings" },
    });
  });
});
