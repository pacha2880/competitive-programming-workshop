# Project Context For ChatGPT

## What this project is

This repository stores competitive programming workshop content as YAML and publishes it as a static website.

- Source content lives in `data/`.
- A Python build script converts YAML into JSON.
- The frontend in `site/` reads only the generated JSON and copied assets.

## How the project works

1. Content is authored in YAML files under `data/`.
2. `scripts/build_data.py` reads that YAML, normalizes it, and writes:
   - `site/data/years.json`
   - `site/data/courses.json`
   - `site/data/sessions.json`
   - `site/data/speakers.json`
3. The same build step also copies referenced local assets from `data/` into `site/data/`.
4. The static pages in `site/` render from those JSON files.

Important: `data/` is the source of truth. `site/data/` is generated output.

## Main folders

```text
data/
  speakers/
    <speaker-id>.yml
    photos/
  years/
    <year>/
      <course-folder>/
        course.yml
        sessions/
          <session-folder>/
            session.yml
            <session assets>

scripts/
  build_data.py

site/
  *.html
  js/
  data/   # generated

templates/
  course.template.yml
  session.template.yml
  speaker.template.yml
```

## Data model

### Speaker

Stored in `data/speakers/<speaker-id>.yml`.

Typical fields:

- `id`
- `name`
- `role`
- `bio`
- `photo`
- `contacts`

Speaker photos usually use an absolute repo path like `/data/speakers/photos/rodrigo.jpg`.

### Course

Stored in `data/years/<year>/<course-folder>/course.yml`.

Typical fields:

- `id`
- `title`
- `year`
- `description`
- `status`
- `tags`

### Session

Stored in `data/years/<year>/<course-folder>/sessions/<session-folder>/session.yml`.

Typical fields:

- `id`
- `title`
- `date`
- `course_id`
- `status`
- `summary`
- `speaker_ids`
- `tags`
- `materials.slides`
- `materials.extra_pdfs`
- `materials.extra_files`
- `problem_list`
- `practice_contests`
- `extra_links`
- `extra_notes`
- `photos`

Session assets are normally referenced with paths relative to the session folder, such as `slides.pdf`.

## Conventions to preserve

- Use simple YAML with spaces, not tabs.
- Keep IDs stable, lowercase, and hyphenated when possible.
- Do not reference files that do not exist.
- If a session uses `speaker_ids`, those speakers must exist in `data/speakers/`.
- Prefer relative file paths for session assets.
- `course_id` in each session should match the parent course's `id`.
- `site/data/` should not be edited manually unless there is a very specific reason; rebuild it from source.

## Build and local preview

```powershell
py scripts/build_data.py
cd site
py -m http.server 8000
```

Useful pages:

- `index.html`
- `years.html`
- `year.html?id=<year>`
- `course.html?id=<course-id>`
- `session.html?id=<session-id>`
- `speakers.html`
- `speaker.html?id=<speaker-id>`

## Implementation details that matter

- `scripts/build_data.py` is tolerant of some imperfect YAML and attempts minor repairs before parsing.
- The build script normalizes dates, strings, lists, notes, links, and asset references.
- Local assets referenced from sessions and speakers are copied into `site/data/`.
- Frontend pages load data through `site/js/shared.js`, which fetches the four generated JSON files and builds the UI client-side.


## How to help safely in this repo

When suggesting changes, prefer editing source files under `data/`, `templates/`, `scripts/`, or `site/js/` rather than generated JSON.

If you create or modify content:

1. Update YAML in `data/`
2. Ensure referenced assets really exist
3. Keep naming and IDs consistent
4. Rebuild with `py scripts/build_data.py`

If you propose new content, do not invent missing PDFs, ZIPs, images, or speaker profiles unless explicitly asked.
