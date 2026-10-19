/* ==========================================================================
   사이트 데이터 (Single Source of Truth)
   --------------------------------------------------------------------------
   이 파일만 수정하면 Home / Publications / Personal-CV / News 페이지가
   모두 자동으로 갱신됩니다. (논문 개수·통계·캐러셀도 자동 계산)

   - HTML을 직접 고칠 필요 없이 아래 배열/객체에 항목을 추가·삭제하세요.
   - 텍스트 안에서는 <a>, <strong>, <span class="hl"> 같은 간단한 HTML을 쓸 수 있습니다.
   - 저자 표기 규칙 (authors 문자열):
       **이름**  → 본인 (굵게 강조)
       이름†     → 공동 1저자 († 기호를 그대로 입력)
       이름*     → 교신저자 (* 기호를 그대로 입력)
   ========================================================================== */

const SITE = {
  name: 'Doohyun Jason Lee',
  nameParts: { first: 'Doohyun', middle: 'Jason', last: 'Lee' },
  email: 'd.jason@gatech.edu',

  // 프로필 사진 경로. 비워두면 플레이스홀더가 표시됩니다. 예: 'assets/img/profile.jpg'
  photo: 'assets/img/profile.jpg',

  // CV PDF 경로. 비워두면 "Download Full CV" 버튼이 준비중 안내를 띄웁니다. 예: 'assets/Doohyun_Jason_Lee_CV.pdf'
  cvUrl: 'assets/Doohyun_Jason_Lee_CV.pdf',

  links: {
    scholar: 'https://scholar.google.com/citations?user=cY0rYp0AAAAJ&hl=en',
    linkedin: 'https://www.linkedin.com/in/jason-lee-010356240',
  },

  // 검색엔진 / SNS 공유용 한 줄 소개
  description:
    'Doohyun Jason Lee — PhD student at Georgia Tech working on advanced packaging, 2.5D/3D heterogeneous integration, and co-packaged optics.',

  // 논문 수·1저자 수·학회 발표 수는 PUBLICATIONS / CONFERENCES 배열에서 자동 집계됩니다.
};

/* 홈 화면 자기소개 문단 (HTML 허용) */
const HERO_PARAGRAPHS = [
  `I am a PhD student in Electrical and Computer Engineering at
   <a href="https://ece.gatech.edu/" target="_blank" rel="noopener">Georgia Institute of Technology</a>.
   My research centers on advanced packaging and 2.5D/3D heterogeneous integration for semiconductors,
   spanning packaging technologies all the way from materials and devices to the system level,
   along with system-technology co-optimization (STCO) for next-generation electronic systems.`,

  `I received my B.S. from the School of Electrical and Electronic Engineering at
   <strong class="yonsei">Yonsei University</strong> in 2026.
   During my undergraduate studies, I worked with Professor
   <a class="yonsei" href="https://scholar.google.com/citations?user=HfU4zn8AAAAJ&hl=en" target="_blank" rel="noopener">Ki Jun Yu</a>
   on electronic materials and thin-film devices for flexible electronics.`,
];

/* 소속 기관 — 논문 카드의 배지 색상과 hover 그라데이션 */
const AFFILIATIONS = {
  gatech: {
    label: 'Georgia Tech',
    logo: 'assets/img/gatech-logo.webp',
    color: '#003057',
    gradient: { start: '#B3A369', mid: '#C9BA82', end: '#B3A369', shadow: 'rgba(179, 163, 105, 0.25)' },
  },
  yonsei: {
    label: 'Yonsei Univ.',
    logo: 'assets/img/yonsei-logo.webp',
    color: '#1766FF',
    gradient: { start: '#1766FF', mid: '#5B9DFF', end: '#A8CFFF', shadow: 'rgba(23, 102, 255, 0.2)' },
  },
};

/* 연구 관심사 — Home 카드는 제목 + short, CV 카드는 제목 + keywords(4개)만 표시
   keywords 안의 배열(예: [A, B])은 줄바꿈 없이 항상 같은 줄에 붙어 표시됩니다 */
