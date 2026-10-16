/* ==========================================================================
   main.js — 렌더링 + 인터랙션
   --------------------------------------------------------------------------
   1. 유틸리티
   2. 렌더링 (data.js → DOM)
   3. 라우팅 (해시 기반 탭)
   4. 테마 토글
   5. 논문 통계 / 필터
   6. Reveal 애니메이션
   7. 파티클 캔버스 + 이메일 복사
   8. 맨 위로 버튼
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. 유틸리티 ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const noHover = window.matchMedia('(hover: none)');

  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** authors 문자열 → HTML  ( **me** / † / * 규칙 ) */
  const renderAuthors = (s) =>
    escapeHtml(s)
      .replace(/\*\*(.+?)\*\*/g, '<span class="me">$1</span>')
      .replace(/†/g, '<sup>†</sup>')
      .replace(/\*/g, '<sup>*</sup>');

  const hexToRgb = (hex) => {
    const h = hex.trim().replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };

  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return true; } catch { /* 포커스 없음 등 → fallback */ }
    }
    return fallbackCopy(text);
  }

  /* ---------- 2. 렌더링 ---------- */
  // 출판된 논문만 연도별 목록·통계·캐러셀에 쓰고, 투고/준비 중 원고는 따로 묶는다.
  const isPublished = (p) => !p.status || p.status === 'published';
  const pubs = PUBLICATIONS.filter(isPublished).sort((a, b) => b.year - a.year);
  const pending = PUBLICATIONS.filter((p) => !isPublished(p));
  // 본인 이름(**…**)에 † 가 붙어 있으면 공동 1저자, 아니면 단독 1저자
  const roleLabel = (p) =>
    p.role !== 'first' ? 'Co-author' : /\*\*[^*]*†\*\*/.test(p.authors) ? 'Co-1st Author' : '1st Author';
  const stats = {
    total: pubs.length,
    first: pubs.filter((p) => p.role === 'first').length,
    co: pubs.filter((p) => p.role === 'co').length,
    research: pubs.filter((p) => p.type === 'research').length,
    review: pubs.filter((p) => p.type === 'review').length,
    conferences: CONFERENCES.length,
  };

  // NEWS 는 입력 순서와 무관하게 최신순(연도 → 월)으로 정렬해 쓴다. 같은 달 안에서는 입력 순서 유지.
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const news = [...NEWS].sort((a, b) => b.year - a.year || MONTHS.indexOf(b.month) - MONTHS.indexOf(a.month));

  /** 소속 색 CSS 변수 문자열 (style 속성용). 소속 정보가 없으면 빈 문자열 */
  const affilVars = (affil) => {
    const g = (AFFILIATIONS[affil] || {}).gradient;
    return g ? `--affil-color-start:${g.start};--affil-color-mid:${g.mid};--affil-color-end:${g.end};--affil-shadow:${g.shadow}` : '';
  };
  const affilStyle = (affil) => {
    const v = affilVars(affil);
    return v ? `style="${v}"` : '';
  };

  function renderHero() {
    $('#heroName').innerHTML = `${escapeHtml(SITE.nameParts.first)} <span class="hl">${escapeHtml(SITE.nameParts.middle)}</span> ${escapeHtml(SITE.nameParts.last)}`;
    $('#heroText').innerHTML = HERO_PARAGRAPHS.map((p) => `<p class="tagline">${p}</p>`).join('');

    const photo = $('#profilePhoto');
    if (SITE.photo) {
      photo.classList.remove('profile-photo--placeholder');
      photo.innerHTML = `<img src="${escapeHtml(SITE.photo)}" alt="Portrait of ${escapeHtml(SITE.name)}" width="354" height="472" decoding="async">`;
    }

    $('#scholarLink').href = SITE.links.scholar;
    $('#linkedinLink').href = SITE.links.linkedin;
    $('#email3dText').textContent = SITE.email;
    $('#scholarLinkPanel').href = SITE.links.scholar;
  }

  // 키워드 칩 — 배열이면 줄바꿈되지 않는 그룹으로 묶음
  const keywordChips = (k) =>
    Array.isArray(k)
      ? `<span class="kw-group">${k.map((x) => `<span>${escapeHtml(x)}</span>`).join('')}</span>`
      : `<span>${escapeHtml(k)}</span>`;

  function interestCard(it, variant) {
    const cv = variant === 'cv';
    return `
      <${cv ? 'div' : 'button'} class="interest-card ${cv ? 'interest-card--cv' : 'interest-card--link'}"
           data-reveal ${cv ? '' : `type="button" data-goto="cv" aria-label="${escapeHtml(it.title)} — see details on the Personal / CV page"`}>
        <img class="card-bg" src="${it.background}" alt="" aria-hidden="true" loading="lazy" decoding="async">
        <div class="icon"><img src="${it.icon}" alt="" width="32" height="32" loading="lazy" decoding="async"></div>
        <div class="card-text-glass">
          <h3>${escapeHtml(it.title)}</h3>
          ${cv ? '' : `<p>${escapeHtml(it.short)}</p>`}
        </div>
        ${cv ? `<div class="interest-keywords">${it.keywords.map(keywordChips).join('')}</div>` : ''}
      </${cv ? 'div' : 'button'}>`;
  }

  function renderInterests() {
    $('#homeInterests').innerHTML = INTERESTS.map((it) => interestCard(it, 'home')).join('');
    $('#cvInterests').innerHTML = INTERESTS.map((it) => interestCard(it, 'cv')).join('');
  }

  function renderSnapshot() {
    $('#snap-total').textContent = stats.total;
    $('#snap-conf').textContent = stats.conferences;
    $('#snap-pending').textContent = pending.length; // 투고 + 준비 중 원고

    const card = (p, hidden) => `
      <a class="pub-carousel-card" href="${escapeHtml(p.link || SITE.links.scholar)}" target="_blank" rel="noopener"
         ${hidden ? 'aria-hidden="true" tabindex="-1"' : ''}>
        <div class="pcc-head">
          <span class="pcc-year">${p.year}</span>
          <span class="pcc-role ${p.role === 'first' ? 'first' : ''}">${roleLabel(p)}</span>
        </div>
        <div class="pcc-title">${escapeHtml(p.title)}</div>
        <div class="pcc-venue">${escapeHtml(p.venueShort || p.venue)}</div>
      </a>`;
    const track = $('#carouselTrack');
    track.innerHTML = pubs.map((p) => card(p, false)).join('') + pubs.map((p) => card(p, true)).join('');
    track.style.setProperty('--marquee-duration', `${Math.max(30, pubs.length * 5.5)}s`);
  }

  function renderPublications() {
    const affilBadge = (affil) =>
      `<span class="pub-affil" data-affil="${affil}"><span class="pub-affil-label">${escapeHtml((AFFILIATIONS[affil] || {}).label || '')}</span></span>`;
    const itemStyle = (affil) => `style="${affilVars(affil)};--affil-badge:${(AFFILIATIONS[affil] || {}).color}"`;
    const group = (id, heading, body, extraClass = '') => `
        <section class="pub-year-group ${extraClass}" aria-labelledby="${id}">
          <h3 class="pub-year" id="${id}">${heading}</h3>
          ${body}
        </section>`;

    // 출판 논문 — data-type / data-role 이 있는 항목만 통계 필터·hover 하이라이트 대상
    const published = (p) => `
              <article class="pub-item" data-type="${p.type}" data-role="${p.role}" data-year="${p.year}" data-reveal ${itemStyle(p.affil)}>
                <h3>${escapeHtml(p.title)}</h3>
                <div class="pub-authors">${renderAuthors(p.authors)}</div>
                <div class="pub-venue">${escapeHtml(p.venue)}, ${p.year}</div>
                <div class="pub-links">
                  <a class="pub-link" target="_blank" rel="noopener" href="${escapeHtml(p.link || SITE.links.scholar)}">${p.link ? 'Link' : 'Scholar'}</a>
                  ${affilBadge(p.affil)}
                </div>
              </article>`;

    // 투고 / 준비 중 원고
    const STATUS = { submitted: 'Submitted', 'in-prep': 'In preparation' };
    const pendingItem = (p) => `
              <article class="pub-item pub-item--pending" data-reveal ${itemStyle(p.affil)}>
                <h3>${escapeHtml(p.title)}<span class="pub-status">${STATUS[p.status] || escapeHtml(p.status)}</span></h3>
                <div class="pub-authors">${renderAuthors(p.authors)}</div>
                <div class="pub-venue">${p.status === 'submitted' && p.venue ? `Submitted to ${escapeHtml(p.venue)}` : 'Manuscript in preparation'}</div>
                <div class="pub-links">${affilBadge(p.affil)}</div>
              </article>`;

    // 학회 발표
    const FORMAT = { poster: 'Poster', oral: 'Oral Presentation' };
    const confItem = (c) => `
              <article class="pub-item pub-item--conf" data-reveal ${itemStyle(c.affil)}>
                <h3>${escapeHtml(c.title)}</h3>
                <div class="pub-authors">${renderAuthors(c.authors)}</div>
                <div class="pub-venue">${escapeHtml(c.venue)}, ${c.year}</div>
                <div class="pub-links">
                  <span class="pub-badge">${FORMAT[c.format] || escapeHtml(c.format)}</span>
                  ${c.award ? `<span class="pub-badge pub-badge--award">🏆 ${escapeHtml(c.award)}</span>` : ''}
                  ${affilBadge(c.affil)}
                </div>
              </article>`;

    const years = [...new Set(pubs.map((p) => p.year))];
    $('#pubList').innerHTML =
      years.map((y) => group(`pub-year-${y}`, y, pubs.filter((p) => p.year === y).map(published).join(''))).join('') +
      (pending.length ? group('pub-pending', 'Submitted &amp; In Preparation', pending.map(pendingItem).join(''), 'pub-year-group--label') : '') +
      (CONFERENCES.length ? group('pub-conferences', 'Conference Presentations', CONFERENCES.map(confItem).join(''), 'pub-year-group--label') : '');

    // 통계 패널
    $('#stat-total').textContent = stats.total;
    $('#stat-conf').textContent = stats.conferences;

    const row = (stat, label, count, extraClass = '') => `
      <button class="pub-bar-row" type="button" data-stat="${stat}" aria-pressed="false"
              aria-label="Filter: ${label} (${count})">
        <span class="pub-bar-label ${extraClass}">${label}</span>
        <span class="pub-bar-leader" aria-hidden="true"></span>
        <span class="pub-bar-count">${count}</span>
      </button>`;

    $('#barsRole').innerHTML = row('first', '1st Author', stats.first) + row('co', 'Co-author', stats.co);
    $('#barsType').innerHTML = row('research', 'Research', stats.research) + row('review', 'Review', stats.review);
  }

  /* News — trajectory 레이아웃. 소속이 바뀌는 지점마다 era 패널을 열고, 왼쪽 spine 을 따라 카드가 한 열로 흐른다.
     카드는 접이식. */
  function renderNews() {
    // EDUCATION 의 period ("Sep. 2026 – Present") 에서 월을 떼어 연도 범위만 사용
    const eraPeriod = (affil) => {
      const edu = EDUCATION.find((e) => e.affil === affil);
      return edu ? edu.period.replace(/[A-Za-z]{3}\. /g, '') : '';
    };

    // 필터 칩 (카테고리) + 범례 (소속)
    $('#njFilters').innerHTML = [['all', 'All'], ...Object.entries(NEWS_TAGS)]
      .map(([k, l]) => `<button class="nj-chip" type="button" data-filter-tag="${k}" aria-pressed="${k === 'all'}">${escapeHtml(l)}</button>`)
      .join('');
    $('#njLegend').innerHTML = Object.entries(AFFILIATIONS)
      .map(([k, af]) => `<button class="nj-chip nj-chip--affil" type="button" data-filter-affil="${k}" aria-pressed="false" ${affilStyle(k)}>
          <img src="${af.logo}" alt="" width="16" height="16" loading="lazy" decoding="async">${escapeHtml(af.label)}</button>`)
      .join('');

    // 본문 — 항목을 최신순으로 흐르게 두고, 소속이 바뀌는 지점마다 era 패널(연한 소속 색 상자)을 여닫는다.
    // 한 연도가 두 era 에 걸치면 두 era 모두 연도 구분선으로 시작한다.
    // spine 의 상단 cap("now") 은 가장 최근 소속 색을 따른다
    if (news.length) $('#njJourney').style.cssText = affilVars(news[0].affil);

    const card = (n, af) => `
      <article class="nj-item" data-tag="${n.tag}" data-affil="${n.affil || ''}" data-year="${n.year}" ${affilStyle(n.affil)} data-reveal>
        <span class="nj-node" data-tag="${n.tag}" aria-hidden="true"></span>
        <div class="nj-card">
          <button class="nj-toggle" type="button" aria-expanded="false">
            <span class="nj-meta">
              <span class="nj-month">${escapeHtml(n.month)}</span>
              <span class="nj-tag" data-tag="${n.tag}">${escapeHtml(NEWS_TAGS[n.tag] || n.tag)}</span>
              ${af.logo ? `<img class="nj-affil-logo" src="${af.logo}" alt="${escapeHtml(af.label || '')}" title="${escapeHtml(af.label || '')}" width="18" height="18" loading="lazy" decoding="async">` : ''}
            </span>
            <span class="nj-title">${n.title}</span>
            <span class="nj-chevron" aria-hidden="true"></span>
          </button>
          <div class="nj-body"><div class="nj-body-inner"><p>${n.body}</p></div></div>
        </div>
      </article>`;

    const yearDivider = (n) => `<div class="nj-year" data-year="${n.year}" ${affilStyle(n.affil)} data-reveal><span class="nj-year-badge">${n.year}</span></div>`;

    const eraOpen = (n, af) => `
      <section class="nj-era" data-affil="${n.affil || ''}" ${affilStyle(n.affil)} aria-label="${escapeHtml(af.label || '')}">
        <div class="nj-chapter" data-affil="${n.affil}" ${affilStyle(n.affil)} data-reveal>
          ${af.logo ? `<img src="${af.logo}" alt="" width="28" height="28" loading="lazy" decoding="async">` : ''}
          <span class="nj-chapter-name">${escapeHtml(af.label || '')}</span>
          <span class="nj-chapter-period">${escapeHtml(eraPeriod(n.affil))}</span>
        </div>`;

    let html = '';
    let prevAffil = null;
    let prevYear = null;
    news.forEach((n) => {
      const af = AFFILIATIONS[n.affil] || {};
      if (n.affil !== prevAffil) {
        if (prevAffil !== null) html += '</section>';
        html += eraOpen(n, af) + yearDivider(n); // 새 era 의 첫 연도는 chapter 라벨 아래에 (직전 era 와 같은 해여도 표시)
      } else if (n.year !== prevYear) {
        html += yearDivider(n); // 같은 era 안에서 해가 바뀜
      }
      html += card(n, af);
      prevAffil = n.affil;
      prevYear = n.year;
    });
    if (prevAffil !== null) html += '</section>';
    $('#njJourney').innerHTML = html;
  }

  function bindNewsInteractions() {
    const page = $('#news');
    if (!page) return;
    const filters = { tag: 'all', affil: null };

    function applyNewsFilters() {
      $$('.nj-chip[data-filter-tag]', page).forEach((c) => c.setAttribute('aria-pressed', c.dataset.filterTag === filters.tag));
      $$('.nj-chip[data-filter-affil]', page).forEach((c) => c.setAttribute('aria-pressed', c.dataset.filterAffil === filters.affil));

      $$('.nj-item', page).forEach((it) => {
        it.hidden = !((filters.tag === 'all' || it.dataset.tag === filters.tag) && (!filters.affil || it.dataset.affil === filters.affil));
      });
      // 항목이 하나도 남지 않은 연도(같은 era 안에서 판단) / chapter 는 흐리게
      $$('.nj-year', page).forEach((el) => {
        const scope = el.closest('.nj-era') || page;
        el.classList.toggle('nj-year--empty', !$(`.nj-item[data-year="${el.dataset.year}"]:not([hidden])`, scope));
      });
      $$('.nj-era', page).forEach((era) => era.classList.toggle('nj-era--empty', Boolean(filters.affil) && era.dataset.affil !== filters.affil));
    }

    page.addEventListener('click', (e) => {
      const tagChip = e.target.closest('.nj-chip[data-filter-tag]');
      if (tagChip) { filters.tag = tagChip.dataset.filterTag; applyNewsFilters(); return; }

      const affilChip = e.target.closest('.nj-chip[data-filter-affil]');
      if (affilChip) {
        filters.affil = filters.affil === affilChip.dataset.filterAffil ? null : affilChip.dataset.filterAffil;
        applyNewsFilters();
        return;
      }

      const toggle = e.target.closest('.nj-toggle');
      if (toggle) {
        const item = toggle.closest('.nj-item');
        const open = !item.classList.contains('is-open');
        item.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', open);
        return;
      }

      const all = e.target.closest('#njExpandAll');
      if (all) {
        const expand = all.getAttribute('aria-pressed') !== 'true';
        all.setAttribute('aria-pressed', expand);
        all.textContent = expand ? 'Collapse all' : 'Expand all';
        $$('.nj-item', page).forEach((it) => {
          it.classList.toggle('is-open', expand);
          $('.nj-toggle', it).setAttribute('aria-expanded', expand);
        });
      }
    });

    applyNewsFilters();
  }

  function renderCV() {
    const timeline = (items, map) => `
      <ol class="edu-timeline">
        ${items
          .map((it) => {
            const { sub, h4 } = map(it);
            return `
          <li class="edu-timeline-item ${it.current ? 'current' : ''}" data-affil="${it.affil || ''}">
            <span class="edu-dot" aria-hidden="true"></span>
            ${it.logo ? `<img class="edu-logo" src="${it.logo}" alt="" width="44" height="44" loading="lazy" decoding="async">` : ''}
            <div class="edu-content">
              <div class="card-sub ${it.affil === 'yonsei' ? 'yonsei' : ''}">${sub}</div>
              <h4>${h4}</h4>
              <span class="date">${escapeHtml(it.period)}</span>
            </div>
          </li>`;
          })
          .join('')}
      </ol>`;

    $('#eduTimeline').innerHTML = timeline(EDUCATION, (e) => ({
      sub: escapeHtml(e.institution),
      h4: `${escapeHtml(e.degree)}${e.advisor ? `<br><span class="edu-advisor">Advisor: ${escapeHtml(e.advisor)}</span>` : ''}`,
    }));
    $('#expTimeline').innerHTML = timeline(EXPERIENCE, (e) => ({
      sub: escapeHtml(e.position),
      h4: `${escapeHtml(e.place)}${e.lab ? `<br><span class="edu-lab">${escapeHtml(e.lab)}</span>` : ''}`,
    }));

    const btn = $('#cvDownload');
    if (SITE.cvUrl) {
      // 홈페이지를 벗어나지 않도록 새 탭의 PDF 뷰어로 연다 (저장은 뷰어의 다운로드 버튼으로)
      btn.setAttribute('href', SITE.cvUrl);
      btn.setAttribute('target', '_blank');
      btn.setAttribute('rel', 'noopener');
    } else {
      btn.setAttribute('href', '#cv');
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toast('CV PDF is coming soon — please contact me by email.');
      });
    }

    // 세로 선의 소속 전환 지점(--affil-split)을 실제 두 점 사이 중간으로 맞춘다.
    // 로고 로딩·창 크기 변화·탭 전환으로 높이가 바뀌면 ResizeObserver 가 다시 계산.
    const splitObserver = 'ResizeObserver' in window ? new ResizeObserver((ents) => ents.forEach((e) => setAffilSplit(e.target))) : null;
    $$('.edu-timeline').forEach((ol) => {
      setAffilSplit(ol);
      if (splitObserver) splitObserver.observe(ol);
    });
  }

  function setAffilSplit(ol) {
    const items = $$('.edu-timeline-item', ol);
    const idx = items.findIndex((el, i) => i > 0 && el.dataset.affil !== items[0].dataset.affil);
    const dotCenter = (el) => { const r = $('.edu-dot', el).getBoundingClientRect(); return r.top + r.height / 2; };
    if (idx < 1 || !ol.getBoundingClientRect().height) return; // 소속이 하나뿐이거나 탭이 숨겨진 상태
    const box = ol.getBoundingClientRect();
    const top = box.top + 6;              // ::before 의 top: 6px
    const height = box.height - 12;       // top/bottom 6px 씩 제외
    if (height <= 0) return;
    const mid = (dotCenter(items[idx - 1]) + dotCenter(items[idx])) / 2;
    const pct = ((mid - top) / height) * 100;
    ol.style.setProperty('--affil-split', `${Math.min(90, Math.max(10, pct)).toFixed(1)}%`);
  }

  function renderMeta() {
    document.title = `${SITE.name} — Georgia Tech`;
    const desc = $('meta[name="description"]');
    if (desc) desc.content = SITE.description;
    $('#footerYear').textContent = new Date().getFullYear();
    $('#footerName').textContent = SITE.name;

    const ld = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: SITE.name,
      email: `mailto:${SITE.email}`,
      jobTitle: 'PhD Student',
      affiliation: { '@type': 'CollegeOrUniversity', name: 'Georgia Institute of Technology' },
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'Yonsei University' },
      sameAs: Object.values(SITE.links),
      description: SITE.description,
    };
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  }

  /* ---------- 3. 라우팅 ---------- */
  // 탭 목록·순서·문서 제목은 index.html 의 헤더 내비게이션에서 그대로 읽어온다.
  // (탭을 추가하려면 HTML 의 .nav-link 와 같은 id 의 <section class="page"> 만 추가하면 됨)
  const navLinks = $$('#nav .nav-link');
  const PAGES = navLinks.map((a) => a.dataset.goto);
  const PAGE_TITLES = Object.fromEntries(navLinks.map((a) => [a.dataset.goto, a.textContent.trim()]));
  const HOME = PAGES[0];
  let currentPage = null;

  function showPage(id, { scroll = true } = {}) {
    if (!PAGES.includes(id)) id = HOME;
    if (id === currentPage) return;
    currentPage = id;

    $$('.page').forEach((p) => p.classList.toggle('active', p.id === id));
    navLinks.forEach((a) => {
      const on = a.dataset.goto === id;
      a.setAttribute('aria-selected', on);
      a.tabIndex = on ? 0 : -1;
    });
    document.title = id === HOME ? `${SITE.name} — Georgia Tech` : `${PAGE_TITLES[id]} · ${SITE.name}`;

    if (scroll) window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    revealPage($('#' + id));
    if (id !== 'publications') clearFilter();
    particles.setPageActive(id === 'home');
  }

  function navigate(id) {
    if (location.hash.slice(1) !== id) history.pushState(null, '', '#' + id);
    showPage(id);
  }

  // 탭이 아닌 해시(예: skip link 의 #main)는 페이지 안 이동이므로 탭을 바꾸지 않는다.
  function onHashChange() {
    const id = location.hash.slice(1);
    if (!id || PAGES.includes(id)) showPage(id || HOME);
  }
  window.addEventListener('hashchange', onHashChange);
  window.addEventListener('popstate', onHashChange);
  // #publications 같은 주소로 들어오면 브라우저가 그 섹션으로 스크롤해 제목이 헤더에 가려지므로 맨 위로 되돌린다
  window.addEventListener('load', () => {
    // 브라우저의 해시 스크롤이 load 직후에 일어나므로 한 박자 늦춰서 되돌린다
    if (PAGES.includes(location.hash.slice(1))) setTimeout(() => window.scrollTo(0, 0), 0);
  });

  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-goto]');
    if (link) {
      e.preventDefault();
      navigate(link.dataset.goto);
    }
  });

  // 키보드 ← → 로 탭 이동 (WAI-ARIA tabs 패턴)
  $('#nav').addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const i = PAGES.indexOf(currentPage);
    const next =
      e.key === 'ArrowLeft' ? PAGES[(i - 1 + PAGES.length) % PAGES.length]
      : e.key === 'ArrowRight' ? PAGES[(i + 1) % PAGES.length]
      : e.key === 'Home' ? PAGES[0] : PAGES[PAGES.length - 1];
    navigate(next);
    $(`.nav-link[data-goto="${next}"]`).focus();
  });

  /* ---------- 4. 테마 ---------- */
  const THEME_KEY = 'djl-theme';
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme(theme, persist) {
    document.documentElement.setAttribute('data-theme', theme);
    if (persist) {
      try { localStorage.setItem(THEME_KEY, theme); } catch { /* private mode */ }
    }
    $('#themeToggle').setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    // 브라우저 UI 색(theme-color)도 토글을 따르도록 두 meta 를 현재 테마의 --bg 로 맞춘다.
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    if (bg) $$('meta[name="theme-color"]').forEach((m) => { m.content = bg; });
    particles.onThemeChange();
  }

  $('#themeToggle').addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
  });
  systemDark.addEventListener('change', (e) => {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch { /* ignore */ }
    if (!saved) applyTheme(e.matches ? 'dark' : 'light', false);
  });

  /* ---------- 5. 논문 통계 / 필터 ---------- */
  const activeFilters = { type: null, role: null };
  const categoryOf = (stat) => (['research', 'review'].includes(stat) ? 'type' : 'role');
  const hasFilter = () => Boolean(activeFilters.type || activeFilters.role);
  const barRows = () => $$('.pub-bar-row[data-stat]');
  const pubItems = () => $$('#pubList .pub-item');
  const publishedItems = () => $$('#pubList .pub-item[data-type]');

  function matches(item) {
    if (!item.dataset.type) return false; // 투고·준비 중 원고, 학회 발표는 통계 필터 대상이 아님
    return (
      (!activeFilters.type || item.dataset.type === activeFilters.type) &&
      (!activeFilters.role || item.dataset.role === activeFilters.role)
    );
  }

  function applyFilters() {
    barRows().forEach((r) => {
      const stat = r.dataset.stat;
      const cat = categoryOf(stat);
      const selected = activeFilters[cat] === stat;
      r.classList.toggle('stat-highlight', selected);
      r.classList.toggle('stat-dim', Boolean(activeFilters[cat]) && !selected);
      r.setAttribute('aria-pressed', selected);
    });
    pubItems().forEach((item) => {
      const ok = matches(item);
      item.classList.toggle('stat-filtered-out', !ok);
      item.classList.toggle('affil-hover', ok);
    });
    $('#pubFilterHint').textContent = hasFilter() ? 'Click the same row again or anywhere else to clear.' : 'Click a row to filter the list.';
  }

  function clearFilter() {
    activeFilters.type = activeFilters.role = null;
    barRows().forEach((r) => {
      r.classList.remove('stat-highlight', 'stat-dim');
      r.setAttribute('aria-pressed', 'false');
    });
    pubItems().forEach((i) => i.classList.remove('stat-filtered-out', 'affil-hover'));
    const hint = $('#pubFilterHint');
    if (hint) hint.textContent = 'Click a row to filter the list.';
  }

  function bindPublicationInteractions() {
    // 통계 행 클릭 → 필터
    barRows().forEach((row) => {
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        const stat = row.dataset.stat;
        const cat = categoryOf(stat);
        activeFilters[cat] = activeFilters[cat] === stat ? null : stat;
        hasFilter() ? applyFilters() : clearFilter();
      });
    });
    // 바깥 클릭 → 필터 해제
    document.addEventListener('click', (e) => {
      if (hasFilter() && !e.target.closest('.pub-bar-row[data-stat]')) clearFilter();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && hasFilter()) clearFilter();
    });

    // 논문 hover → 사이드바 통계 행 하이라이트 (통계에 잡히는 출판 논문만)
    publishedItems().forEach((item) => {
      item.addEventListener('mouseenter', () => {
        if (hasFilter()) return;
        barRows().forEach((r) => {
          const stat = r.dataset.stat;
          const hit = stat === item.dataset.type || stat === item.dataset.role;
          r.classList.toggle('stat-highlight', hit);
          r.classList.toggle('stat-dim', !hit);
        });
      });
      item.addEventListener('mouseleave', () => {
        if (hasFilter()) return;
        barRows().forEach((r) => r.classList.remove('stat-highlight', 'stat-dim'));
      });
    });

  }

  /* ---------- 6. Reveal 애니메이션 ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          revealObserver.unobserve(en.target);
        }
      });
    },
    { threshold: 0.01, rootMargin: '0px 0px 10% 0px' } // 뷰포트에 닿기 조금 전에 미리 시작해 빈칸이 보이지 않게
  );

  function revealPage(page) {
    const els = $$('[data-reveal]', page);
    if (reducedMotion.matches) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    // 탭을 연 시점에 첫 화면에 보이는 항목만 짧게 스태거하고,
    // 스크롤해서 만나는 항목은 지연 없이 곧바로(짧고 은은하게) 나타나게 한다.
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    els.forEach((el, i) => {
      revealObserver.unobserve(el);
      el.classList.remove('is-visible');
      const inFirstScreen = el.getBoundingClientRect().top + scrollY < vh * 0.9;
      el.classList.toggle('reveal-quick', !inFirstScreen);
      el.style.setProperty('--reveal-delay', inFirstScreen ? `${Math.min(i, 6) * 60}ms` : '0ms');
    });
    requestAnimationFrame(() => els.forEach((el) => revealObserver.observe(el)));
  }

  /* ---------- 7. 파티클 캔버스 + 이메일 ---------- */
  const particles = (function () {
    const zone = $('#particleZone');
    const canvas = $('#particleCanvas');
    const reveal = $('#email3dReveal');
    const copyLabel = $('.email-3d-copy', reveal);
    const emailBtn = $('#emailBtn');
    const emailText = $('#email3dText');

    const api = { setPageActive() {}, onThemeChange() {} };

    async function copyEmail() {
      const ok = await copyText(SITE.email);
      copyLabel.textContent = ok ? 'copied!' : 'copy failed';
      copyLabel.classList.add('copied');
      toast(ok ? `Copied ${SITE.email}` : 'Could not copy — please copy manually');
      setTimeout(() => { copyLabel.textContent = 'click to copy'; copyLabel.classList.remove('copied'); }, 1500);
    }
    emailBtn.addEventListener('click', (e) => { e.stopPropagation(); copyEmail(); });
    emailText.addEventListener('click', (e) => { e.stopPropagation(); copyEmail(); });
    emailBtn.addEventListener('mouseenter', () => reveal.classList.add('active'));
    emailBtn.addEventListener('mouseleave', () => { if (!zone.classList.contains('is-revealed')) reveal.classList.remove('active'); });

    // 모션 최소화: 캔버스 없이 이메일만 정적으로 표시
    if (reducedMotion.matches) {
      zone.classList.add('particle-zone--static');
      reveal.classList.add('active');
      canvas.remove();
      return api;
    }
    // 터치 기기: 탭 → 이메일 표시, 다시 탭 → 복사 (안내 문구 표시)
    const touchMode = noHover.matches;
    if (touchMode) zone.classList.add('particle-zone--touch');
    $('.particle-hint-label', zone).textContent = touchMode ? 'tap to reveal email' : 'hover to reveal email';

    const ctx = canvas.getContext('2d');
    const PARTICLE_COUNT = 60, MOUSE_RADIUS = 120, REPEL_RADIUS = 220, REPEL_FORCE = 10, CONNECT_DIST = 110, MAX_TRAIL = 8;
    let W = 0, H = 0, dpr = 1, list = [];
    let running = false, rafId = null, inViewport = false, pageActive = true, repelActive = false;
    const mouse = { x: -9999, y: -9999, down: false, trail: [] };
    let fadeColor = 'rgba(245,240,235,0.3)', accentRgb = '0,48,87', litBoost = 0;

    function readTheme() {
      const css = getComputedStyle(document.documentElement);
      const [r, g, b] = hexToRgb(css.getPropertyValue('--bg') || '#F6F7F9');
      fadeColor = `rgba(${r},${g},${b},0.3)`;
      accentRgb = css.getPropertyValue('--accent-rgb').trim() || '0,48,87'; // 다크모드에서는 밝은 하늘색

      litBoost = document.documentElement.getAttribute('data-theme') === 'dark' ? 12 : 0;
      ctx.clearRect(0, 0, W, H);
    }

    function resize() {
      const rect = zone.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width; H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticle(x, y) {
      const hue = [210, 215, 205, 45][(Math.random() * 4) | 0];
      return {
        x: x ?? Math.random() * W, y: y ?? Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.6, alpha: Math.random() * 0.3 + 0.1,
        hue, sat: 55 + Math.random() * 30, lit: 55 + Math.random() * 15,
        phase: Math.random() * Math.PI * 2, life: 1, isBurst: false,
      };
    }

    function burst(bx, by) {
      for (let i = 0; i < 12; i++) {
        const angle = ((Math.PI * 2) / 12) * i + Math.random() * 0.3;
        const speed = 2 + Math.random() * 3;
        const p = createParticle(bx, by);
        p.vx = Math.cos(angle) * speed; p.vy = Math.sin(angle) * speed;
        p.r = Math.random() * 1.5 + 0.4; p.alpha = 0.5; p.isBurst = true; p.lit = 60 + Math.random() * 15;
        list.push(p);
      }
    }

    function frame() {
      if (!running) return;
      ctx.fillStyle = fadeColor;
      ctx.fillRect(0, 0, W, H);

      const t = performance.now() * 0.001;
      const cx = W / 2, cy = H / 2;
      const mIn = mouse.x > 0 && mouse.x < W && mouse.y > 0 && mouse.y < H;

      if (mIn) { mouse.trail.push({ x: mouse.x, y: mouse.y }); if (mouse.trail.length > MAX_TRAIL) mouse.trail.shift(); }
      if (mouse.trail.length > 1 && !repelActive) {
        for (let i = 1; i < mouse.trail.length; i++) {
          const a = mouse.trail[i - 1], b = mouse.trail[i], prog = i / mouse.trail.length;
          ctx.beginPath(); ctx.strokeStyle = `rgba(${accentRgb},${prog * 0.12})`; ctx.lineWidth = prog * 1.5;
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }

      if (mIn && !repelActive) {
        const gr = MOUSE_RADIUS * (1 + Math.sin(t * 4) * 0.15);
        const mg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, gr);
        mg.addColorStop(0, `rgba(${accentRgb},${mouse.down ? 0.1 : 0.05})`);
        mg.addColorStop(0.4, mouse.down ? 'rgba(21,101,192,0.03)' : `rgba(${accentRgb},0.015)`);
        mg.addColorStop(1, `rgba(${accentRgb},0)`);
        ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, gr, 0, Math.PI * 2); ctx.fill();
      }

      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        if (p.isBurst) { p.life -= 0.02; p.vx *= 0.94; p.vy *= 0.94; if (p.life <= 0) { list.splice(i, 1); continue; } }

        p.x += p.vx + Math.sin(t * 1.5 + p.phase) * 0.25;
        p.y += p.vy + Math.cos(t * 1.5 + p.phase * 1.3) * 0.18;
        if (!p.isBurst) { p.vx *= 0.992; p.vy *= 0.992; }

        if (repelActive) {
          const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy);
          if (d < REPEL_RADIUS && d > 0) { const f = (1 - d / REPEL_RADIUS) * REPEL_FORCE; p.vx += (dx / d) * f * 0.18; p.vy += (dy / d) * f * 0.18; }
        }
        if (mIn && !repelActive) {
          const mdx = mouse.x - p.x, mdy = mouse.y - p.y, md = Math.hypot(mdx, mdy);
          if (md < MOUSE_RADIUS && md > 0) {
            const s = 1 - md / MOUSE_RADIUS;
            if (mouse.down) { const ang = Math.atan2(mdy, mdx); p.vx += Math.cos(ang + 0.8) * s * 1.5; p.vy += Math.sin(ang + 0.8) * s * 1.5; }
            else { p.vx -= (mdx / md) * s * 1.2; p.vy -= (mdy / md) * s * 1.2; }
          }
        }

        const spd = Math.hypot(p.vx, p.vy);
        if (spd > 6) { p.vx = (p.vx / spd) * 6; p.vy = (p.vy / spd) * 6; }
        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx) * 0.6; }
        if (p.x > W) { p.x = W; p.vx = -Math.abs(p.vx) * 0.6; }
        if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy) * 0.6; }
        if (p.y > H) { p.y = H; p.vy = -Math.abs(p.vy) * 0.6; }

        const am = p.isBurst ? p.life : 1;
        const a = (p.alpha + Math.sin(t * 2.5 + p.phase) * 0.12) * am;
        const spdG = Math.min(spd / 4, 1), glowR = p.r * (3 + spdG * 4);
        const lit = p.lit + litBoost;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
        g.addColorStop(0, `hsla(${p.hue},${p.sat}%,${lit}%,${a * (0.8 + spdG * 0.5)})`);
        g.addColorStop(0.5, `hsla(${p.hue},${p.sat}%,${lit}%,${a * 0.2})`);
        g.addColorStop(1, `hsla(${p.hue},${p.sat}%,${lit}%,0)`);
        ctx.beginPath(); ctx.fillStyle = g; ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2); ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue},${p.sat - 10}%,${lit + 20}%,${Math.min(a * 2.5, 1)})`;
        ctx.arc(p.x, p.y, p.r * (1 + spdG * 0.5), 0, Math.PI * 2); ctx.fill();
      }

      for (let i = 0; i < list.length; i++) {
        const pi = list[i];
        if (pi.isBurst) continue;
        for (let j = i + 1; j < list.length; j++) {
          const pj = list[j];
          if (pj.isBurst) continue;
          const d = Math.hypot(pi.x - pj.x, pi.y - pj.y);
          if (d < CONNECT_DIST) {
            const la = (1 - d / CONNECT_DIST) * 0.08;
            const grad = ctx.createLinearGradient(pi.x, pi.y, pj.x, pj.y);
            grad.addColorStop(0, `hsla(${pi.hue},${pi.sat}%,${60 + litBoost}%,${la})`);
            grad.addColorStop(1, `hsla(${pj.hue},${pj.sat}%,${60 + litBoost}%,${la})`);
            ctx.beginPath(); ctx.strokeStyle = grad; ctx.lineWidth = (1 - d / CONNECT_DIST) * 1.2;
            ctx.moveTo(pi.x, pi.y); ctx.lineTo(pj.x, pj.y); ctx.stroke();
          }
        }
        if (mIn && !repelActive) {
          const md = Math.hypot(mouse.x - pi.x, mouse.y - pi.y);
          if (md < MOUSE_RADIUS) {
            ctx.beginPath(); ctx.strokeStyle = `rgba(${accentRgb},${(1 - md / MOUSE_RADIUS) * 0.1})`;
            ctx.lineWidth = (1 - md / MOUSE_RADIUS) * 0.8;
            ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(pi.x, pi.y); ctx.stroke();
          }
        }
      }
      rafId = requestAnimationFrame(frame);
    }

    function updateRunning() {
      const should = inViewport && pageActive && document.visibilityState === 'visible';
      if (should && !running) { running = true; rafId = requestAnimationFrame(frame); }
      else if (!should && running) { running = false; cancelAnimationFrame(rafId); }
    }

    // 이벤트 (마우스: hover로 표시 / 터치: 탭으로 표시)
    const pos = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const isTouch = (e) => e.pointerType === 'touch' || e.pointerType === 'pen';
    const show = () => { repelActive = true; reveal.classList.add('active'); zone.classList.add('is-revealed'); };
    const hide = () => { repelActive = false; reveal.classList.remove('active'); zone.classList.remove('is-revealed'); };

    zone.addEventListener('pointermove', (e) => { const p = pos(e); mouse.x = p.x; mouse.y = p.y; });
    zone.addEventListener('pointerenter', (e) => { if (!isTouch(e)) show(); });
    zone.addEventListener('pointerleave', (e) => {
      mouse.x = mouse.y = -9999; mouse.down = false; mouse.trail = [];
      if (!isTouch(e)) hide();
    });
    zone.addEventListener('pointerdown', (e) => {
      mouse.down = true;
      const p = pos(e);
      burst(p.x, p.y);
      if (e.target.closest('.email-3d-text')) return;          // 이메일 글자 자체는 click 핸들러가 복사
      if (isTouch(e) && !repelActive) { show(); return; }       // 첫 탭: 표시만
      if (repelActive) copyEmail();                             // 이후 탭 / 마우스 클릭: 복사
    });
    zone.addEventListener('pointerup', () => { mouse.down = false; });
    // 터치 기기에서 영역 밖을 탭하면 이메일 숨김
    if (touchMode) {
      document.addEventListener('pointerdown', (e) => { if (repelActive && !zone.contains(e.target)) hide(); }, { passive: true });
    }

    new IntersectionObserver((entries) => { inViewport = entries[0].isIntersecting; updateRunning(); }).observe(zone);
    document.addEventListener('visibilitychange', updateRunning);
    new ResizeObserver(() => { resize(); }).observe(zone);

    api.setPageActive = (on) => { pageActive = on; updateRunning(); };
    api.onThemeChange = readTheme;

    resize();
    readTheme();
    list = Array.from({ length: PARTICLE_COUNT }, () => createParticle());
    updateRunning();
    return api;
  })();

  /* ---------- 8. 맨 위로 버튼 ---------- */
  (function scrollTop() {
    const btn = $('#scrollTop');
    const update = () => btn.classList.toggle('visible', window.scrollY > 480);
    window.addEventListener('scroll', update, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' }));
    update();
  })();

  /* ---------- 초기화 ---------- */
  renderMeta();
  renderHero();
  renderInterests();
  renderSnapshot();
  renderPublications();
  renderNews();
  renderCV();
  bindPublicationInteractions();
  bindNewsInteractions();

  $('#themeToggle').setAttribute(
    'aria-label',
    document.documentElement.getAttribute('data-theme') === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  );
  showPage(location.hash.slice(1) || HOME, { scroll: false });
})();
