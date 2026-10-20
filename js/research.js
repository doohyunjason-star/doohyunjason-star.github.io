/* ==========================================================================
   research.js — Research 탭
   --------------------------------------------------------------------------
   index.html 에서 js/data.js → js/research-data.js → js/main.js
   다음에 실행되어, 이미 HTML 에 들어 있는 Research 섹션을 채우고 인터랙션을 연결합니다.
   ========================================================================== */
(function () {
  'use strict';

  // main.js 의 IIFE 안에 있는 작은 도우미들 — 밖에서 쓸 수 없어 같은 것을 둔다
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const noHover = window.matchMedia('(hover: none)');
  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const affilVars = (affil) => {
    const g = (AFFILIATIONS[affil] || {}).gradient;
    return g ? `--affil-color-start:${g.start};--affil-color-mid:${g.mid};--affil-color-end:${g.end};--affil-shadow:${g.shadow}` : '';
  };
  const affilStyle = (affil) => {
    const v = affilVars(affil);
    return v ? `style="${v}"` : '';
  };
  // 본인 이름(**…**)에 † 가 붙어 있으면 공동 1저자, 아니면 단독 1저자
  const roleLabel = (p) =>
    p.role !== 'first' ? 'Co-author' : /\*\*[^*]*†\*\*/.test(p.authors) ? 'Co-1st Author' : '1st Author';

  /* ---------- 2b. Research 탭 ---------- */
  // 논문·발표·프로젝트를 id 로 찾는다 (RESEARCH.threads[].refs / prep / side)
  const byId = Object.fromEntries([...PUBLICATIONS, ...CONFERENCES, ...PROJECTS].filter((x) => x.id).map((x) => [x.id, x]));
  const roleWords = (p) => ({ 'Co-1st Author': 'co-first author', '1st Author': 'first author', 'Co-author': 'co-author' })[roleLabel(p)];
  const RS_VISIBLE = 3; // 연세 칸에서 바로 보이는 항목 수 — 나머지는 'Show n more'
  let researchUnpin = () => {}; // showPage 가 다른 탭으로 갈 때 고정(pin)을 풀기 위해 bindResearchInteractions 가 채운다

  // 한 줄 항목: 짧은 이름(링크) + 학술지·상태·역할. refs 안의 배열은 같은 연구의 발표 여러 건을 한 줄로 묶는다
  function researchRef(ref) {
    const ids = Array.isArray(ref) ? ref : [ref];
    const items = ids.map((id) => byId[id] || (console.warn('RESEARCH: unknown id', id), null)).filter(Boolean);
    if (!items.length) return '';
    const p = items[0];
    const name = escapeHtml(p.short || p.title);
    const meta = items.map((q) => {
      if (q.format) {
        const parts = [escapeHtml(q.venueShort || q.venue), q.format === 'oral' ? 'oral presentation' : 'poster'];
        if (q.award) parts.push(`<strong class="rs-award">${escapeHtml(q.award)}</strong>`);
        return parts.join(' · ');
      }
      const parts = [];
      if (q.status === 'submitted') parts.push(`Submitted to ${escapeHtml(q.venue)}`);
      else if (q.status === 'in-prep') parts.push('In preparation');
      else parts.push(`${escapeHtml(q.venueShort || q.venue)}, ${q.year}`);
      if (q.type === 'review') parts.push('review');
      parts.push(roleWords(q));
      return parts.join(' · ');
    });
    const title = p.link ? `<a href="${escapeHtml(p.link)}" target="_blank" rel="noopener">${name}</a>` : name;
    return `<li class="rs-ref"><span class="rs-ref-title">${title}</span><span class="rs-ref-meta">${meta.join('; ')}</span></li>`;
  }

  // 논문·발표가 아닌 활동(다른 연구실 프로젝트, 스타트업) — 출처 줄이 붙은 중립색 블록
  function researchSide(id) {
    const s = byId[id];
    if (!s) { console.warn('RESEARCH: unknown id', id); return ''; }
    return `<div class="rs-side">
        <span class="rs-side-src">${escapeHtml(s.place)} · ${escapeHtml(s.period)}</span>
        <span class="rs-side-title">${escapeHtml(s.title)}</span>
        ${s.note ? `<span class="rs-side-note">${escapeHtml(s.note)}</span>` : ''}
      </div>`;
  }

  function renderResearch() {
    const R = RESEARCH;
    $('#rsTitle').innerHTML = `${escapeHtml(R.title.light)} <strong>${escapeHtml(R.title.bold)}</strong>`;
    $('#rsDesc').textContent = R.desc;

    // 두 패널 머리: 로고 + 응용 분야 + 학교 (+ 선택: 오른쪽 위 작은 메모). 소속색은 News 와 같은 변수
    Object.entries(R.eras).forEach(([key, e]) => {
      const af = AFFILIATIONS[key];
      const panel = $(`#rsPanel-${key}`);
      panel.style.cssText = affilVars(key);
      $('.rs-era', panel).innerHTML = `
        <img src="${af.logo}" alt="" width="28" height="28" loading="lazy" decoding="async">
        <span class="rs-era-name">${escapeHtml(e.title)}</span>
        <span class="rs-era-caption">${escapeHtml(e.school)}</span>
        ${e.note ? `<span class="rs-era-note">${escapeHtml(e.note)}</span>` : ''}`;
    });
    $('#rsChips').innerHTML = R.threads
      .map((t) => `<button class="nj-chip rs-chip" type="button" data-thread="${t.id}" aria-pressed="false">${escapeHtml(t.name)}</button>`)
      .join('');
    $('#rsCaption').textContent = noHover.matches ? R.hint.touch : R.hint.hover;
    $('#rsCaption').classList.add('rs-caption--hint');

    // 주제별 행 — 두 칸 모두 문장(summary). 연세 칸에 refs/prep 이 있으면 목록(3건 + 펼치기)도 붙인다
    $('#rsThreads').innerHTML = R.threads
      .map((t) => {
        const y = t.yonsei;
        const refs = (y.refs || []).map(researchRef);
        const prep = (y.prep || []).map(researchRef);
        const shown = refs.slice(0, RS_VISIBLE);
        const hidden = [...refs.slice(RS_VISIBLE), ...prep];
        return `
      <article class="rs-row" id="rs-row-${t.id}" data-thread="${t.id}" data-reveal>
        <div class="rs-row-head">
          <h3 class="rs-row-name" tabindex="-1">${escapeHtml(t.name)}</h3>
          <p class="rs-row-sub">${escapeHtml(t.sub)}</p>
        </div>
        <div class="rs-cell" ${affilStyle('yonsei')}>
          <span class="rs-cell-label">${escapeHtml(R.cellLabels.yonsei)}</span>
          ${y.summary ? `<p class="rs-cell-summary">${escapeHtml(y.summary)}</p>` : ''}
          ${shown.length ? `<ul class="rs-refs">${shown.join('')}</ul>` : ''}
          ${hidden.length ? `
          <ul class="rs-refs rs-refs--more" id="rs-more-${t.id}" hidden>${hidden.join('')}</ul>
          <button class="rs-more" type="button" aria-expanded="false" aria-controls="rs-more-${t.id}"
                  data-more="Show ${hidden.length} more${prep.length ? ` (incl. ${prep.length} in preparation)` : ''}">Show ${hidden.length} more${prep.length ? ` (incl. ${prep.length} in preparation)` : ''}</button>` : ''}
          ${(y.side || []).map(researchSide).join('')}
        </div>
        <div class="rs-cell rs-cell--gt" ${affilStyle('gatech')}>
          <span class="rs-cell-label">${escapeHtml(R.cellLabels.gatech)}</span>
          <p class="rs-cell-summary">${escapeHtml(t.gatech.summary)}</p>
        </div>
      </article>`;
      })
      .join('');

    $('#rsClosing').innerHTML = `${escapeHtml(R.closing)} <a href="#publications" data-goto="publications">Publications</a> page.`;
  }

  // 주제 칩 ↔ 그림 하이라이트. 상태는 #rsStage 의 data-active 하나로만 전달한다(CSS 가 두 그림의 층을 밝힘).
  // hover / focus = 미리보기, 클릭(터치는 탭) = 고정. 고정하면 캡션에 해당 행으로 가는 버튼이 나온다.
  function bindResearchInteractions() {
    const stage = $('#rsStage');
    if (!stage) return;
    const chips = () => $$('.rs-chip', stage);
    let pinned = null;

    const hint = () => escapeHtml(noHover.matches ? RESEARCH.hint.touch : RESEARCH.hint.hover);
    const setActive = (id) => {
      if (id) stage.dataset.active = id; else delete stage.dataset.active;
      chips().forEach((c) => c.classList.toggle('is-active', c.dataset.thread === id));
      const t = RESEARCH.threads.find((x) => x.id === id);
      $('#rsCaption').innerHTML = t
        ? `<strong>${escapeHtml(t.name)}</strong>. ${escapeHtml(t.approach)} ` +
          `<button class="rs-jump" type="button" data-jump="${t.id}">${escapeHtml(t.name)} in detail</button>`
        : hint();
      $('#rsCaption').classList.toggle('rs-caption--hint', !t);   // 안내 문구만 가운데 정렬 (주제 설명은 왼쪽 정렬 그대로)
    };
    const preview = (id) => { if (!pinned) setActive(id); };
    const restore = () => { if (!pinned) setActive(null); };
    const pin = (id) => { pinned = id; setActive(id); chips().forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.thread === id))); };
    const unpin = () => { if (!pinned) return; pinned = null; setActive(null); chips().forEach((c) => c.setAttribute('aria-pressed', 'false')); };
    researchUnpin = unpin;

    const jump = (id) => {
      const row = $(`#rs-row-${id}`);
      if (!row) return;
      row.scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      const h = $('.rs-row-name', row);
      if (h) h.focus({ preventScroll: true });
    };
    const threadOf = (node) => {
      const el = node && node.closest && node.closest('.rs-chip, .rs-thread');
      const id = el && el.dataset.thread;
      return id && id !== 'base' ? id : null;
    };

    // 마우스: 칩 또는 그림의 층 위에 있는 동안 미리보기
    stage.addEventListener('pointerover', (e) => { if (e.pointerType === 'touch') return; const id = threadOf(e.target); if (id) preview(id); });
    stage.addEventListener('pointerout', (e) => {
      if (e.pointerType === 'touch') return;
      const from = threadOf(e.target);
      if (!from || threadOf(e.relatedTarget) === from) return;
      restore();
    });
    // 키보드: 칩에 포커스가 가면 미리보기
    stage.addEventListener('focusin', (e) => { const id = threadOf(e.target); if (id) preview(id); });
    stage.addEventListener('focusout', (e) => { if (threadOf(e.target) && !stage.contains(e.relatedTarget)) restore(); });
    // 클릭: 고정 / 같은 주제를 다시 누르면 해제. 캡션의 'in detail' 버튼은 해당 행으로 이동
    stage.addEventListener('click', (e) => {
      const jumpBtn = e.target.closest('.rs-jump');
      if (jumpBtn) { jump(jumpBtn.dataset.jump); return; }
      const id = threadOf(e.target);
      if (!id) return;
      if (pinned === id) unpin(); else pin(id);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') unpin(); });
    document.addEventListener('click', (e) => { if (pinned && !e.target.closest('#rsStage')) unpin(); });

    // 패널이 한 줄로 쌓이는 폭(≤768px)에서는 패키지 라벨 글자를 키우므로(research.css), 오른쪽 라벨 칸을 넓힌다
    const gtArt = $('.rs-art--gt', stage);
    const narrow = window.matchMedia('(max-width: 768px)');
    const fitArt = () => { if (gtArt) gtArt.setAttribute('viewBox', narrow.matches ? '0 70 790 230' : '0 70 720 230'); };
    narrow.addEventListener('change', fitArt);
    fitArt();

    // 'Show n more' — 연세 칸의 나머지 항목 펼치기
    $('#rsThreads').addEventListener('click', (e) => {
      const btn = e.target.closest('.rs-more');
      if (!btn) return;
      const list = $(`#${btn.getAttribute('aria-controls')}`);
      const open = btn.getAttribute('aria-expanded') !== 'true';
      list.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Show less' : btn.dataset.more;
    });
  }

  renderResearch();
  bindResearchInteractions();

  // 주소가 #research 로 바로 열리면 main.js 의 등장 애니메이션이 이보다 먼저 실행돼 행들을 놓친다 → 바로 보이게
  if (location.hash.slice(1) === 'research') {
    $$('#research [data-reveal]').forEach((el) => el.classList.add('is-visible'));
  }
  // 다른 탭으로 가면 하이라이트 고정(pin)을 푼다 (main.js 의 showPage 에 연결할 수 없어 탭 클릭을 직접 본다)
  window.addEventListener('popstate', () => { if (location.hash.slice(1) !== 'research') researchUnpin(); });
})();