const INTERESTS = [
  {
    id: 'packaging',
    title: 'Advanced Packaging & Heterogeneous Integration',
    icon: 'assets/img/packaging-icon.webp',
    background: 'assets/img/packaging.webp',
    short:
      'Semiconductor advanced packaging and heterogeneous integration technologies — design, fabrication, and reliability of emerging package platforms.',
    keywords: [['Signal Integrity', 'Power Integrity'], 'Interconnect Design', 'Package Reliability'],
  },
  {
    id: 'optics',
    title: 'Microscale Cooling & Glass Packaging',
    icon: 'assets/img/optics-icon.webp',
    background: 'assets/img/optics.webp',
    short:
      'Microscale thermal management and glass-based packaging platforms for next-generation high-performance electronic systems.',
    keywords: ['Glass Core Substrates', 'Through-Glass Vias', 'Microfluidic Cooling', 'High-Performance Computing'],
  },
  {
    id: 'flexible',
    title: 'Flexible Electronics',
    icon: 'assets/img/flexible-icon.webp',
    background: 'assets/img/flexible.webp',
    short:
      'Heterogeneous integration of electronic materials for thin-film devices and bio-integrated electronics.',
    keywords: ['Silicon Nanomembranes', 'Thin-Film Transistors', 'Bio-Integrated Electronics', 'Wearable Electronics'],
  },
];

/* ==========================================================================
   논문 목록
   --------------------------------------------------------------------------
   status    : 'published' (기본값, 생략 가능) | 'submitted' | 'in-prep'
               · published  → 연도별 목록, 통계, 홈 캐러셀에 표시 (year 내림차순, 같은 해는 배열 순서)
               · submitted / in-prep → 'Submitted & In Preparation' 묶음에 배열 순서대로 표시,
                 통계·캐러셀에서는 제외
   year      : 출판 연도 (published 만 필요)
   type      : 'research' | 'review'
   role      : 'first' (1저자 / 공동 1저자) | 'co' (공저자)
   affil     : 'gatech' | 'yonsei'  (AFFILIATIONS 키)
   venue     : 저널명 (submitted 는 투고한 저널, in-prep 은 생략)
   venueShort: 홈 캐러셀에 쓰이는 짧은 저널명 (선택)
   link      : 논문 URL (published 만. 없으면 Google Scholar로 연결)
   ========================================================================== */
