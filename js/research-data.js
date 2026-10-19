/* ==========================================================================
   Research 탭
   --------------------------------------------------------------------------
   PROJECTS : 논문·발표가 아닌 연구 활동(CV). 지금은 Research 탭에 표시하지 않음
              (Research 탭은 연구 분야 설명 + 논문·발표만. 나중에 세부 소개에서 쓸 수 있게 남겨 둠)
   RESEARCH : 탭 본문
     - 세 갈래: materials / fabrication / system. threads[].id 는 두 단면도의 <g data-thread="…"> 값과
       같아야 합니다. 한 층이 두 갈래에 속하면 data-thread="materials system" 처럼 공백으로 나열합니다.
     - 각 행의 yonsei 칸 = 유연 박막 전자소자(이전 연구), gatech 칸 = 반도체 패키징(현재 방향).
     - yonsei 칸도 gatech 칸처럼 연구 소개와 생각을 문장으로만 씁니다 (논문·발표 목록은 Publications 탭에).
       목록을 다시 붙이려면 refs / prep 에 PUBLICATIONS · CONFERENCES 의 id 를 넣으면 됩니다
       (앞 3건만 보이고 나머지와 prep 은 'Show n more' 로 펼침).
     - gatech 칸은 "현재 방향"입니다. 결과처럼 쓰지 마세요 (developed, demonstrated 등 금지).
   ========================================================================== */
const PROJECTS = [
  {
    // 지금은 Research 탭에 쓰지 않음 (나중에 세부 소개에서 따로 다룰 예정)
    id: 'yun-fefet-tcad',
    period: 'Jul – Dec 2025',
    place: 'Yonsei Semiconductor Engineering Lab (Prof. Ilgu Yun)',
    title: 'HZO-based MFIS ferroelectric FETs: memory-window improvement through Silvaco TCAD device modeling',
  },
  {
    id: 'asem-vcsel',
    period: 'May 2025 – Aug 2026',
    place: 'ASEM, thin-film VCSEL startup (Co-Executive Director)',
    title: 'GaAs-based thin-film 940 nm VCSELs grown by MOCVD for LiDAR sensing',
    note: '$200,000 in research funding secured',
  },
];

const RESEARCH = {
  title: { light: 'Research', bold: 'Overview' },
  desc: 'Electronic materials, fabrication, devices, and system integration for flexible thin-film electronics and advanced semiconductor packaging.',

  // 두 단면도 패널의 머리: 위 줄 = 응용 분야, 아래 줄 = 학교, note = 패널 오른쪽 위 작은 메모
  eras: {
    yonsei: { title: 'Flexible thin-film electronics', school: 'Yonsei University' },
    gatech: { title: 'Advanced semiconductor packaging', school: 'Georgia Institute of Technology' },
  },
  hint: {
    hover: 'Hover over a topic or a layer to highlight it.',
    touch: 'Tap a topic to highlight it.',
  },
  cellLabels: { yonsei: 'Flexible thin-film electronics', gatech: 'Advanced semiconductor packaging' },

  threads: [
    {
      id: 'materials',
      name: 'Materials and Devices',
      sub: 'Electronic materials and functional devices',
      // 칩을 고르면 그림 아래에 나오는 설명 — 이 갈래를 어떻게 연구하는지 한 문장으로
      approach: 'Choosing and shaping the materials that decide how a device works, from doped and nanoparticle-decorated silicon nanomembranes for sensing to glass as the core material of a chip package and the underfill between chip and interposer.',
      yonsei: {
        summary: 'Single-crystalline silicon nanomembranes (SiNMs) combine the mechanical flexibility of a thin film with the high carrier mobility, stability and uniformity of bulk silicon. Since thickness, doping profile and crystal orientation determine their electrical, piezoresistive and thermal responses, the same silicon platform can be engineered for the sensitivity and stability each application requires.',
      },
      gatech: {
        summary: 'Glass core substrates offer a path beyond the reticle limit of silicon interposers and the warpage of organic substrates, enabling large-area packages for chiplet-based AI and HPC systems. A composition-tunable coefficient of thermal expansion (CTE) between those of silicon and the PCB, high dimensional stability and low dielectric loss support fine-pitch routing across large panels, while brittleness and low thermal conductivity must be managed.',
      },
    },
    {
      id: 'fabrication',
      name: 'Fabrication and Processing',
      sub: 'Nano/Micro fabrication technologies and CMOS-compatible process integration',
      approach: 'Building thin layers and the connections between them, from transferring and encapsulating silicon nanomembranes on soft substrates to laser-drilling vias in glass and forming redistribution layers and bonds in a package, with reliability in mind.',
      yonsei: {
        summary: 'High-temperature CMOS processes such as thermal oxidation and doping exceed the thermal budget of polymer substrates, so they are completed on the wafer before the silicon is transferred onto a soft substrate. Since yield and reliability are often limited by interfaces and processing rather than by device design, transfer printing, encapsulation and post-transfer fabrication are designed together with the device.',
      },
      gatech: {
        summary: 'Glass core packages are built with Cu-filled through-glass vias (TGVs), multilayer redistribution layers (RDLs) formed by semi-additive processing (SAP) and laser-drilled microvias. Since glass cracking, interfacial delamination and solder joint fatigue largely originate from CTE mismatch among Cu, glass and polymer layers, process uniformity and thermo-mechanical reliability are considered together across large panels.',
      },
    },
    {
      id: 'system',
      name: 'System and Integration',
      sub: 'Heterogeneous integration and system-level co-design',
      approach: 'Putting devices and chips together so they work as a system, from sensors and light sources placed on the skin or in tissue to chiplets, stacked dies and microfluidic cooling designed together in a package.',
      yonsei: {
        summary: 'Integrating thin-film silicon devices into wearable and implantable platforms requires conformal contact with skin or tissue, stable operation under repeated deformation and long-term protection from biofluids. At the system level, interconnect layout, power delivery and encapsulation often limit performance and lifetime more than the individual devices.',
      },
      gatech: {
        summary: 'In 2.5D/3D heterogeneous integration, logic chiplets and high-bandwidth memory (HBM) stacks are placed side by side on a large-area interposer and stacked vertically to operate as a single system. As packages grow, die-to-die links become longer and power density rises, so signal integrity, power delivery and thermal management are co-designed with the package architecture through system-technology co-optimization (STCO).',
      },
    },
  ],

  closing: 'All papers and talks are listed on the',
};
