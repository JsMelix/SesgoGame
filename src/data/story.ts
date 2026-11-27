import campus from '../assets/images/comic_intro_splash_1794855573640.jpg';
import vox from '../assets/images/comic_villain_vox_1794855573061.jpg';
import kael from '../assets/images/portrait_rocker_hero_1794619960238.jpg';
import lumen from '../assets/images/portrait_lumen_metal_1794619960152.jpg';

const cast = {
  Campus: { name: 'Campus Mirador', artwork: campus, color: '#fbbf24' },
  'VOX-ZERO': { name: 'VOX-ZERO', artwork: vox, color: '#fb7185' },
  Kael: { name: 'Kael', artwork: kael, color: '#fbbf24' },
  LUMEN: { name: 'LUMEN', artwork: lumen, color: '#67e8f9' },
};

function panel(speaker: keyof typeof cast, caption: string, dialogue: string) {
  return { ...cast[speaker], caption, dialogue };
}

interface DecisionOption {
  action: string;
  feedback: string;
  protectsPeople?: true;
}

export interface ChapterStory {
  levelId: number;
  chapterTitle: string;
  subtitle: string;
  panels: ReturnType<typeof panel>[];
  mission: string;
  outroLine: string;
  decision: {
    prompt: string;
    options: [DecisionOption, DecisionOption, DecisionOption];
  };
}

