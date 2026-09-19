#!/usr/bin/env node
/**
 * Regenerates the project cards in the root index.html from the project
 * folders that currently exist. Adding a folder adds its card; deleting a
 * folder removes its card on the next workflow run.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'index.html');
const START_MARKER = '<!-- PROJECTS:START -->';
const END_MARKER = '<!-- PROJECTS:END -->';
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

function escapeHtml(value) {
  return value
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
      const href = `./${encodeURIComponent(name)}/`;
      return `      <a class="project-card" href="${href}">\n        <h2>${escapeHtml(name)}</h2>\n      </a>`;
    })
    .join('\n');
}

function main() {
  const html = fs.readFileSync(INDEX_PATH, 'utf8');
  const startIndex = html.indexOf(START_MARKER);
  const endIndex = html.indexOf(END_MARKER);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    console.error(`Could not find ${START_MARKER} and ${END_MARKER} in index.html.`);
    process.exit(1);
  }

  const projects = findProjectFolders();
  const before = html.slice(0, startIndex + START_MARKER.length);
  const after = html.slice(endIndex);
  const updated = `${before}\n${renderProjects(projects)}\n${after}`;

  if (updated !== html) {
    fs.writeFileSync(INDEX_PATH, updated, 'utf8');
  }

  console.log(
    `index.html contains ${projects.length} project(s): ${projects.join(', ') || '(none)'}`
  );
}

main();
