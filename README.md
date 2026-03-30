# Competitive Programming Workshop Repository

Minimal repository for storing workshop content as YAML and generating JSON for a static site viewer.

## Structure

- `data/` stores speakers, courses, sessions, and placeholder assets.
- `scripts/build_data.py` converts YAML files into JSON files for the site.
- `site/` contains the static viewer and generated data.
- `templates/` provides starter YAML templates for new content.

## Install

```bash
pip install -r requirements.txt
```

## Build

```bash
python scripts/build_data.py
```

This generates:

- `site/data/years.json`
- `site/data/courses.json`
- `site/data/sessions.json`
- `site/data/speakers.json`

## Run The Site

```bash
cd site
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Site Pages

The static website is organized as multiple pages that all read from the generated JSON files in `site/data/`.

- Home: `http://localhost:8000/index.html`
- Years list: `http://localhost:8000/years.html`
- Year detail: `http://localhost:8000/year.html?id=2024`
- Course detail: `http://localhost:8000/course.html?id=curso-inicial-2024`
- Session detail: `http://localhost:8000/session.html?id=2024-03-02-greedy`
- Instructors list: `http://localhost:8000/speakers.html`
- Instructor detail: `http://localhost:8000/speaker.html?id=rodrigo-salguero`

Navigation is available at the top of every page, and detail pages include breadcrumbs and back links for easier browsing.

## GitHub Pages

The site is automatically deployed via GitHub Actions.

URL:
https://pacha2880.github.io/competitive-programming-workshop/

## Local development

```bash
py scripts/build_data.py
cd site
py -m http.server 8000
```

## Local Workflow

1. Add or edit YAML files under `data/`.
2. Rebuild JSON with `python scripts/build_data.py`.
3. Refresh the static site in the browser.
