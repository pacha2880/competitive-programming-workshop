import {
  createButtonLink,
  createNotFound,
  createPhotoGallery,
  createPlainListSection,
  createResourceList,
  createSectionCard,
  createSpeakerImage,
  createSpoilerList,
  getCourseMap,
  getQueryParam,
  getSessionsForCourse,
  getSpeakerMap,
  isExternalUrl,
  loadSiteData,
  normalizeAssetPath,
  pageUrl,
  setMainContent,
  setPageChrome,
  el,
} from "./shared.js?v=20260426c";

async function renderSessionPage() {
  const data = await loadSiteData();
  const sessionId = getQueryParam("id");
  const session = data.sessions.find((item) => item.id === sessionId);

  if (!session) {
    setPageChrome({
      current: "years",
      title: "Sesión no encontrada",
      subtitle: "La sesión solicitada no está presente en los datos generados.",
      breadcrumbs: [
        { label: "Inicio", href: "index.html" },
        { label: "Años", href: "years.html" },
        { label: "No encontrada" },
      ],
      actions: [createButtonLink("Volver a años", "years.html")],
    });
    setMainContent(
      createNotFound(
        "Sesión no encontrada",
        "Ninguna sesión coincide con el id proporcionado. Intenta volver al listado de cursos o años.",
        "years.html",
        "Abrir años"
      )
    );
    return;
  }

  const courseMap = getCourseMap(data.courses);
  const speakerMap = getSpeakerMap(data.speakers);
  const course = courseMap.get(session.course_id);
  const speakerCards = (session.speaker_ids || []).map((speakerId) => speakerMap.get(speakerId)).filter(Boolean);

  const courseSessions = course ? getSessionsForCourse(data.sessions, course.id) : [];
  const sessionIndex = courseSessions.findIndex((s) => s.id === session.id);
  const prevSession = sessionIndex > 0 ? courseSessions[sessionIndex - 1] : null;
  const nextSession = sessionIndex < courseSessions.length - 1 ? courseSessions[sessionIndex + 1] : null;

  const sessionNavActions = el("div", { className: "session-actions" }, [
    course ? el("a", { href: pageUrl("course", { id: course.id }), text: "← Volver a vista principal del curso", className: "session-back-link" }) : null,
    el("div", { className: "session-actions__nav" }, [
      prevSession
        ? createButtonLink("← Sesión anterior", pageUrl("session", { id: prevSession.id }))
        : el("span", {}),
      nextSession
        ? createButtonLink("Siguiente sesión →", pageUrl("session", { id: nextSession.id }))
        : el("span", {}),
    ]),
  ]);

  setPageChrome({
    current: "years",
    title: session.title,
    subtitle: `${session.date || "Fecha pendiente"}${session.summary ? ` · ${session.summary}` : ""}`,
    breadcrumbs: [
      { label: "Inicio", href: "index.html" },
      { label: "Años", href: "years.html" },
      course ? { label: String(course.year), href: pageUrl("year", { id: course.year }) } : null,
      course ? { label: course.title, href: pageUrl("course", { id: course.id }) } : null,
      { label: session.title },
    ].filter(Boolean),
    actions: [sessionNavActions],
  });

  const materialsBlocks = [
    createResourceList("Diapositivas", session.materials?.slides || [], session.path),
    createResourceList("PDFs extra", session.materials?.extra_pdfs || [], session.path),
    Array.isArray(session.problem_list) && session.problem_list.length > 0
      ? createSectionCard("Lista de problemas", [
          el(
            "ul",
            { className: "resource-list" },
            session.problem_list.map((item) =>
              el("li", {}, [
                el("a", {
                  href: item.url || normalizeAssetPath(item.file),
                  text: item.title || item.url || item.file || "Problema",
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
      ? createSectionCard("Concursos de práctica", [
          el(
            "ul",
            { className: "resource-list" },
            session.practice_contests.map((item) =>
              el("li", {}, [
                el("a", {
                  href: item.url || normalizeAssetPath(item.file),
                  text: item.title || item.url || item.file || "Concurso",
                  target: isExternalUrl(item.url) ? "_blank" : "",
                  rel: isExternalUrl(item.url) ? "noreferrer noopener" : "",
                }),
                item.comment ? el("span", { className: "resource-note", text: ` - ${item.comment}` }) : null,
              ])
            )
          ),
        ])
      : null,
    createPlainListSection("Notas extra", session.extra_notes || []),
    createResourceList("Archivos extra", session.materials?.extra_files || [], session.path),
    createResourceList("Enlaces extra", session.extra_links || [], session.path),
  ].filter(Boolean);

  const localPhotos = Array.isArray(session.photos) ? session.photos : [];
  const photosSection =
    localPhotos.length > 0
      ? createSectionCard("Fotos", [createPhotoGallery(localPhotos, session.path, session.title)])
      : null;

  const speakersSection =
    speakerCards.length > 0
      ? createSectionCard(
          "Expositores",
          speakerCards.map((speaker) =>
            el("article", { className: "speaker-card section-card" }, [
              createSpeakerImage(speaker.photo, speaker.name, "speaker-card__photo"),
              el("div", { className: "stack" }, [
                el("p", { className: "card__meta", text: speaker.role || "Instructor" }),
                el("h3", { className: "card__title" }, [
                  el("a", { href: pageUrl("speaker", { id: speaker.id }), text: speaker.name }),
                ]),
                el("p", { className: "card__text", text: speaker.bio || "Sin biografía." }),
                createButtonLink("Ver perfil", pageUrl("speaker", { id: speaker.id })),
              ]),
            ])
          )
        )
      : createSectionCard("Expositores", [
          el("p", { className: "section-text", text: "No hay expositores asignados." }),
        ]);

  setMainContent(
    el(
      "div",
      { className: "stack-lg" },
      [
        createSectionCard(
          "Materiales",
          materialsBlocks.length > 0
            ? materialsBlocks
            : [el("p", { className: "section-text", text: "No se listaron materiales para esta sesión." })],
          "materials-section"
        ),
        createSpoilerList("Soluciones del contest", session.solution_notes || []),
        photosSection,
        speakersSection,
      ].filter(Boolean)
    )
  );
}

renderSessionPage().catch((error) => {
  console.error(error);
  setMainContent(
    createSectionCard("No se pudo cargar la página de la sesión", [
      el("p", {
        className: "section-text",
        text: "Ejecuta python scripts/build_data.py y sirve la carpeta site para reconstruir los archivos JSON.",
      }),
    ])
  );
});
