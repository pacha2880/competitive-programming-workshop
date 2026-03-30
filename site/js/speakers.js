import {
  createSectionCard,
  createSpeakerImage,
  loadSiteData,
  pageUrl,
  setMainContent,
  setPageChrome,
  el,
} from "./shared.js?v=20260330c";

async function renderSpeakersPage() {
  const data = await loadSiteData();

  setPageChrome({
    current: "speakers",
    title: "Instructores",
    subtitle: "Directorio de instructores con perfiles, fotos, biografías e historial de sesiones.",
    breadcrumbs: [{ label: "Inicio", href: "index.html" }, { label: "Instructores" }],
  });

  if (data.speakers.length === 0) {
    setMainContent(
      createSectionCard("No hay instructores disponibles", [
        el("p", { className: "section-text", text: "El JSON generado todavía no contiene instructores." }),
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
            el("p", { className: "card__text", text: speaker.bio || "Sin biografía." }),
            el("div", { className: "card__footer" }, [
              el("a", { className: "button-link", href: pageUrl("speaker", { id: speaker.id }), text: "Ver perfil" }),
            ]),
          ]),
        ])
      )
  );

  setMainContent(createSectionCard("Todos los instructores", [cards]));
}

renderSpeakersPage().catch((error) => {
  console.error(error);
  setMainContent(
    createSectionCard("No se pudo cargar el directorio de instructores", [
      el("p", {
        className: "section-text",
        text: "Ejecuta python scripts/build_data.py y sirve la carpeta site para reconstruir los archivos JSON.",
      }),
    ])
  );
});
