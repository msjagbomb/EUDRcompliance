# ClearCanopy — marketing site

Static one-page site for ClearCanopy (EUDR due diligence for forestry).
No build step — React + Babel run in the browser.

## Files

- `index.html` — the page
- `styles.css` — all styling
- `app.jsx` — page sections (nav, hero, pricing, quote form, footer)
- `mapdemo.jsx` — plot-assessment demo + Microsoft Store card
- `tweaks-panel.jsx` — design-tooling shell (stays hidden on the live site)
- `assets/` — brand imagery

## Deploy to GitHub Pages

1. Create a new repository on github.com (e.g. `clearcanopy-site`). Public repo, no template.
2. Upload everything in this folder to the repo root — either drag-and-drop on
   the repo page ("uploading an existing file"), or:

   ```
   git init
   git add .
   git commit -m "ClearCanopy site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/clearcanopy-site.git
   git push -u origin main
   ```

3. In the repo: **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main**, folder **/ (root)** → Save
4. Wait ~1 minute. The site goes live at
   `https://<your-username>.github.io/clearcanopy-site/`
   (the URL appears at the top of the Pages settings once built).

To update the site later, just push new commits to `main` — Pages redeploys automatically.

## Notes

- The "Get a quote" form is front-end only — it shows a confirmation but does not
  send anywhere. Wire it to a form backend (e.g. Formspree) when ready.
- JSX is compiled in the browser by Babel standalone. Fine at this scale; you'll
  see a console note about precompiling — safe to ignore.
