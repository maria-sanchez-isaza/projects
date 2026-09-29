const grid = document.querySelector("#grid");
const emptyEl = document.querySelector("#empty");
const crossEl = document.querySelector("#cross");
const heading = document.querySelector("#heading");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#q");
const tabModels = document.querySelector("#tab-models");
const tabAnimations = document.querySelector("#tab-animations");
const modal = document.querySelector("#modal");
const panel = modal.querySelector(".panel");
const modalBody = document.querySelector("#modal-body");
const closeBtn = document.querySelector("#modal-close");
const collectionLink = document.querySelector("#collection-link");

const state = {
  tab: "models",
  query: "",
  collection: null,
  openId: null,
};

function norm(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

// Related anatomy terms. A search for one word also accepts the others,
// so "lung" finds pulmonary models and "renal" finds the kidney.
const SYNONYM_GROUPS = [
  ["lung", "pulmonary", "respiratory"],
  ["heart", "cardiac", "cardio", "cardiovascular"],
  ["kidney", "renal", "nephron"],
  ["eye", "eyeball", "ocular"],
  ["bone", "skeleton", "skeletal", "skull"],
  ["muscle", "muscular"],
  ["liver", "hepatic"],
  ["brain", "cerebral"],
  ["blood", "erythrocyte", "leukocyte"],
  ["cell", "microbiology", "organelle"],
  ["digestive", "digestion", "stomach", "intestine", "gastrointestinal"],
  ["spine", "vertebra"],
];

const SYNONYMS = new Map();
for (const group of SYNONYM_GROUPS) {
  const folded = group.map(singular);
  const set = new Set(folded);
  for (const word of folded) SYNONYMS.set(word, set);
}

function singular(word) {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function wordList(...parts) {
  return norm(parts.flat().filter(Boolean).join(" ")).split(" ").filter(Boolean);
}

function nameWords(item) {
  const words = wordList(item.title, item.sketchfabName, item.id);
  const compact = norm(item.title).replace(/\s+/g, "");
  if (compact) words.push(compact);
  return words;
}

function contextWords(item) {
  return wordList(item.tags);
}

function sameTerm(word, token) {
  return singular(word) === singular(token);
}

function synonymHit(word, token) {
  const group = SYNONYMS.get(singular(token));
  return Boolean(group && group.has(singular(word)));
}

// "kid" matches kidney and "lu" matches lungs. A short stub must not reach
// across a much longer unrelated word.
function prefixHit(word, token) {
  if (token.length < 2 || !word.startsWith(token)) return false;
  return word.length - token.length <= 8;
}

function wordHit(word, token) {
  if (sameTerm(word, token) || prefixHit(word, token)) return true;
  return token.length >= 3 && synonymHit(word, token);
}

function fieldHit(words, token) {
  return words.some((word) => wordHit(word, token));
}

function directHit(words, token) {
  return words.some((word) => sameTerm(word, token) || prefixHit(word, token));
}

function titleStartsWithLetter(item, letter) {
  return norm(item.title).startsWith(letter);
}

// Lower score is a closer match: the typed word in the name, then a related
// word in the name, then a keyword.
function relevance(item, tokens) {
  const names = nameWords(item);
  const context = contextWords(item);
  let score = 0;
  // One letter keeps titles that start with that letter, A or a.
  if (tokens.length === 1 && tokens[0].length === 1) {
    return titleStartsWithLetter(item, tokens[0]) ? 0 : null;
  }
  for (const token of tokens) {
    if (directHit(names, token)) continue;
    if (fieldHit(names, token)) {
      score += 1;
      continue;
    }
    if (fieldHit(context, token)) {
      score += 2;
      continue;
    }
    return null;
  }
  return score;
}

function sortKey(title) {
  return norm(title).replace(/^(the|a|an) /, "");
}

function byTitle(a, b) {
  return sortKey(a.title).localeCompare(sortKey(b.title), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function listFor(kind) {
  const source = (kind === "animations" ? state.collection.animations : state.collection.models) || [];
  return source.slice().sort(byTitle);
}

function findItem(id) {
  return [...state.collection.models, ...state.collection.animations].find((item) => item.id === id) || null;
}

function cubeIcon() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" d="M12 3.2 20.2 7.6v8.8L12 20.8 3.8 16.4V7.6L12 3.2z"/><path fill="none" stroke="currentColor" stroke-width="1.7" d="M12 12.1 20.2 7.6M12 12.1 3.8 7.6M12 12.1v8.7"/></svg>';
}

function playIcon() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8.2 5.8v12.4L19 12 8.2 5.8z"/></svg>';
}

function setTab(tab, { updateHash = true } = {}) {
  state.tab = tab;
  const modelsOn = tab === "models";
  tabModels.setAttribute("aria-selected", String(modelsOn));
  tabAnimations.setAttribute("aria-selected", String(!modelsOn));
  tabModels.tabIndex = modelsOn ? 0 : -1;
  tabAnimations.tabIndex = modelsOn ? -1 : 0;
  grid.setAttribute("aria-labelledby", modelsOn ? "tab-models" : "tab-animations");
  if (updateHash && !state.openId) {
    const hash = tab === "animations" ? "#animations" : "#models";
    if (location.hash !== hash) history.replaceState({ tab }, "", hash);
  }
  render();
}

function matching(kind, tokens) {
  const items = listFor(kind);
  if (!tokens.length) return items;
  return items
    .map((item) => ({ item, score: relevance(item, tokens) }))
    .filter((row) => row.score !== null)
    .sort((a, b) => a.score - b.score || byTitle(a.item, b.item))
    .map((row) => row.item);
}

function render() {
  const query = norm(state.query);
  const tokens = query.split(/\s+/).filter(Boolean);
  const current = matching(state.tab, tokens);
  const otherKind = state.tab === "models" ? "animations" : "models";
  const other = matching(otherKind, tokens);
  const label = state.tab === "models" ? "Anatomy Models" : "Animations";

  heading.innerHTML = query
    ? `${label} <span class="count">(${current.length})</span>`
    : `${label} <span class="count">(A – Z)</span>`;

  grid.replaceChildren();
  if (current.length === 0) {
    emptyEl.hidden = false;
    emptyEl.textContent = emptyMessage(query, other.length);
  } else {
    emptyEl.hidden = true;
    const frag = document.createDocumentFragment();
    for (const item of current) frag.append(cardElement(item));
    grid.append(frag);
  }

  crossEl.replaceChildren();
  if (query && other.length) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cross-link";
    const noun = otherKind === "animations" ? "animation" : "model";
    button.textContent = `${other.length} ${noun}${other.length === 1 ? "" : "s"} also match`;
    button.addEventListener("click", () => setTab(otherKind));
    crossEl.append(button);
    crossEl.hidden = false;
  } else {
    crossEl.hidden = true;
  }
}

function emptyMessage(query, otherCount) {
  if (!query && state.tab === "animations") {
    return "No animations in the collection yet. Disease animations will show up here, and a model can link to one when they are connected.";
  }
  if (!query) return "No models in the collection yet.";
  const shown = state.query.trim();
  if (otherCount) {
    const noun = state.tab === "models" ? "models" : "animations";
    return `Nothing in ${noun} matches “${shown}”.`;
  }
  return `Nothing matches “${shown}”. Try a structure, disease, or keyword such as lung, heart, or skeleton.`;
}

function cardElement(item) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "card";
  button.dataset.id = item.id;
  const tip = item.kind === "animation" ? "Play animation" : "View 3D model & details";
  button.innerHTML = `
    <span class="thumb">
      <img src="${escapeAttr(item.thumbnail)}" alt="">
      <span class="badge" aria-hidden="true">${item.kind === "animation" ? playIcon() : cubeIcon()}</span>
      <span class="tip">${escapeHtml(tip)}</span>
    </span>
    <span class="name">${escapeHtml(item.title)}</span>`;
  button.addEventListener("click", () => openItem(item));
  return button;
}

