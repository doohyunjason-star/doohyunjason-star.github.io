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
    gatech: { title: 'Advanced semiconductor packaging', school: 'Georgia Institute of Technology', note: 'Schematic, not to scale' },
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
      sub: 'Functional materials and the devices built from them',
      // 칩을 고르면 그림 아래에 나오는 설명 — 이 갈래를 어떻게 연구하는지 한 문장으로
      approach: 'Choosing and shaping the materials that decide how a device works, from doped and nanoparticle-decorated silicon nanomembranes for sensing to glass as the core material of a chip package.',
      yonsei: {
        summary: 'Single-crystalline silicon nanomembranes are thin enough to bend with skin and tissue, yet keep the electrical properties of bulk silicon. By tailoring the material properties to the target performance, the same silicon platform can be optimized for each application.',
      },
      gatech: {
        summary: 'Glass is used as the core material of the package, carrying and connecting the silicon chips as a substrate or an interposer. By choosing and shaping this core material, the package can be matched to the density and reliability its chips require.',
      },
    },
    {
      id: 'fabrication',
      name: 'Fabrication and Processing',
      sub: 'How thin layers are made, transferred and joined',
      approach: 'Building thin layers and the connections between them, from transferring and encapsulating silicon nanomembranes on soft substrates to forming vias, redistribution layers and bonds in a package, with reliability in mind.',
      yonsei: {
        summary: 'Building devices on soft substrates requires adapting standard CMOS processes to thin, flexible materials. Since most failures arise at interfaces and during processing rather than from the device design, process and reliability are designed together with the device.',
      },
      gatech: {
        summary: 'Building a package requires processes that form fine connections both through and across its layers, from vias in the glass core and stacked dies to redistribution layers and microbumps. As these connections shrink, package reliability is considered together with each process step.',
      },
    },
    {
      id: 'system',
      name: 'System and Integration',
      sub: 'Putting devices and chips together into working systems',
      approach: 'Putting devices and chips together so they work as a system, from sensors and light sources placed on the skin or in tissue to chiplets, stacked dies and microfluidic cooling designed together in a package.',
      yonsei: {
        summary: 'A sensor becomes useful only when it works as part of a system. Integrating devices into wearable and implantable platforms turns them into working systems, where wiring, power and packaging often set the limits more than the devices themselves.',
      },
      gatech: {
        summary: 'In 2.5D/3D heterogeneous integration, chiplets and stacked dies are placed side by side and on top of each other to work as one system. Thermal management, signal and power integrity are then chosen together with that system through system-technology co-optimization (STCO).',
      },
    },
  ],

  closing: 'All papers and talks are listed on the',
};
