import {
  createSectionCard,
  createSpeakerImage,
  loadSiteData,
  pageUrl,
  setMainContent,
  setPageChrome,
  el,
} from "./shared.js?v=20260330b";

async function renderSpeakersPage() {
  const data = await loadSiteData();

  setPageChrome({
    current: "speakers",
    title: "Instructors",
    subtitle: "Speaker directory with profiles, photos, bios, and session history.",
    breadcrumbs: [{ label: "Home", href: "index.html" }, { label: "Instructors" }],
  });

  if (data.speakers.length === 0) {
    setMainContent(
      createSectionCard("No instructors available", [
        el("p", { className: "section-text", text: "The generated JSON does not contain any speakers yet." }),
      ])
    );
    return;
  }

  const cards = el(
    "section",
    { className: "grid grid--2" },
    data.speakers
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((speaker) =>
        el("article", { className: "speaker-card section-card" }, [
          createSpeakerImage(speaker.photo, speaker.name, "speaker-card__photo"),
          el("div", { className: "stack" }, [
            el("p", { className: "card__meta", text: speaker.role || "Instructor" }),
            el("h2", { className: "card__title", text: speaker.name }),
            el("p", { className: "card__text", text: speaker.bio || "No biography provided." }),
            el("div", { className: "card__footer" }, [
              el("a", { className: "button-link", href: pageUrl("speaker", { id: speaker.id }), text: "View profile" }),
            ]),
          ]),
        ])
      )
  );

  setMainContent(createSectionCard("All instructors", [cards]));
}

renderSpeakersPage().catch((error) => {
  console.error(error);
  setMainContent(
    createSectionCard("Unable to load the instructor directory", [
      el("p", {
        className: "section-text",
        text: "Run python scripts/build_data.py and serve the site folder to rebuild the JSON files.",
      }),
    ])
  );
});
