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
} from "./shared.js?v=20260330e";

async function renderSpeakerPage() {
  const data = await loadSiteData();
  const speakerId = getQueryParam("id");
  const speaker = data.speakers.find((item) => item.id === speakerId);

  if (!speaker) {
    setPageChrome({
      current: "speakers",
      title: "Instructor no encontrado",
      subtitle: "El instructor solicitado no está presente en los datos generados.",
      breadcrumbs: [
        { label: "Inicio", href: "index.html" },
        { label: "Instructores", href: "speakers.html" },
        { label: "No encontrado" },
      ],
      actions: [createButtonLink("Volver a instructores", "speakers.html")],
    });
    setMainContent(
      createNotFound(
        "Instructor no encontrado",
        "Ningún instructor coincide con el id proporcionado. Intenta volver al directorio de instructores.",
        "speakers.html",
        "Abrir instructores"
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
    subtitle: "Perfil del instructor e historial de sesiones.",
    breadcrumbs: [
      { label: "Inicio", href: "index.html" },
      { label: "Instructores", href: "speakers.html" },
      { label: speaker.name },
    ],
    actions: [createButtonLink("Volver a instructores", "speakers.html")],
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
      : el("p", { className: "section-text", text: "No hay enlaces de contacto disponibles." });

  const profile = createSectionCard("Perfil", [
    el("div", { className: "speaker-profile" }, [
      createSpeakerImage(speaker.photo, speaker.name, "speaker-profile__photo"),
      el("div", { className: "stack" }, [
        el("p", { className: "detail-card__meta", text: speaker.role || "Instructor" }),
        el("p", {
          className: "detail-card__summary",
          text: speaker.bio || "No se proporcionó una biografía para este instructor.",
        }),
        createInfoGrid([{ label: "Sesiones impartidas", value: sessions.length }]),
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
              meta: `${session.date || "Fecha pendiente"} | ${course?.title || session.course_id}`,
              text: session.summary || "Sin resumen.",
              tags: session.tags || [],
              href: pageUrl("session", { id: session.id }),
              linkLabel: "Ver sesión",
            });
          })
        )
      : el("p", { className: "section-text", text: "Este instructor no tiene sesiones vinculadas en los datos actuales." });

  setMainContent(el("div", { className: "stack-lg" }, [profile, createSectionCard("Sesiones impartidas", [sessionCards])]));
}

renderSpeakerPage().catch((error) => {
  console.error(error);
  setMainContent(
    createSectionCard("No se pudo cargar la página del instructor", [
      el("p", {
        className: "section-text",
        text: "Ejecuta python scripts/build_data.py y sirve la carpeta site para reconstruir los archivos JSON.",
      }),
    ])
  );
});