function usefulDescription(item) {
  const description = norm(item.description);
  if (!description) return "";
  if (description === norm(item.title) || description === norm(item.sketchfabName)) return "";
  return item.description;
}

function fillModal(item) {
  const related = (item.related || []).map(findItem).filter(Boolean);
  const description = usefulDescription(item);
  const showSource = item.sketchfabName && norm(item.sketchfabName) !== norm(item.title);
  const meta = [item.year, item.license].filter(Boolean).join(" · ");
  let viewer = "";
  if (item.kind === "animation") {
    if (item.embed) {
      viewer = `<iframe title="${escapeAttr(item.title)}" src="${escapeAttr(item.embed)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    } else if (item.video) {
      viewer = `<video controls playsinline src="${escapeAttr(item.video)}"></video>`;
    } else {
      viewer = `<p class="modal-desc">This animation does not have a video linked yet.</p>`;
    }
  } else {
    const src = `https://sketchfab.com/models/${encodeURIComponent(item.sketchfab)}/embed?autostart=1&ui_theme=dark&ui_hint=0&dnt=1`;
    viewer = `<iframe title="3D viewer: ${escapeAttr(item.title)}" src="${src}" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen></iframe>`;
  }

  modalBody.innerHTML = `
    <h2 id="modal-title">${escapeHtml(item.title)}</h2>
    ${showSource ? `<p class="modal-source">Sketchfab: ${escapeHtml(item.sketchfabName)}</p>` : ""}
    <div class="viewer">${viewer}</div>
    ${description ? `<p class="modal-desc">${escapeHtml(description)}</p>` : ""}
    ${(item.tags || []).length ? `<ul class="tags">${item.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}</ul>` : ""}
    ${related.length ? `<div class="related"><span>Related</span>${related.map((entry) => {
      const verb = entry.kind === "animation" ? "Watch" : "View model";
      return `<button type="button" data-related="${escapeAttr(entry.id)}">${verb}: ${escapeHtml(entry.title)}</button>`;
    }).join("")}</div>` : ""}
    ${item.viewerUrl ? `<div class="modal-actions"><a class="text-link" href="${escapeAttr(item.viewerUrl)}" target="_blank" rel="noopener noreferrer">Open on ${item.kind === "animation" ? "YouTube" : "Sketchfab"}</a></div>` : ""}
    ${meta ? `<p class="modal-meta">${escapeHtml(meta)}</p>` : ""}
    ${item.kind === "model" ? `<p class="modal-note">Use the viewer’s VR button to open this model in a headset.</p>` : ""}
  `;

  modalBody.querySelectorAll("[data-related]").forEach((button) => {
    button.addEventListener("click", () => {
      const next = findItem(button.dataset.related);
      if (next) openItem(next);
    });
  });
}

function clearModal() {
  state.openId = null;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  modalBody.innerHTML = "";
}

function openItem(item) {
  state.openId = item.id;
  setTab(item.kind === "animation" ? "animations" : "models", { updateHash: false });
  fillModal(item);
  modal.hidden = false;
  document.body.classList.add("modal-open");
  const hash = `#${item.id}`;
  if (location.hash !== hash) history.pushState({ id: item.id }, "", hash);
  closeBtn.focus();
}

// #id opens that model or animation. Back, Escape, and the close button return to the tab.
function syncFromLocation() {
  if (!state.collection) return;
  const id = decodeURIComponent(location.hash.replace(/^#/, ""));
  if (!id || id === "models" || id === "animations") {
    const previous = state.openId;
    clearModal();
    setTab(id === "animations" ? "animations" : "models", { updateHash: false });
    if (previous) {
      const card = grid.querySelector(`[data-id="${CSS.escape(previous)}"]`);
      if (card) card.focus();
    }
    return;
  }
  const item = findItem(id);
  if (!item) {
    clearModal();
    setTab("models", { updateHash: false });
    return;
  }
  state.openId = item.id;
  setTab(item.kind === "animation" ? "animations" : "models", { updateHash: false });
  fillModal(item);
  modal.hidden = false;
  document.body.classList.add("modal-open");
}

function requestClose() {
  if (!state.openId) return;
  if (history.state && history.state.id) {
    history.back();
    return;
  }
  const hash = state.tab === "animations" ? "#animations" : "#models";
  history.pushState({ tab: state.tab }, "", hash);
  syncFromLocation();
}

function focusables() {
  return [...panel.querySelectorAll("button, a[href], iframe, video, input, select, textarea")]
    .filter((el) => !el.disabled && el.tabIndex !== -1);
}

searchForm.addEventListener("submit", (event) => event.preventDefault());

searchInput.addEventListener("input", () => {
  state.query = searchInput.value;
  searchForm.classList.toggle("has-value", state.query.trim().length > 0);
  render();
});

tabModels.addEventListener("click", () => setTab("models"));
tabAnimations.addEventListener("click", () => setTab("animations"));

for (const tab of [tabModels, tabAnimations]) {
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next = state.tab === "models" ? tabAnimations : tabModels;
    next.click();
    next.focus();
  });
}

modal.addEventListener("click", (event) => {
  if (event.target.closest("[data-close]")) requestClose();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.openId) {
    event.preventDefault();
    requestClose();
    return;
  }
  if (event.key !== "Tab" || modal.hidden) return;
  const items = focusables();
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

window.addEventListener("popstate", syncFromLocation);

async function init() {
  try {
    const response = await fetch("data/collection.json");
    if (!response.ok) throw new Error(`Collection failed to load (${response.status})`);
    state.collection = await response.json();
    if (state.collection.collectionUrl) collectionLink.href = state.collection.collectionUrl;
    if (!location.hash) history.replaceState({ tab: "models" }, "", "#models");
    syncFromLocation();
  } catch (error) {
    heading.textContent = "Anatomy Models";
    emptyEl.hidden = false;
    emptyEl.textContent = "The collection could not be loaded. Refresh the page and try again.";
    console.error(error);
  }
}

init();
