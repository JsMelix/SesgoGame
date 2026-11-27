interface TestSite {
  x: number;
  y: number;
  title: string;
}

export interface EvidenceSite extends TestSite {
  id: 'A' | 'B';
  observation: string;
}

export interface TestPolicy {
  label: string;
  values: [number, number];
  consequence: string;
  passes?: true;
}

export interface FieldTest {
  title: string;
  claim: string;
  successCriterion: string;
  sources: [EvidenceSite, EvidenceSite];
  console: TestSite;
  metrics: [string, string];
  baseline: [number, number];
  policies: [TestPolicy, TestPolicy, TestPolicy];
  takeaway: string;
}

export const FIELD_TESTS: Record<number, FieldTest> = {
  1: {
    title: 'La beca y el cronómetro',
    claim: 'VOX-ZERO afirma que responder en diez segundos identifica a quienes mejor resolvieron la prueba.',
    successCriterion: 'Conserva a quienes demostraron el mismo mérito, hayan tenido conexión rápida o intermitente.',
    sources: [
      { id: 'A', x: 5, y: 11, title: 'Rúbricas de evaluación', observation: 'Diez personas de cada grupo alcanzaron el mismo nivel en la prueba. El profesorado evaluó las entregas sin ver cuánto tardó en llegar cada archivo.' },
      { id: 'B', x: 14, y: 10, title: 'Registro de conexión', observation: 'En el grupo con conexión rápida, 8 de 10 superaron el corte de diez segundos. Con conexión intermitente, solo 2 de 10. El cronómetro mide también el acceso a internet.' },
    ],
    console: { x: 14, y: 6, title: 'Banco de becas' },
    metrics: ['Candidaturas que pasan · conexión rápida', 'Candidaturas que pasan · conexión intermitente'],
    baseline: [8, 2],
    policies: [
      { label: 'Dar treinta segundos a todo el mundo', values: [10, 6], consequence: 'El margen ayuda, pero cuatro personas con mérito siguen fuera. Todavía estás usando la conexión como criterio.' },
      { label: 'Evaluar las entregas con la misma rúbrica', values: [10, 10], consequence: 'En esta muestra pasan las veinte personas que alcanzaron el nivel. La conexión deja de decidir quién conserva su oportunidad.', passes: true },
      { label: 'Calibrar el cronómetro con las conexiones más rápidas', values: [9, 1], consequence: 'Una referencia más rápida puede parecer más precisa y aumentar la exclusión del otro grupo.' },
    ],
    takeaway: 'Comprueba que la regla mida lo que de verdad quieres evaluar.',
  },
  2: {
    title: 'Una segunda mirada',
    claim: 'VOX-ZERO propone sancionar automáticamente los trabajos marcados por el detector.',
    successCriterion: 'Atiende las alertas sin sancionar a personas cuyo proceso de autoría se puede comprobar.',
    sources: [
      { id: 'A', x: 3, y: 11, title: 'Registro de alertas', observation: 'El detector marcó 10 trabajos. Su porcentaje de confianza es una salida del modelo; el informe no explica cómo validó la autoría.' },
      { id: 'B', x: 13, y: 10, title: 'Historial de borradores', observation: 'En 8 de los 10 casos hay borradores y explicaciones coherentes con el trabajo entregado. Dos expedientes siguen abiertos y necesitan revisión.' },
    ],
    console: { x: 13, y: 5, title: 'Mesa de revisión' },
    metrics: ['Alertas atendidas', 'Sanciones a autorías comprobadas'],
    baseline: [10, 8],
    policies: [
      { label: 'Elevar el umbral de confianza y sancionar automáticamente', values: [4, 3], consequence: 'Procesas menos alertas, pero el porcentaje sigue sustituyendo la revisión del trabajo.' },
      { label: 'Archivar todas las alertas', values: [0, 0], consequence: 'Evitas sanciones automáticas, pero las dos discrepancias siguen sin examinarse.' },
      { label: 'Contrastar borradores y escuchar a la persona', values: [10, 0], consequence: 'Se atienden las diez alertas. Los casos con evidencia de autoría se cierran y dos pasan a revisión sin sanción automática.', passes: true },
    ],
    takeaway: 'Una alerta puede orientar la revisión. La evidencia y el derecho a responder deben pesar en la decisión.',
  },
  3: {
    title: 'La misma puerta',
    claim: 'VOX-ZERO dice que el acceso funciona porque apenas ve rechazos en el total.',
    successCriterion: 'Garantiza un acceso equivalente mientras investigas por qué falla más con un grupo.',
    sources: [
      { id: 'A', x: 12, y: 11, title: 'Prueba de acceso · Grupo A', observation: 'De 100 estudiantes con permiso, la puerta rechazó a 2. Todas las personas intentaron entrar por el mismo lector.' },
      { id: 'B', x: 21, y: 11, title: 'Prueba de acceso · Grupo B', observation: 'De otras 100 personas con permiso, rechazó a 18. El grupo tiene tonos de piel más oscuros. La diferencia exige revisar el sistema y cómo se hizo la prueba.' },
    ],
    console: { x: 19, y: 11, title: 'Control de acceso' },
    metrics: ['Personas con permiso sin acceso · A', 'Personas con permiso sin acceso · B'],
    baseline: [2, 18],
    policies: [
      { label: 'Habilitar credencial equivalente y medir errores por grupo', values: [0, 0], consequence: 'Las personas con permiso pueden entrar por la vía alternativa. Conservas el desglose para investigar el lector.', passes: true },
      { label: 'Mejorar la cámara y mantener el lector como único acceso', values: [1, 11], consequence: 'La simulación mejora el promedio, pero el impacto sigue desigualmente repartido y aún hay personas sin acceso.' },
      { label: 'Mostrar el promedio de todos los registros', values: [2, 18], consequence: 'Cambias la presentación del informe. Las mismas personas siguen fuera.' },
    ],
    takeaway: 'Un promedio puede esconder la desigualdad que sí aparece al comparar grupos.',
  },
  4: {
    title: 'Quién pudo responder',
    claim: 'VOX-ZERO da por hecho que el curso es accesible porque todos los encuestados lo terminaron.',
    successCriterion: 'Incluye a quienes se quedaron fuera y recoge barreras verificables para corregirlas.',
    sources: [
      { id: 'A', x: 3, y: 10, title: 'Encuesta de salida', observation: 'La encuesta se enviaba después de completar el último módulo. Llegó a 12 personas y todas respondieron.' },
      { id: 'B', x: 12, y: 9, title: 'Registro de intentos de acceso', observation: 'Ocho personas quedaron fuera de la encuesta. Cinco documentaron barreras de navegación, video o teclado. Las otras tres aún no han respondido.' },
    ],
    console: { x: 13, y: 11, title: 'Taller de muestreo' },
    metrics: ['Personas fuera de la muestra invitadas', 'Barreras documentadas'],
    baseline: [0, 0],
    policies: [
      { label: 'Volver a enviar la encuesta a quienes terminaron', values: [0, 0], consequence: 'Aumentar respuestas del mismo grupo deja intacto el hueco de selección.' },
      { label: 'Contactar a las ocho personas y comprobar las barreras', values: [8, 5], consequence: 'Recuperas cinco pruebas de barreras y dejas constancia de tres casos sin respuesta. Ya hay correcciones concretas que verificar.', passes: true },
      { label: 'Completar los casos vacíos con la satisfacción media', values: [0, 0], consequence: 'Las celdas parecen completas, pero se inventaron respuestas donde faltaba evidencia.' },
    ],
    takeaway: 'Pregunta quién quedó fuera del proceso antes de generalizar lo que dice la muestra.',
  },
  5: {
    title: 'Rastrear antes de emitir',
    claim: 'VOX-ZERO quiere emitir diez afirmaciones respaldadas, según dice, por fuentes académicas.',
    successCriterion: 'Publica solo afirmaciones verificables y conserva un registro de lo que falta por comprobar.',
    sources: [
      { id: 'A', x: 13, y: 11, title: 'Borrador de emisión', observation: 'El informe generativo trae diez afirmaciones con referencias y una gráfica. Una correlación aparece redactada como prueba de causa.' },
      { id: 'B', x: 13, y: 5, title: 'Catálogo de fuentes originales', observation: 'Solo siete de las diez afirmaciones están respaldadas como fueron escritas. Dos referencias no aparecen y la fuente de la gráfica no permite afirmar causalidad.' },
    ],
    console: { x: 14, y: 4, title: 'Mesa de emisión' },
    metrics: ['Afirmaciones publicadas con respaldo', 'Afirmaciones publicadas sin respaldo'],
    baseline: [7, 3],
    policies: [
      { label: 'Pedir a otra IA que confirme el borrador', values: [7, 3], consequence: 'Una segunda salida puede repetir datos falsos. Todavía faltan las fuentes originales.' },
      { label: 'Publicar todo con una nota sobre su origen generativo', values: [7, 3], consequence: 'La nota informa cómo surgió el borrador. Las tres afirmaciones siguen circulando como hechos.' },
      { label: 'Verificar fuentes, retener lo dudoso y asignar revisión', values: [7, 0], consequence: 'Se emiten siete afirmaciones comprobadas y tres quedan registradas para revisión. Hay una persona responsable de corregir el informe.', passes: true },
    ],
    takeaway: 'Verifica la fuente y el alcance de la evidencia. Alguien debe poder responder por lo publicado.',
  },
};