const PUBLICATIONS = [
  /* ---------- Published ---------- */
  {
    year: 2026,
    id: 'device-2026-gauges',
    short: 'Temperature-compensated silicon nanomembrane gauges for battery swelling', // 짧은 이름
    title: 'Temperature-Compensated Silicon Nanomembrane Gauges for Monitoring Lithium-Ion Battery Swelling',
    authors:
      'Taemin Kim†, Kyubeen Kim†, In Sik Min†, Ankan Dutta, Young Soo Kim, Giyoung Kim, Jongchan Han, Jongwoon Shin, Jeong Eun Ju, **Doohyun J. Lee**, Heekyeong Choi, Hokeon Lee, Myeongki Cho, Jaejin Park, Kyowon Kang, Mingyu Sang, Huanyu Cheng, Ju Young Lee*, Ki Jun Yu*',
    venue: 'Device',
    type: 'research',
    role: 'co',
    affil: 'yonsei',
    link: 'https://doi.org/10.1016/j.device.2026.101308',
  },
  {
    year: 2026,
    id: 'bios-2026-sports',
    short: 'Flexible bioelectronics for sports wearable monitoring', // 짧은 이름
    title: 'Flexible and Stretchable Bioelectronics for Sports Wearable Monitoring: Materials, Device Engineering, and Intelligent Wearable Platforms',
    authors: 'Junseok Lee†, Yena Lee†, Jongwoon Shin†, **Doohyun J. Lee†**, Hyosang Yoon, Ju Young Lee*, Ki Jun Yu*, Mingyu Sang*',
    venue: 'Biosensors and Bioelectronics',
    type: 'review',
    role: 'first',
    affil: 'yonsei',
    link: 'https://www.sciencedirect.com/science/article/pii/S0956566326009565?dgcid=coauthor',
  },
  {
    year: 2026,
    id: 'bmel-2026-sinm',
    short: 'Silicon nanomembrane bioelectronics for implantable systems', // 짧은 이름
    title: 'Advanced Silicon Nanomembrane Based Bioelectronics for Flexible and Stretchable Implantable Systems',
    authors: 'Junseok Lee†, Yena Lee†, Hanbi Woo†, Minji Hong, **Doohyun J. Lee**, Mingyu Sang*',
    venue: 'Biomedical Engineering Letters',
    type: 'review',
    role: 'co',
    affil: 'yonsei',
    link: 'https://link.springer.com/article/10.1007/s13534-026-00568-x',
  },
  {
    year: 2025,
    id: 'ijem-2025-roadmap',
    short: 'Roadmap of ultrathin crystalline-silicon bioelectronics', // 짧은 이름
    title: 'Technical Roadmap of Ultra-Thin Crystalline Silicon-Based Bioelectronics',
    authors: 'Mingyu Sang†, Kyubeen Kim†, **Doohyun J. Lee†**, Young Uk Cho*, Jung Woo Lee*, Ki Jun Yu*',
    venue: 'International Journal of Extreme Manufacturing',
    venueShort: 'Int. J. of Extreme Manufacturing',
    type: 'review',
    role: 'first',
    affil: 'yonsei',
    link: 'https://iopscience.iop.org/article/10.1088/2631-7990/add7a4/meta',
  },
  {
    year: 2024,
    id: 'sciadv-2024-eskin',
    short: 'Durable EIT-based ultrathin e-skin for 3D tactile interfaces', // 짧은 이름
    title: 'Extremely Durable Electrical Impedance Tomography-Based Soft and Ultrathin Wearable E-Skin for Three-Dimensional Tactile Interfaces',
    authors:
      'Kyubeen Kim†, Jung-Hoon Hong†, Kyubin Bae†, Kyounghun Lee, **Doohyun J. Lee**, Junsu Park, Haozhe Zhang, Mingyu Sang, Jeong Eun Ju, Young Uk Cho, Kyowon Kang, Wonkeun Park, Suah Jung, Jung Woo Lee, Baoxing Xu, Jongbaeg Kim*, Ki Jun Yu*',
    venue: 'Science Advances',
    type: 'research',
    role: 'co',
    affil: 'yonsei',
    link: 'https://www.science.org/doi/full/10.1126/sciadv.adr1099',
  },
  {
    year: 2024,
    id: 'apr-2024-neuromorphic',
    short: 'Soft neuromorphic tactile sensory systems', // 짧은 이름
    title: 'Biomimic and Bioinspired Soft Neuromorphic Tactile Sensory System',
    authors: 'Kyowon Kang†, Kiho Kim†, Junhyeong Baek, **Doohyun J. Lee**, Ki Jun Yu*',
    venue: 'Applied Physics Reviews',
    type: 'review',
    role: 'co',
    affil: 'yonsei',
    link: 'https://pubs.aip.org/aip/apr/article/11/2/021328/3295971',
  },

  /* ---------- Submitted ---------- */
  {
    status: 'submitted',
    id: 'science-au-doping',
    short: 'Laser-induced gold doping of silicon for core temperature sensing', // 짧은 이름
    title: 'Laser-Induced Gold Doping of Single-Crystalline Silicon for Wearable Core Temperature Sensing',
    authors: 'Kyubeen Kim†, **Doohyun J. Lee†**, Sang Hoon Park†, Jongwoon Shin†, ..., Mingyu Sang*, Ju Young Lee*, Ki Jun Yu*',
    venue: 'Science',
    type: 'research',
    role: 'first',
    affil: 'yonsei',
  },
  {
    status: 'submitted',
    id: 'advmat-ferroelectric',
    short: 'Ferroelectric materials for flexible electronics', // 짧은 이름
    title: 'Functional Properties and Strategies of Ferroelectric Materials for Flexible Electronics',
    authors: 'Junseok Lee†, ..., **Doohyun J. Lee†**, ..., Mingyu Sang*',
    venue: 'Advanced Materials',
    type: 'review',
    role: 'first',
    affil: 'gatech',
  },

  /* ---------- In preparation ---------- */
  {
    status: 'in-prep',
    id: 'prep-aunp-gas',
    short: 'Gas sensor on a gold-nanoparticle-decorated silicon nanomembrane', // 짧은 이름
    title: 'A Micro-Structured Flexible Gas Sensor Based on Gold Nanoparticle-Decorated Silicon Nanomembrane for Hazardous Gas Detection',
    authors: 'Jongwoon Shin†, **Doohyun J. Lee†**, ..., Ki Jun Yu*',
    type: 'research',
    role: 'first',
    affil: 'yonsei',
  },
  {
    status: 'in-prep',
    id: 'prep-ir-photodiode',
    short: 'Implantable infrared photodiode for neural modulation', // 짧은 이름
    title: 'Fully Implantable Photodiode for Optoelectronic Neural Modulation with Infrared Light',
    authors: 'Ju Young Lee†, **Doohyun J. Lee†**, ..., Ki Jun Yu*',
    type: 'research',
    role: 'first',
    affil: 'yonsei',
  },
  {
    status: 'in-prep',
    id: 'prep-rgo-gas',
    short: 'rGO-decorated silicon nanomembrane gas sensor', // 짧은 이름
    title: 'rGO-Decorated Silicon Nanomembrane for Hazardous Gas Detection',
    authors: 'Min Young Lee†, ..., **Doohyun J. Lee**, ..., Ki Jun Yu*',
    type: 'research',
    role: 'co',
    affil: 'yonsei',
  },
  {
    status: 'in-prep',
    id: 'prep-led-probe',
    short: 'LED-integrated flexible neural probe', // 짧은 이름
    title: 'LED-Integrated Flexible Neural Probe for Simultaneous Stimulation and Recording of Electrophysiological Signals',
    authors: 'Ju Young Lee†, ..., **Doohyun J. Lee**, ..., Ki Jun Yu*',
    type: 'research',
    role: 'co',
    affil: 'yonsei',
  },
  {
    status: 'in-prep',
    id: 'prep-pd-h2-tft',
    short: 'Palladium-gate thin-film silicon transistor for hydrogen sensing', // 짧은 이름
    title: 'Thin-Film Silicon Transistors with a Nanostructured Palladium Gate for a Wearable Hydrogen Gas Sensing System',
    authors: 'Dongjun Cho†, ..., **Doohyun J. Lee**, ..., Ki Jun Yu*',
    type: 'research',
    role: 'co',
    affil: 'yonsei',
  },
];

