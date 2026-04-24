(function () {
  'use strict';

  // --- config ---
  const ROOT_ID = 'ycbk-topics-root';

  // --- helpers ---
  function escapeHtml(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeForSearch(s) {
    return String(s || '').toLowerCase();
  }

  // --- state ---
  const topics = Array.isArray(window.YCBK_TOPICS) ? window.YCBK_TOPICS : [];
  const state = {
    query: '',
    openTopics: new Set(),   // topic names that are currently expanded
  };

  // --- filter ---
  function filterTopics() {
    const q = normalizeForSearch(state.query);
    if (!q) return { list: topics, autoOpen: new Set() };
    const list = [];
    const autoOpen = new Set();
    for (const t of topics) {
      const nameMatch = normalizeForSearch(t.name).includes(q);
      const episodeMatches = t.episodes.filter(ep => normalizeForSearch(ep.title).includes(q));
      if (nameMatch) {
        list.push(t);
      } else if (episodeMatches.length > 0) {
        list.push(t);
        autoOpen.add(t.name);
      }
    }
    return { list, autoOpen };
  }

  // --- render ---
  function renderHero() {
    return `
      <section class="ycbk-topics__hero">
        <p class="ycbk-topics__subtitle">Browse recurring themes from all of Your College-Bound Kid podcasts. Each topic links directly to the relevant episodes.</p>
      </section>
    `;
  }

  function renderFilter() {
    const hasQuery = state.query.length > 0;
    return `
      <div class="ycbk-topics__filter-wrap">
        <input
          type="search"
          class="ycbk-topics__filter"
          data-action="filter-input"
          placeholder="Search topics or episodes..."
          aria-label="Filter topics or episodes"
          value="${escapeHtml(state.query)}">
        ${hasQuery ? `
          <button type="button" class="ycbk-topics__filter-clear" data-action="filter-clear" aria-label="Clear filter">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M4 4l8 8M12 4l-8 8"/>
            </svg>
          </button>
        ` : ''}
      </div>
    `;
  }

  function renderCount(shown, total, query) {
    const base = `${shown} topic${shown === 1 ? '' : 's'}`;
    if (!query) return `<p class="ycbk-topics__count" role="status">${base}</p>`;
    return `<p class="ycbk-topics__count" role="status">${base} matching &ldquo;${escapeHtml(query)}&rdquo;</p>`;
  }

  function renderEpisodeLi(ep) {
    return `
      <li>
        <span class="ycbk-topics__ep-num">#${escapeHtml(String(ep.num))}</span>
        <a href="${escapeHtml(ep.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ep.title)}</a>
      </li>
    `;
  }

  function renderTopic(topic, isOpen) {
    const openClass = isOpen ? ' ycbk-topics__topic--open' : '';
    const episodesHtml = isOpen
      ? `<ul class="ycbk-topics__episodes">${topic.episodes.map(renderEpisodeLi).join('')}</ul>`
      : '';
    return `
      <div class="ycbk-topics__topic${openClass}" data-topic="${escapeHtml(topic.name)}">
        <button
          type="button"
          class="ycbk-topics__topic-header"
          data-action="toggle-topic"
          data-topic-name="${escapeHtml(topic.name)}"
          aria-expanded="${isOpen ? 'true' : 'false'}">
          <h3 class="ycbk-topics__topic-name">${escapeHtml(topic.name)}</h3>
          <span class="ycbk-topics__topic-meta">
            <span class="ycbk-topics__topic-badge">${topic.episodes.length}</span>
            <svg class="ycbk-topics__topic-arrow" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </button>
        ${episodesHtml}
      </div>
    `;
  }

  function renderList(list, autoOpen) {
    if (list.length === 0) {
      return `<p class="ycbk-topics__empty" role="status">No topics match your search.</p>`;
    }
    const items = list.map(t => {
      const isOpen = state.openTopics.has(t.name) || autoOpen.has(t.name);
      return renderTopic(t, isOpen);
    }).join('');
    return `<div class="ycbk-topics__list">${items}</div>`;
  }

  function renderApp(root) {
    const { list, autoOpen } = filterTopics();
    // Preserve filter focus + selection across re-render.
    const active = document.activeElement;
    const wasFilter = active && active.dataset && active.dataset.action === 'filter-input';
    const selStart = wasFilter ? active.selectionStart : null;
    const selEnd = wasFilter ? active.selectionEnd : null;

    root.innerHTML = `
      ${renderHero()}
      ${renderFilter()}
      ${renderCount(list.length, topics.length, state.query)}
      ${renderList(list, autoOpen)}
    `;

    if (wasFilter) {
      const newInput = root.querySelector('[data-action="filter-input"]');
      if (newInput) {
        newInput.focus();
        if (selStart !== null) {
          try { newInput.setSelectionRange(selStart, selEnd); } catch (e) { /* noop */ }
        }
      }
    }
  }

  // --- init ---
  function init() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;

    function paint() { renderApp(root); }

    root.addEventListener('input', (e) => {
      const t = e.target;
      if (t && t.dataset && t.dataset.action === 'filter-input') {
        state.query = t.value;
        paint();
      }
    });

    root.addEventListener('keydown', (e) => {
      const t = e.target;
      if (t && t.dataset && t.dataset.action === 'filter-input' && e.key === 'Escape') {
        state.query = '';
        paint();
      }
    });

    root.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'toggle-topic') {
        const name = btn.dataset.topicName;
        if (state.openTopics.has(name)) {
          state.openTopics.delete(name);
        } else {
          state.openTopics.add(name);
        }
        paint();
      } else if (action === 'filter-clear') {
        state.query = '';
        paint();
      }
    });

    paint();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
