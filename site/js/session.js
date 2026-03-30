import {
  buildSessionAssetPath,
  createButtonLink,
  createNotFound,
  createPlainListSection,
  createResourceList,
  createSectionCard,
  createSpeakerImage,
  getCourseMap,
  getQueryParam,
  getSpeakerMap,
  isExternalUrl,
  loadSiteData,
  normalizeAssetPath,
  pageUrl,
  setMainContent,
  setPageChrome,
  el,
} from "./shared.js?v=20260330b";

async function renderSessionPage() {
  const data = await loadSiteData();
  const sessionId = getQueryParam("id");
  const session = data.sessions.find((item) => item.id === sessionId);

  if (!session) {
    setPageChrome({
      current: "years",
      title: "Session not found",
      subtitle: "The requested session is not present in the generated data.",
      breadcrumbs: [{ label: "Home", href: "index.html" }, { label: "Years", href: "years.html" }, { label: "Not found" }],
      actions: [createButtonLink("Back to years", "years.html")],
    });
    setMainContent(
      createNotFound(
        "Session not found",
        "No session matched the provided id. Try returning to the course or year listings.",
        "years.html",
        "Open years"
      )
    );
    return;
  }

  const courseMap = getCourseMap(data.courses);
  const speakerMap = getSpeakerMap(data.speakers);
  const course = courseMap.get(session.course_id);
  const speakerCards = (session.speaker_ids || []).map((speakerId) => speakerMap.get(speakerId)).filter(Boolean);

  const summaryLine =
    session.summary && session.summary.length > 100 ? `${session.summary.slice(0, 97).trim()}...` : session.summary;

  setPageChrome({
    current: "years",
    title: session.title,
    subtitle: `${session.date || "Date pending"}${summaryLine ? ` · ${summaryLine}` : ""}`,
    breadcrumbs: [
      { label: "Home", href: "index.html" },
      { label: "Years", href: "years.html" },
      course ? { label: String(course.year), href: pageUrl("year", { id: course.year }) } : null,
      course ? { label: course.title, href: pageUrl("course", { id: course.id }) } : null,
      { label: session.title },
    ].filter(Boolean),
    actions: course ? [createButtonLink("Back to course", pageUrl("course", { id: course.id }))] : [],
  });

  const materialsBlocks = [
    createResourceList("Slides", session.materials?.slides || [], session.path),
    createResourceList("Extra PDFs", session.materials?.extra_pdfs || [], session.path),
    Array.isArray(session.problem_list) && session.problem_list.length > 0
      ? createSectionCard("Problem list", [
          el(
            "ul",
            { className: "resource-list" },
            session.problem_list.map((item) =>
              el("li", {}, [
                el("a", {
                  href: item.url || normalizeAssetPath(item.file),
                  text: item.title || item.url || item.file || "Problem",
                  target: isExternalUrl(item.url) ? "_blank" : "",
                  rel: isExternalUrl(item.url) ? "noreferrer noopener" : "",
                }),
                item.comment ? el("span", { className: "resource-note", text: ` - ${item.comment}` }) : null,
              ])
            )
          ),
        ])
      : null,
    Array.isArray(session.practice_contests) && session.practice_contests.length > 0
      ? createSectionCard("Practice contests", [
          el(
            "ul",
            { className: "resource-list" },
            session.practice_contests.map((item) =>
              el("li", {}, [
                el("a", {
                  href: item.url || normalizeAssetPath(item.file),
                  text: item.title || item.url || item.file || "Contest",
                  target: isExternalUrl(item.url) ? "_blank" : "",
                  rel: isExternalUrl(item.url) ? "noreferrer noopener" : "",
                }),
                item.comment ? el("span", { className: "resource-note", text: ` - ${item.comment}` }) : null,
              ])
            )
          ),
        ])
      : null,
    createPlainListSection("Extra notes", session.extra_notes || []),
  ].filter(Boolean);

  const localPhotos = Array.isArray(session.photos) ? session.photos : [];
  const photosSection =
    localPhotos.length > 0
      ? createSectionCard("Photos", [
          el(
            "div",
            { className: "photo-gallery" },
            localPhotos.map((photo) => {
              const photoPath = buildSessionAssetPath(session.path, photo.file);
              return el("a", { className: "photo-gallery__item", href: photoPath }, [
                el("img", { src: photoPath, alt: photo.comment || session.title }),
                el("div", { className: "photo-gallery__caption", text: photo.comment || photo.file }),
              ]);
            })
          ),
        ])
      : null;

  const speakersSection =
    speakerCards.length > 0
      ? createSectionCard(
          "Speakers",
          speakerCards.map((speaker) =>
            el("article", { className: "speaker-card section-card" }, [
              createSpeakerImage(speaker.photo, speaker.name, "speaker-card__photo"),
              el("div", { className: "stack" }, [
                el("p", { className: "card__meta", text: speaker.role || "Instructor" }),
                el("h3", { className: "card__title" }, [
                  el("a", { href: pageUrl("speaker", { id: speaker.id }), text: speaker.name }),
                ]),
                el("p", { className: "card__text", text: speaker.bio || "No biography provided." }),
                createButtonLink("View profile", pageUrl("speaker", { id: speaker.id })),
              ]),
            ])
          )
        )
      : createSectionCard("Speakers", [el("p", { className: "section-text", text: "No speakers assigned." })]);

  setMainContent(
    el("div", { className: "stack-lg" }, [
      createSectionCard(
        "Materials",
        materialsBlocks.length > 0
          ? materialsBlocks
          : [el("p", { className: "section-text", text: "No materials have been listed for this session." })],
        "materials-section"
      ),
      photosSection,
      speakersSection,
    ].filter(Boolean))
  );
}

renderSessionPage().catch((error) => {
  console.error(error);
  setMainContent(
    createSectionCard("Unable to load the session page", [
      el("p", {
        className: "section-text",
        text: "Run python scripts/build_data.py and serve the site folder to rebuild the JSON files.",
      }),
    ])
  );
});