/* ==========================================================================
   학회 발표 — 배열 순서대로 표시 (Publications 페이지 하단, 발표 수는 자동 집계)
   --------------------------------------------------------------------------
   format : 'poster' | 'oral'
   award  : 수상 내역 (선택) — 배지로 표시
   ========================================================================== */
const CONFERENCES = [
  {
    year: 2025,
    id: 'kosombe-2025-brain-temp',
    venueShort: 'KOSOMBE 2025',
    short: 'Gold-doped silicon nanomembrane sensor for brain-surface temperature', // 짧은 이름
    title: 'Ultrathin Gold-Doped Silicon Nanomembrane Sensor for Real-Time Brain Surface Temperature Monitoring',
    authors: '**Doohyun J. Lee**, Kyubeen Kim, Ju Young Lee, Mingyu Sang*, Ki Jun Yu*',
    venue: 'Fall Conference of the Korean Society of Medical & Biological Engineering (KOSOMBE)',
    format: 'poster',
    award: 'Best Poster Award',
    affil: 'yonsei',
  },
  {
    year: 2025,
    id: 'mrsk-2025-gas',
    venueShort: 'MRS-K 2025',
    short: 'Gas sensor on a gold-nanoparticle-decorated silicon nanomembrane', // 짧은 이름
    title: 'A Micro-Structured Flexible Gas Sensor Based on Gold Nanoparticle-Decorated Silicon Nanomembrane for Hazardous Gas Detection',
    authors: '**Doohyun J. Lee**, Jongwoon Shin, Yelynn Ryu, Wooyoung Lee*, Ki Jun Yu*',
    venue: 'Fall Conference of Materials Research Society of Korea (MRS-K)',
    format: 'oral',
    affil: 'yonsei',
  },
  {
    year: 2025,
    id: 'kss-2025-brain-temp',
    venueShort: 'KSS 2025',
    short: 'Gold-doped silicon nanomembrane sensor for brain-surface temperature', // 짧은 이름
    title: 'Ultrathin Gold-Doped Silicon Nanomembrane Sensor for Real-Time Brain Surface Temperature Monitoring',
    authors: '**Doohyun J. Lee**, Kyubeen Kim, Ju Young Lee, Mingyu Sang*, Ki Jun Yu*',
    venue: 'Fall Conference of Korean Sensors Society (KSS)',
    format: 'poster',
    affil: 'yonsei',
  },
  {
    year: 2025,
    id: 'kss-2025-sweat-thermal',
    venueShort: 'KSS 2025',
    short: 'Wearable sweat sensor with a porous active thermal layer', // 짧은 이름
    title: 'Wearable Sweat Sensor with a Porous Active Thermal Layer for Enhanced Signal Repolarization and Amplification',
    authors: 'Junseok Lee, **Doohyun J. Lee**, Ki Jun Yu*, Mingyu Sang*',
    venue: 'Fall Conference of Korean Sensors Society (KSS)',
    format: 'poster',
    affil: 'yonsei',
  },
  {
    year: 2025,
    id: 'kosombe-2025-nacl',
    venueShort: 'KOSOMBE 2025',
    short: 'Temperature effects on PEDOT:PSS and graphene-oxide electrodes for NaCl sensing', // 짧은 이름
    title: 'Effect of Temperature on the Performance of PEDOT:PSS and Graphene Oxide Electrodes for a Potentiometric NaCl Concentration Sensor',
    authors: 'Junseok Lee, **Doohyun J. Lee**, Hyosang Yoon, Ki Jun Yu*, Mingyu Sang*',
    venue: 'Fall Conference of the Korean Society of Medical & Biological Engineering (KOSOMBE)',
    format: 'poster',
    affil: 'yonsei',
  },
];

