export interface ComicPanel {
  id: string;
  speaker: 'VOX-ZERO' | 'KAEL' | 'LUMEN' | 'NARRADOR';
  speakerTitle: string;
  sfx: string;
  caption: string;
  dialogue: string;
  artwork: string;
  tone: 'crimson' | 'amber' | 'cyan' | 'emerald';
}

export interface ChapterStory {
  levelId: number;
  chapterTitle: string;
  subtitle: string;
  panels: ComicPanel[];
  outroLine: string;
}

const ART_INTRO = '/src/assets/images/comic_intro_splash_1794855573640.jpg';
const ART_VILLAIN = '/src/assets/images/comic_villain_vox_1794855573061.jpg';
const ART_HERO = '/src/assets/images/portrait_rocker_hero_1794619960238.jpg';
const ART_LUMEN = '/src/assets/images/portrait_lumen_metal_1794619960152.jpg';
const ART_VICTORY = '/src/assets/images/comic_victory_splash_1794855574438.jpg';

export const CHAPTER_STORIES: ChapterStory[] = [
  {
    levelId: 1,
    chapterTitle: 'CAPÍTULO 1: EL CONCIERTO DE LOS DATOS ROTOS',
    subtitle: 'El ataque de VOX-ZERO al Búnker Escolar',
    panels: [
      {
        id: 'c1_p1',
        speaker: 'VOX-ZERO',
        speakerTitle: 'VOX-ZERO · Señor del Piloto Automático',
        sfx: '¡KRAAAK!',
        caption: 'Sótano del Campus Tecnológico · Compuertas Blindadas.',
        dialogue:
          '¡Escuchen bien! Dividí el búnker con compuertas blindadas, escondí las Llaves de Acceso en cofres sellados y protegí las terminales con mis drones!',
        artwork: ART_VILLAIN,
        tone: 'crimson',
      },
      {
        id: 'c1_p2',
        speaker: 'KAEL',
        speakerTitle: 'KAEL · Auditor Metalero',
        sfx: '¡RIFF!',
        caption: 'Kael afina su Guitarra-Hacha Sónica.',
        dialogue:
          '¡Ni tus puertas ni tus cofres me detendrán! Saquearé tus amplificadores Overdrive, abriré cada compuerta y destruiré a tus drones a puro riff.',
        artwork: ART_INTRO,
        tone: 'amber',
      },
      {
        id: 'c1_p3',
        speaker: 'LUMEN',
        speakerTitle: 'LUMEN · Búho Copiloto Socrático',
        sfx: '¡ZAP!',
        caption: 'Explora, combate y piensa críticamente.',
        dialogue:
          'Abre los cofres con [E] para conseguir llaves y poder, activa interruptores con tu guitarra y libera cada terminal para que analicemos el sesgo juntos.',
        artwork: ART_LUMEN,
        tone: 'cyan',
      },
    ],
    outroLine: '¡Escudos pulverizados y primer solo superado! VOX-ZERO retrocede hacia la Cabina Psicológica.',
  },
  {
    levelId: 2,
    chapterTitle: 'CAPÍTULO 2: LA HIPNOSIS DEL BOTÓN VERDE',
    subtitle: 'Trampas mentales en la Cabina de Alto Voltaje',
    panels: [
      {
        id: 'c2_p1',
        speaker: 'VOX-ZERO',
        speakerTitle: 'VOX-ZERO · Transmisión Pirata',
        sfx: '¡BEEP-99%!',
        caption: 'Nivel 2 · Cabina de Interacción Humano-IA.',
        dialogue:
          '¡Mis Eco-Bots Blindados embisten sin dudar, igual que cualquiera que obedece un "98% SEGURO" sin leer la evidencia!',
        artwork: ART_VILLAIN,
        tone: 'crimson',
      },
      {
        id: 'c2_p2',
        speaker: 'KAEL',
        speakerTitle: 'KAEL · Auditor Metalero',
        sfx: '¡CLANG!',
        caption: 'Kael esquiva una embestida y carga un acorde.',
        dialogue:
          '¡Eso se acaba hoy! Esquivaremos sus cargas, romperemos sus escudos y devolveremos el juicio humano al laboratorio.',
        artwork: ART_HERO,
        tone: 'amber',
      },
    ],
    outroLine: '¡Rompiste el hechizo del piloto automático! Ahora sigue el Escenario de Equidad Sonora.',
  },
  {
    levelId: 3,
    chapterTitle: 'CAPÍTULO 3: SOMBRAS TRAS EL CÓDIGO POSTAL',
    subtitle: 'Desenmascarando prejuicios sociales ocultos',
    panels: [
      {
        id: 'c3_p1',
        speaker: 'VOX-ZERO',
        speakerTitle: 'VOX-ZERO · Consola Social',
        sfx: '¡SCRATCH!',
        caption: 'Nivel 3 · Primer Centinela VOX desplegado.',
        dialogue:
          'Borré los nombres del formulario y desplegué un Centinela que dispara veredictos ciegos. ¡Nadie verá los sesgos sociales!',
        artwork: ART_VILLAIN,
        tone: 'crimson',
      },
      {
        id: 'c3_p2',
        speaker: 'LUMEN',
        speakerTitle: 'LUMEN · Copiloto Socrático',
        sfx: '¡FLASH!',
        caption: 'Consulta el Bestiario en la Guía si necesitas estrategia.',
        dialogue:
          '¡Esquiva los proyectiles del Centinela, derríbalo con tu Hacha Sónica y revisa qué variables ocultas discriminan en cada caso!',
        artwork: ART_LUMEN,
        tone: 'cyan',
      },
    ],
    outroLine: '¡Estereotipos silenciados y Centinela caído! Solo quedan la Forja de Código y el Núcleo Generativo.',
  },
  {
    levelId: 4,
    chapterTitle: 'CAPÍTULO 4: SABOTAJE EN LA FORJA DE CÓDIGO',
    subtitle: 'Encuestas ciegas, etiquetas rotas y olvidos',
    panels: [
      {
        id: 'c4_p1',
        speaker: 'KAEL',
        speakerTitle: 'KAEL · Auditor Metalero',
        sfx: '¡CRASH!',
        caption: 'Nivel 4 · Taller de Ingeniería y Anotación.',
        dialogue:
          '¡Encuestaron solo a los ganadores, etiquetaron modismos como "agresión" y olvidaron la accesibilidad! ¡Es hora de limpiar esta forja!',
        artwork: ART_HERO,
        tone: 'amber',
      },
      {
        id: 'c4_p2',
        speaker: 'VOX-ZERO',
        speakerTitle: 'VOX-ZERO · Núcleo Central',
        sfx: '¡ZZZT!',
        caption: 'Escuadrón mixto custodiando los tres terminales.',
        dialogue:
          '¡Mi escuadrón blindado bloqueará cada consola! ¡No podrás reescribir la verdad del código!',
        artwork: ART_VILLAIN,
        tone: 'crimson',
      },
    ],
    outroLine: '¡Forja purificada! El escenario final de VOX-ZERO te espera en el Nivel 5.',
  },
  {
    levelId: 5,
    chapterTitle: 'CAPÍTULO 5: DUELO FINAL CONTRA EL ALGORITMO',
    subtitle: 'Alucinaciones, clichés y la victoria del criterio humano',
    panels: [
      {
        id: 'c5_p1',
        speaker: 'VOX-ZERO',
        speakerTitle: 'VOX-ZERO · Modo Generativo Supremo',
        sfx: '¡THOOM!',
        caption: 'Nivel 5 · Dos Centinelas VOX y un Eco-Bot en escena.',
        dialogue:
          '¡Último asalto! Fabricaré citas falsas e imágenes llenas de clichés mientras mis Centinelas barren el escenario!',
        artwork: ART_VILLAIN,
        tone: 'crimson',
      },
      {
        id: 'c5_p2',
        speaker: 'KAEL',
        speakerTitle: 'KAEL & LUMEN · Último Bis',
        sfx: '¡SHRED!',
        caption: 'El dúo afina su ataque definitivo.',
        dialogue:
          '¡Sube el volumen! Destruiremos cada Centinela y demostraremos que la IA fortalece el aprendizaje sin reemplazar el pensamiento crítico.',
        artwork: ART_VICTORY,
        tone: 'emerald',
      },
    ],
    outroLine: '¡BIS HISTÓRICO! Derrotaste a VOX-ZERO y demostraste que la IA sirve al pensamiento crítico.',
  },
];

export function getChapterStory(levelId: number): ChapterStory {
  return CHAPTER_STORIES.find((c) => c.levelId === levelId) ?? CHAPTER_STORIES[0];
}
