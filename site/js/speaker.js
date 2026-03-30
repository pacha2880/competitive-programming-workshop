import {
  createButtonLink,
  createCard,
  createInfoGrid,
  createNotFound,
  createSectionCard,
  createSpeakerImage,
  getCourseMap,
  getQueryParam,
  getSessionsForSpeaker,
  loadSiteData,
  pageUrl,
  setMainContent,
  setPageChrome,
  el,
} from "./shared.js?v=20260330b";

async function renderSpeakerPage() {
  const data = await loadSiteData();
  const speakerId = getQueryParam("id");
  const speaker = data.speakers.find((item) => item.id === speakerId);

  if (!speaker) {
    setPageChrome({
      current: "speakers",
      title: "Instructor not found",
      subtitle: "The requested speaker is not present in the generated data.",
      breadcrumbs: [{ label: "Home", href: "index.html" }, { label: "Instructors", href: "speakers.html" }, { label: "Not found" }],
      actions: [createButtonLink("Back to instructors", "speakers.html")],
    });
    setMainContent(
      createNotFound(
        "Instructor not found",
        "No speaker matched the provided id. Try returning to the instructor directory.",
        "speakers.html",
        "Open instructors"
      )
    );
    return;
  }

  const courseMap = getCourseMap(data.courses);
  const sessions = getSessionsForSpeaker(data.sessions, speaker.id);
  const contacts = speaker.contacts && typeof speaker.contacts === "object" ? Object.entries(speaker.contacts) : [];

  setPageChrome({
    current: "speakers",
    title: speaker.name,
    subtitle: "Instructor profile and teaching history.",
    breadcrumbs: [
      { label: "Home", href: "index.html" },
      { label: "Instructors", href: "speakers.html" },
      { label: speaker.name },
    ],
    actions: [createButtonLink("Back to instructors", "speakers.html")],
  });

  const contactLinks =
    contacts.length > 0
      ? el(
          "div",
          { className: "contact-list" },
          contacts
            .filter(([, value]) => value)
            .map(([key, value]) => {
              const href = key === "email" ? `mailto:${value}` : value;
              const target = String(href).startsWith("http") ? "_blank" : "";
              const rel = target ? "noreferrer noopener" : "";
              return el("a", { className: "button-link", href, text: key, target, rel });
            })
        )
      : el("p", { className: "section-text", text: "No contact links available." });

  const profile = createSectionCard("Profile", [
    el("div", { className: "speaker-profile" }, [
      createSpeakerImage(speaker.photo, speaker.name, "speaker-profile__photo"),
      el("div", { className: "stack" }, [
        el("p", { className: "detail-card__meta", text: speaker.role || "Instructor" }),
        el("p", {
          className: "detail-card__summary",
          text: speaker.bio || "No biography provided for this speaker.",
        }),
        createInfoGrid([
          { label: "Sessions taught", value: sessions.length },
        ]),
        contactLinks,
      ]),
    ]),
  ]);

  const sessionCards =
    sessions.length > 0
      ? el(
          "section",
          { className: "grid grid--2" },
          sessions.map((session) => {
            const course = courseMap.get(session.course_id);
            return createCard({
              title: session.title,
              meta: `${session.date || "Date pending"} | ${course?.title || session.course_id}`,
              text: session.summary || "No summary provided.",
              tags: session.tags || [],
              href: pageUrl("session", { id: session.id }),
              linkLabel: "View session",
            });
          })
        )
      : el("p", { className: "section-text", text: "This instructor has no linked sessions in the current data." });

  setMainContent(el("div", { className: "stack-lg" }, [profile, createSectionCard("Sessions taught", [sessionCards])]));
}

renderSpeakerPage().catch((error) => {
  console.error(error);
  setMainContent(
    createSectionCard("Unable to load the instructor page", [
      el("p", {
        className: "section-text",
        text: "Run python scripts/build_data.py and serve the site folder to rebuild the JSON files.",
      }),
    ])
  );
});