/* ==========================================================================
   뉴스 — 입력 순서와 무관하게 연도·월 기준 최신순으로 자동 정렬 (같은 달은 입력 순서 유지)
   --------------------------------------------------------------------------
   tag   : 'award' | 'position' | 'publication'
   affil : 'gatech' | 'yonsei'  (AFFILIATIONS 키) — hover 시 카드 우측 상단에 학교 로고·색상 표시
   title / body : HTML 허용. 강조는 <span class="hl">…</span>
   ========================================================================== */
const NEWS = [
  {
    year: 2026, month: 'Sep', tag: 'award', icon: '🏆', affil: 'gatech',
    title: 'Selected as a <span class="hl">DoD SCALE Fellow</span>!',
    body: 'Accepted into the <a href="https://engineering.purdue.edu/SCALE" target="_blank" rel="noopener">Scalable Asymmetric Lifecycle Engagement (SCALE)</a> program, a U.S. Department of Defense (DoD) microelectronics workforce development initiative, in the Heterogeneous Integration / Advanced Packaging (HI/AP) technical area.',
  },
  {
    year: 2026, month: 'Aug', tag: 'award', icon: '🏆', affil: 'gatech',
    title: 'Recipient of the <span class="hl">Georgia Tech ECE ON Semiconductor Fellowship</span>!',
    body: 'Awarded the ON Semiconductor Fellowship from the School of Electrical and Computer Engineering at Georgia Institute of Technology.',
  },
  {
    year: 2026, month: 'Aug', tag: 'position', icon: '🎉', affil: 'gatech',
    title: 'Joined <span class="hl">Georgia Institute of Technology</span> as a PhD Student!',
    body: 'Started the Ph.D. program in Electrical and Computer Engineering at Georgia Institute of Technology.',
  },
  {
    year: 2026, month: 'Aug', tag: 'position', icon: '🎓', affil: 'yonsei',
    title: 'Graduated from <span class="hl">Yonsei University</span> with a Bachelor\'s Degree',
    body: 'Majored in Electrical and Electronic Engineering at Yonsei University, South Korea.<br>Worked as an Undergraduate RA at <a href="https://bioelectronics.yonsei.ac.kr/" target="_blank" rel="noopener">FBEE</a> for 4 years (Advisor: <a href="https://scholar.google.com/citations?user=HfU4zn8AAAAJ&hl=en" target="_blank" rel="noopener">Ki Jun Yu</a>).',
  },
  {
    year: 2025, month: 'Nov', tag: 'award', icon: '🏆', affil: 'yonsei',
    title: '<span class="hl">Best Poster Award</span> at the 2025 Fall Conference of KOSOMBE',
    body: 'Received the Best Poster Award at the 2025 Fall Conference of Korean Society of Medical & Biological Engineering (KOSOMBE)!',
  },
  {
    year: 2025, month: 'Nov', tag: 'publication', icon: '📢', affil: 'yonsei',
    title: 'Gave an <span class="hl">Oral Presentation</span> at MRS-K Fall Conference 2025',
    body: 'Delivered my first-ever oral presentation at the Materials Research Society of Korea (MRS-K)!',
  },
  {
    year: 2025, month: 'Oct', tag: 'publication', icon: '🎉', affil: 'yonsei',
    title: 'Published a 1st Authored <span class="hl">Review Article</span> as an Undergraduate Research Assistant!',
    body: 'Our work on materials and fabrication strategies of silicon-based flexible electronics for biomedical applications was published in the International Journal of Extreme Manufacturing.',
  },
  {
    year: 2025, month: 'Sep', tag: 'award', icon: '🏆', affil: 'yonsei',
    title: 'Received the <span class="hl">Next-Generation Engineer Scholar Award</span> by IPESK',
    body: 'Honored as one of 51 outstanding engineering students across South Korea for academic and research excellence from the Institute for Promotion of Engineering and Science of Korea (IPESK).',
  },
  {
    year: 2024, month: 'Jun', tag: 'publication', icon: '🎉', affil: 'yonsei',
    title: 'Published My First-Ever <span class="hl">Review Article</span> as an Undergraduate Research Assistant',
    body: 'Our work on neuromorphic tactile sensory systems was published in Applied Physics Reviews.',
  },
  {
    year: 2024, month: 'Jun', tag: 'publication', icon: '🎉', affil: 'yonsei',
    title: 'Published My First-Ever <span class="hl">Research Article</span> as an Undergraduate Research Assistant',
    body: 'Our work on an ultra-thin wearable e-skin for tactile sensing was published in Science Advances.',
  },
  {
    year: 2022, month: 'Jun', tag: 'position', icon: '🎉', affil: 'yonsei',
    title: 'Started My Research Career at <span class="hl">Yonsei University</span> as an Undergraduate Research Assistant',
    body: 'Joined the <a href="https://bioelectronics.yonsei.ac.kr/" target="_blank" rel="noopener">Functional Bio-Integrated Electronics and Energy Management Lab (FBEE)</a> at Yonsei University, led by Prof. <a href="https://scholar.google.com/citations?user=HfU4zn8AAAAJ&hl=en" target="_blank" rel="noopener">Ki Jun Yu</a>.',
  },
  {
    year: 2021, month: 'Mar', tag: 'position', icon: '📘', affil: 'yonsei',
    title: 'Started a Double Major in <span class="hl">Electrical and Electronic Engineering</span>',
    body: 'Added Electrical and Electronic Engineering as a double major at Yonsei University.',
  },
  {
    year: 2020, month: 'Mar', tag: 'position', icon: '🎉', affil: 'yonsei',
    title: 'Started My Undergraduate Studies at <span class="hl">Yonsei University</span>',
    body: 'Enrolled at Yonsei University, South Korea, as a Physics major.',
  },
];