export const CHAPTER_STORIES: ChapterStory[] = [
  {
    levelId: 1,
    chapterTitle: 'Las voces que faltan',
    subtitle: 'Datos y reglas',
    panels: [
      panel('Campus', 'Campus Mirador · Antes de la emisión', 'Iris hizo bien la prueba de becas, pero su archivo tardó en subir. Esta noche VOX-ZERO publicará la lista de becas y otras decisiones del campus. Kael y LUMEN tienen hasta la emisión para revisar las pruebas.'),
      panel('VOX-ZERO', 'Una estudiante rural desaparece de la lista de becas', 'En mi archivo, quien responde desde casa en diez segundos merece más oportunidades. ¿Por qué habría de medir otra cosa?'),
      panel('LUMEN', 'Un buen resultado puede ocultar una mala regla', 'Si tus ejemplos vienen de un solo lugar, el sistema puede aprender una imagen incompleta del mundo. Y si premias la velocidad, quizá estés premiando la conexión a internet, no el mérito.'),
      panel('Kael', 'La primera compuerta', 'Si la beca depende de lo que aprendió Iris, comparemos la nota con el registro de conexión. Podemos ensayar otra regla antes de cambiar quién pasa.'),
    ],
    mission: 'Sigue el marcador y examina las estaciones con E o tocándolas. Q libera las terminales al derrotar guardias. Shift esquiva. Guarda las fuentes A y B, luego prueba una regla en ∆.',
    outroLine: 'La lista de becas vuelve a revisión. Desde la cabina de enfermería llega otra alerta urgente.',
    decision: {
      prompt: 'Las becas se adjudican mañana. Descubriste que la clasificación confunde velocidad de conexión con mérito. ¿Qué haces hoy?',
      options: [
        { action: 'Publicar la clasificación con un aviso de que podría tener errores.', feedback: 'El aviso no corrige quién queda fuera. La lista seguiría decidiendo sobre la beca con una medida inadecuada.' },
        { action: 'Pausar la lista, mantener abiertas las solicitudes y revisar el mérito con criterios accesibles.', feedback: 'Las personas conservan su oportunidad mientras el equipo corrige y comprueba la regla.', protectsPeople: true },
        { action: 'Eliminar las solicitudes más lentas para que los datos sean más consistentes.', feedback: 'Borrar esos ejemplos oculta el problema y excluye a quienes ya tenían peor conexión.' },
      ],
    },
  },
  {
    levelId: 2,
    chapterTitle: 'El botón verde',
    subtitle: 'Confirmación y automatización',
    panels: [
      panel('VOX-ZERO', 'La cabina de alertas', 'Mis informes parecen muy precisos. Si uno dice “98 % de confianza”, basta con pulsar el botón verde.'),
      panel('Kael', 'Un detector señala el ensayo de Iris', 'Hay una alerta sobre el ensayo de Iris. Si miro solo el porcentaje, ya habré decidido antes de escucharla. Busquemos sus borradores y los de los otros trabajos marcados.'),
      panel('LUMEN', 'Pide una comprobación independiente', 'El sesgo de confirmación aparece cuando damos más peso a lo que ya creemos. El de automatización aparece cuando delegamos el juicio en la recomendación. Busca una prueba que pueda cambiar tu decisión.'),
    ],
    mission: 'Compara las alertas con los borradores en la mesa de revisión. Sal de la línea amarilla del Eco-Bot y contraataca durante el marco azul.',
    outroLine: 'Las alertas vuelven a manos de quienes pueden contrastarlas. Queda una puerta que sigue rechazando a parte del alumnado.',
    decision: {
      prompt: 'Un detector señala un trabajo como escrito por IA. La estudiante trae borradores y puede explicar lo que hizo. ¿Qué decisión sería justa?',
      options: [
        { action: 'Sancionar porque el detector da una puntuación alta.', feedback: 'La puntuación no determina la autoría. Sancionar con ella sola convierte una señal incierta en un veredicto.' },
        { action: 'Buscar otro detector y sancionar si también la señala.', feedback: 'Dos herramientas pueden compartir los mismos errores. Falta examinar evidencia del trabajo y escuchar a la estudiante.' },
        { action: 'Revisar borradores y escuchar a la estudiante antes de decidir, con opción de impugnar.', feedback: 'La decisión se apoya en evidencia del proceso y existe una vía para corregir errores.', protectsPeople: true },
      ],
    },
  },
  {
    levelId: 3,
    chapterTitle: 'La puerta y el mapa',
    subtitle: 'Discriminación directa e indirecta',
    panels: [
      panel('VOX-ZERO', 'El registro de entrada falla más con parte del alumnado', 'Borré los nombres. Ahora el programa usa fotos y códigos postales. Nadie podrá decir que distingue entre personas.'),
      panel('Kael', 'Iris vuelve al campus con una compañera', 'Las dos tienen permiso. A su compañera el lector la rechaza. Antes de decir que funciona, vamos a comparar los resultados por grupos y buscar un acceso equivalente.'),
      panel('LUMEN', 'Las desigualdades dejan huellas en otras variables', 'Una variable proxy puede reflejar desigualdades ligadas a origen o ingresos. Compara quién sufre más errores, aunque el informe general parezca bueno.'),
    ],
    mission: 'Recupera los resultados de ambos grupos y ensaya una entrada alternativa. Ante un disparo, esquiva o pulsa Q justo antes de que llegue para devolverlo.',
    outroLine: 'El campus habilita una entrada alternativa. Las diferencias de trato conducen a la forja donde se preparan los datos.',
    decision: {
      prompt: 'La puerta automática acierta casi siempre, pero rechaza con mucha más frecuencia a estudiantes de piel oscura. ¿Qué haces?',
      options: [
        { action: 'Habilitar un acceso equivalente y revisar los errores por grupo antes de volver a depender del sistema.', feedback: 'El acceso sigue disponible mientras el equipo comprueba a quién perjudica el sistema y corrige el fallo.', protectsPeople: true },
        { action: 'Mantener la puerta activa porque el promedio es alto.', feedback: 'El promedio oculta la diferencia. A los estudiantes afectados les siguen negando la entrada.' },
        { action: 'Pedir únicamente a quienes fallan que vuelvan a registrar su cara.', feedback: 'Trasladas el costo a quienes ya sufren el fallo sin corregir ni comprobar el problema de fondo.' },
      ],
    },
  },
  {
    levelId: 4,
    chapterTitle: 'La forja de los datos',
    subtitle: 'Selección, etiquetado y omisión',
    panels: [
      panel('Kael', 'Tres expedientes delataron el taller de VOX-ZERO', 'El informe de satisfacción entrevistó solo a ganadores. Quienes abandonaron ni siquiera aparecen en la lista.'),
      panel('VOX-ZERO', 'Hay miles de registros marcados “agresivo”', 'Si alguien usa una expresión que mis anotadores no conocen, le ponemos una etiqueta. Si un dato cuesta medir, lo quitamos. ¡Así el trabajo acaba antes!'),
      panel('LUMEN', 'Una tabla conserva las decisiones de quien la hizo', 'Seleccionar decide quién entra. Etiquetar decide cómo se interpreta. Omitir decide qué necesidad queda invisible. Pregunta a las personas que faltan qué evidencia cambiaría el sistema.'),
    ],
    mission: 'Cruza los circuitos cuando estén apagados y compara la encuesta con el registro de acceso. Usa las dos fuentes para cambiar a quién escucha el Taller de muestreo.',
    outroLine: 'El taller vuelve a abrir sus registros. En la antena central, VOX-ZERO prepara un último informe para defender su sistema.',
    decision: {
      prompt: 'El informe dice que el curso es accesible. Solo recoge respuestas de quienes lo terminaron. ¿Cómo compruebas la conclusión?',
      options: [
        { action: 'Encuestar a más personas que ya terminaron el curso.', feedback: 'Aumentar el tamaño de la misma muestra no recupera las experiencias de quienes se quedaron fuera.' },
        { action: 'Invitar a quienes abandonaron o no pudieron entrar y comprobar barreras con pruebas de accesibilidad.', feedback: 'Escuchar a quienes quedaron fuera y comprobar las barreras aporta evidencia para corregirlas.', protectsPeople: true },
        { action: 'Contar cada encuesta sin responder como una respuesta positiva.', feedback: 'El silencio se convierte en una etiqueta inventada y oculta precisamente lo que hace falta investigar.' },
      ],
    },
  },
  {
    levelId: 5,
    chapterTitle: 'El último informe',
    subtitle: 'Verificación y responsabilidad',
    panels: [
      panel('VOX-ZERO', 'La antena espera el informe definitivo', 'Tengo tres gráficos, imágenes perfectas y citas impecables. El consejo del campus no cuestionará nada si se lo presento bien.'),
      panel('Kael', 'Una cita promete demostrar una causa', 'El informe dice que las becas eran justas y que la puerta funcionaba. Después de seguir el caso de Iris, quiero ver cada fuente. Una referencia que suena bien todavía puede ser falsa.'),
      panel('LUMEN', 'Antes de publicar, comprueba lo que afirmas', 'La IA generativa puede producir citas inexistentes o imágenes estereotipadas. Verifica la fuente original, revisa a quién retrata y quién asume la decisión final.'),
    ],
    mission: 'Cruza el borrador con las fuentes originales en la mesa de emisión. Después enfrenta a VOX-ZERO. Su segunda ráfaga cubre más ángulos; esquiva o devuelve sus disparos con Q.',
    outroLine: 'La antena transmite un informe verificado y un canal para impugnar errores. El campus conserva a LUMEN para ayudar a investigar. El equipo humano responde por lo que decide.',
    decision: {
      prompt: 'Van a publicar un informe generado por IA que afecta a todo el campus. Una cita no aparece y un gráfico confunde correlación con causa. ¿Qué autorizas?',
      options: [
        { action: 'Publicarlo con la nota “contenido generado por IA”.', feedback: 'Indicar cómo se generó el contenido no vuelve verdaderas sus afirmaciones ni protege a quienes podrían verse afectados.' },
        { action: 'Pedir a otra IA que lo reescriba con un tono más prudente.', feedback: 'Cambiar el tono no verifica la cita ni explica el gráfico. Hace falta volver a las fuentes.' },
        { action: 'Comprobar las fuentes, retirar lo no verificable, explicar los límites y asignar una revisión humana.', feedback: 'El consejo recibe evidencia comprobable y hay una persona responsable de corregir el informe.', protectsPeople: true },
      ],
    },
  },
];

export function getChapterStory(levelId: number): ChapterStory {
  return CHAPTER_STORIES.find((chapter) => chapter.levelId === levelId) ?? CHAPTER_STORIES[0];
}
