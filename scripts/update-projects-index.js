#!/usr/bin/env node
/**
 * Regenerates the project list in the root index.html.
 *
 * Scans the repo root for top-level folders that contain their own
 * index.html (i.e. a project), and rewrites the HTML between the
 * PROJECTS:START / PROJECTS:END markers with a card linking to each one.
 * Everything else in index.html (welcome text, styles, etc.) is left alone.
 *
 * Run manually with: node scripts/update-projects-index.js
 * Run automatically by .github/workflows/update-index.yml on every push.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'index.html');
const START_MARKER = '<!-- PROJECTS:START -->';
const END_MARKER = '<!-- PROJECTS:END -->';

// Folders that are never treated as projects.
const IGNORE = new Set(['.git', '.github', 'node_modules', 'scripts']);

function findProjectFolders() {
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !entry.name.startsWith('.'))
    .filter((entry) => !IGNORE.has(entry.name))
    .filter((entry) => fs.existsSync(path.join(ROOT, entry.name, 'index.html')))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderProjects(names) {
  if (names.length === 0) {
    return '      <p class="empty-note">No projects yet — add a folder with its own index.html.</p>';
  }

  return names
    .map((name) => {
      const href = `./${name
        .split('/')
        .map(encodeURIComponent)
        .join('/')}/`;
      return `      <a class="project-card" href="${href}">\n        <h2>${escapeHtml(name)}</h2>\n      </a>`;
    })
    .join('\n');
}

function main() {
  const html = fs.readFileSync(INDEX_PATH, 'utf8');
  const startIdx = html.indexOf(START_MARKER);
  const endIdx = html.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    console.error(
      `Could not find ${START_MARKER} / ${END_MARKER} markers in index.html — leaving it untouched.`
    );
    process.exit(1);
  }

  const projects = findProjectFolders();
  const before = html.slice(0, startIdx + START_MARKER.length);
  const after = html.slice(endIdx);
  const updated = `${before}\n${renderProjects(projects)}\n${after}`;

  fs.writeFileSync(INDEX_PATH, updated, 'utf8');
  console.log(
    `index.html updated with ${projects.length} project(s): ${projects.join(', ') || '(none)'}`
  );
}

main();