const NEWS_TAGS = {
  award: 'Honors / Awards',
  position: 'Position / Education',
  publication: 'Publication / Conference',
};

/* ==========================================================================
   CV — 학력 / 연구 경력 (current: true 이면 펄스 점으로 강조)
   EDUCATION.advisor : 지도교수 (선택) — 학위 아랫줄에 표시
   EXPERIENCE.lab    : 소속 연구실 이름 (선택) — 학교 아랫줄에 표시
   ========================================================================== */
const EDUCATION = [
  {
    institution: 'Georgia Institute of Technology, USA',
    degree: 'Ph.D. Student in Electrical and Computer Engineering',
    period: 'Sep. 2026 – Present',
    logo: 'assets/img/gatech-logo.webp',
    affil: 'gatech',
    current: true,
  },
  {
    institution: 'Yonsei University, South Korea',
    degree: 'B.S. in Electrical and Electronic Engineering',
    advisor: 'Ki Jun Yu',
    period: 'Mar. 2020 – Aug. 2026',
    logo: 'assets/img/yonsei-logo.webp',
    affil: 'yonsei',
  },
];

const EXPERIENCE = [
  {
    position: 'Graduate Research Assistant',
    place: 'Georgia Institute of Technology',
    period: 'Sep. 2026 – Present',
    logo: 'assets/img/gatech-logo.webp',
    affil: 'gatech',
    current: true,
  },
  {
    position: 'Undergraduate Research Assistant',
    place: 'Yonsei University',
    lab: 'Functional Bio-Integrated Electronics and Energy Management Lab (FBEE)',
    period: 'Jun. 2022 – Aug. 2026',
    logo: 'assets/img/yonsei-logo.webp',
    affil: 'yonsei',
  },
];
