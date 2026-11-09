# XR Lab survey website

This folder contains the finished static website. GitHub Pages can serve these files directly; no Node.js build or dependency installation is needed on GitHub.

## Publish

1. Create or open the GitHub repository that will host the website.
2. Upload the **contents of this folder** to the repository's top level on its `main` branch. `index.html`, `.nojekyll`, and `assets/` must appear at the top level; do not place this whole folder inside the repository as a subfolder. In GitHub, use **Add file → Upload files** and drag these items in.
3. Once, in **Settings → Pages**, set **Source: Deploy from a branch**, **Branch: main**, **Folder: /(root)**, then save. GitHub requires this one-time setting even for a ready-made static folder.

The website URL will normally be `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`. The site's navigation uses URL hashes, so it works under any repository name.

## Before making it public

The website's JavaScript includes all 114 anonymous student responses and 33 anonymous faculty responses, including original comments, because the filters and comment disclosures work in the browser. Anyone who can access the published site can download that data. Review whether public release of the responses is appropriate before uploading.
