import { BiasDefinition, Scenario } from '../types/game';

export const BIAS_DEFINITIONS: BiasDefinition[] = [
  {
    id: 'datos',
    name: 'Sesgo de Datos',
    levelId: 1,
    summary:
      'Ocurre cuando la información usada para entrenar un sistema de IA está incompleta, desbalanceada o refleja desigualdades históricas.',
    warningSignal: 'El conjunto de entrenamiento proviene de un solo contexto, época o grupo mayoritario.',
    mitigation: 'Auditar la representatividad de los datos y recopilar ejemplos diversos antes de entrenar.',
  },
  {
    id: 'algoritmico',
    name: 'Sesgo Algorítmico',
    levelId: 1,
    summary:
      'Aparece cuando las reglas matemáticas, los pesos o las métricas de optimización del modelo amplifican una desventaja injusta incluso sobre datos limpios.',
    warningSignal: 'La fórmula premia un único indicador (como velocidad o clics) sin considerar el contexto humano.',
    mitigation: 'Rediseñar la función objetivo con métricas de equidad y revisar su impacto en casos borde.',
  },
  {
    id: 'confirmacion',
    name: 'Sesgo de Confirmación',
    levelId: 2,
    summary:
      'Tendencia humana a consultar o aceptar solo respuestas de la IA que respaldan nuestras creencias previas, ignorando evidencias contrarias.',
    warningSignal: 'Formular preguntas tendenciosas al asistente y no contrastar las respuestas con fuentes opuestas.',
    mitigation: 'Pedir explícitamente contraargumentos, verificar fuentes primarias y mantener una postura escéptica.',
  },
  {
    id: 'automatizacion',
    name: 'Sesgo de Automatización',
    levelId: 2,
    summary:
      'Exceso de confianza en las sugerencias de un sistema automatizado que lleva a ignorar señales contradictorias o el propio juicio profesional.',
    warningSignal: 'Aceptar el veredicto de la máquina por defecto sin revisar la evidencia directa del caso.',
    mitigation: 'Usar la IA como segunda opinión consultiva y exigir verificación humana en decisiones críticas.',
  },
  {
    id: 'genero',
    name: 'Sesgo de Género',
    levelId: 3,
    summary:
      'El sistema asocia profesiones, capacidades o roles sociales con un género específico al reproducir estereotipos presentes en datos históricos.',
    warningSignal: 'Recomendaciones o traducciones que asignan roles técnicos o de cuidado según el género.',
    mitigation: 'Desvincular atributos protegidos de las predicciones y evaluar tasas de acierto por género.',
  },
  {
    id: 'racial',
    name: 'Sesgo Racial',
    levelId: 3,
    summary:
      'Diferencias sistemáticas de precisión o trato injusto hacia personas según su origen étnico o tono de piel.',
    warningSignal: 'Tasas de error mucho más altas en reconocimiento facial, voz o evaluación para ciertos grupos.',
    mitigation: 'Probar el modelo con conjuntos balanceados por tono de piel y etnia antes de desplegarlo.',
  },
  {
    id: 'demografico',
    name: 'Sesgo Demográfico',
    levelId: 3,
    summary:
      'Discriminación indirecta basada en edad, código postal, nivel socioeconómico o ubicación geográfica.',
    warningSignal: 'Variables como el código postal actúan como sustitutos de la situación económica o social.',
    mitigation: 'Eliminar variables proxy discriminatorias y evaluar necesidades individuales reales.',
  },
  {
    id: 'seleccion',
    name: 'Sesgo de Selección',
    levelId: 4,
    summary:
      'Se produce al recoger muestras de evaluación o entrenamiento de un subgrupo que no representa a toda la población real.',
    warningSignal: 'Solo se encuesta o mide a quienes tuvieron acceso, tiempo o éxito previo en el sistema.',
    mitigation: 'Diseñar muestreos aleatorios o estratificados que incluyan a quienes abandonaron o quedaron fuera.',
  },
  {
    id: 'etiquetado',
    name: 'Sesgo de Etiquetado',
    levelId: 4,
    summary:
      'Los prejuicios, desconocimiento cultural o criterios inconsistentes de quienes anotan los datos se transfieren como "verdad" al modelo.',
    warningSignal: 'Las etiquetas manuales clasifican expresiones culturales o variantes regionales como errores.',
    mitigation: 'Crear guías claras de anotación, equipos diversos de etiquetadores y revisión cruzada.',
  },
  {
    id: 'omision',
    name: 'Sesgo de Omisión',
    levelId: 4,
    summary:
      'Falta una variable o dimensión esencial en el diseño del problema, provocando conclusiones distorsionadas.',
    warningSignal: 'El modelo evalúa un fenómeno complejo ignorando factores clave de accesibilidad o contexto.',
    mitigation: 'Consultar a expertos del dominio y a las comunidades afectadas para detectar variables faltantes.',
  },
  {
    id: 'interpretacion',
    name: 'Sesgo de Interpretación',
    levelId: 5,
    summary:
      'Error al leer los resultados de una IA, confundiendo correlación estadística con causalidad o sobreestimando la certeza del modelo.',
    warningSignal: 'Se toma una coincidencia en un gráfico como prueba directa de causa y efecto.',
    mitigation: 'Buscar variables ocultas (confusoras), revisar intervalos de confianza y diseñar pruebas controladas.',
  },
  {
    id: 'generativa',
    name: 'Sesgo de IA Generativa',
    levelId: 5,
    summary:
      'Los modelos generativos de texto o imagen amplifican estereotipos culturales o fabrican datos falsos con apariencia autoritativa.',
    warningSignal: 'Imágenes que repiten clichés o textos con citas inventadas pero tono sumamente convincente.',
    mitigation: 'Verificar hechos y citas externamente y redactar instrucciones explícitas que eviten estereotipos.',
  },
];

export const SCENARIOS: Scenario[] = [
  // ================= NIVEL 1: SESGOS BÁSICOS =================
  {
    id: 'n1_c1',
    levelId: 1,
    terminalNumber: 1,
    biasId: 'datos',
    biasName: 'Sesgo de Datos',
    title: 'Predicción Escolar Incompleta',
    npcName: 'Profa. Elena',
    npcRole: 'Coordinadora Académica',
    npcGreeting: 'El nuevo software predice bajo rendimiento en escuelas rurales aunque sus alumnos brillan en clase.',
    scenarioText:
      'Una red educativa entrenó una IA para detectar estudiantes que necesitan apoyo temprano. Al probarla en zonas rurales, marcó al 72% como "alto riesgo", pese a que sus proyectos prácticos tenían excelentes calificaciones.',
    evidenceTitle: 'Auditoría de Entrenamiento',
    evidenceItems: [
      { label: 'Origen de datos', value: '96% colegios urbanos privados · 4% escuelas rurales' },
      { label: 'Métrica registrada', value: 'Uso de plataformas digitales de pago en casa' },
      { label: 'Falsos negativos/positivos', value: '3.4× más alertas erróneas en zonas rurales' },
    ],
    socraticHints: [
      'Observa de dónde provinieron casi todos los ejemplos con los que aprendió la IA antes de llegar a la zona rural.',
      '¿El sistema está midiendo la capacidad real del estudiante o su acceso previo a herramientas urbanas?',
    ],
    lumenReflection:
      'Una IA solo generaliza bien aquello que vio representado en sus datos; el pensamiento crítico cuestiona qué voces faltan en la muestra.',
    options: [
      {
        id: 'a',
        label: 'Sesgo de Datos: la muestra de entrenamiento excluyó la realidad rural y midió acceso digital en lugar de capacidad.',
        isCorrect: true,
        feedback:
          'Exacto. El 96% de los datos provenían de colegios urbanos con plataformas de pago, por lo que la IA confundió menor conectividad doméstica con bajo potencial académico.',
      },
      {
        id: 'b',
        label: 'Sesgo de Automatización: los profesores rurales aceptaron el informe sin abrir la plataforma.',
        isCorrect: false,
        feedback:
          'En este caso los docentes sí notaron la contradicción con los proyectos prácticos; el problema nació antes, en la composición del conjunto de entrenamiento.',
      },
      {
        id: 'c',
        label: 'Sesgo de IA Generativa: el modelo inventó calificaciones falsas al redactar el reporte.',
        isCorrect: false,
        feedback:
          'No es un modelo generativo creando texto ficticio; se trata de un sistema predictivo alimentado con registros históricos desequilibrados.',
      },
      {
        id: 'd',
        label: 'Fallo de hardware: las tabletas rurales tienen menor resolución de pantalla.',
        isCorrect: false,
        feedback:
          'El hardware no altera la lógica estadística del modelo. Revisa la proporción de datos urbanos frente a rurales en la evidencia.',
      },
    ],
    mitigationPrinciple:
      'Antes de confiar en una predicción, audita la diversidad geográfica y socioeconómica de los datos y evalúa competencias reales, no solo consumo digital.',
    realWorldConnection:
      'En sistemas reales de admisión o alertas tempranas, usar historiales de un solo grupo convierte la brecha de acceso en una desventaja automatizada.',
  },
  {
    id: 'n1_c2',
    levelId: 1,
    terminalNumber: 2,
    biasId: 'algoritmico',
    biasName: 'Sesgo Algorítmico',
    title: 'La Fórmula de Becas por Velocidad',
    npcName: 'Mateo',
    npcRole: 'Estudiante Evaluado',
    npcGreeting: 'Resolví bien todos los problemas de lógica, pero el sistema me bajó puntos por tardar unos minutos más.',
    scenarioText:
      'Para asignar becas de ciencias, un sistema evalúa exámenes en línea. Incluso cuando los datos de todos los aspirantes están completos, el algoritmo otorga el 70% del puntaje final a la rapidez de clic y solo el 30% a la profundidad de la solución.',
    evidenceTitle: 'Configuración de Ponderación',
    evidenceItems: [
      { label: 'Peso de velocidad', value: '70% tiempo por pregunta' },
      { label: 'Peso de precisión', value: '30% calidad de respuesta' },
      { label: 'Grupo afectado', value: 'Estudiantes con dislexia o lectura reflexiva (-41% puntaje)' },
    ],
    socraticHints: [
      'Aquí la base de datos sí incluye a todos los estudiantes por igual. Entonces, ¿dónde se introduce la injusticia?',
      'Fíjate en cómo la regla matemática decide qué vale más: ¿responder rápido equivale necesariamente a pensar mejor?',
    ],
    lumenReflection:
      'Optimizar una métrica fácil de medir (tiempo) suele sacrificar lo que realmente importa (comprensión profunda).',
    options: [
      {
        id: 'a',
        label: 'Sesgo de Omisión: faltó registrar la edad de cada aspirante en el formulario.',
        isCorrect: false,
        feedback:
          'Aunque la edad no esté en la tabla, el daño directo proviene de la regla matemática explícita que sobrevalora la rapidez sobre el razonamiento.',
      },
      {
        id: 'b',
        label: 'Sesgo Algorítmico: los pesos matemáticos del modelo privilegian la velocidad extrema y penalizan estilos cognitivos reflexivos o neurodivergentes.',
        isCorrect: true,
        feedback:
          'Correcto. Aunque los datos de entrada sean equitativos, el diseño del algoritmo traduce "velocidad" en "mérito", generando exclusión sistemática.',
      },
      {
        id: 'c',
        label: 'Sesgo de Confirmación: Mateo buscó excusas tras obtener un puntaje bajo.',
        isCorrect: false,
        feedback:
          'Los números de ponderación (70% tiempo vs. 30% precisión) muestran una regla objetivamente desproporcionada en el código, no una creencia del estudiante.',
      },
      {
        id: 'd',
        label: 'Sesgo de Etiquetado: alguien calificó manualmente sus respuestas como lentas.',
        isCorrect: false,
        feedback:
          'El tiempo fue medido automáticamente por el cronómetro; la distorsión proviene de cómo el algoritmo pondera esa variable.',
      },
    ],
    mitigationPrinciple:
      'Reemplaza la velocidad extrema por rúbricas centradas en comprensión, precisión y diseño accesible para distintos ritmos de lectura.',
    realWorldConnection:
      'Muchos filtros automáticos de selección laboral miden rapidez de reacción o tono de voz y excluyen injustamente a personas neurodivergentes.',
  },
  {
    id: 'n1_c3',
    levelId: 1,
    terminalNumber: 3,
    biasId: 'algoritmico',
    biasName: 'Sesgo Algorítmico',
    title: 'El Bucle de Lecturas Populares',
    npcName: 'Lucía',
    npcRole: 'Bibliotecaria Escolar',
    npcGreeting: 'La app de biblioteca solo recomienda los mismos 5 libros virales y nadie descubre obras nuevas.',
    scenarioText:
      'Una biblioteca escolar instaló un recomendador inteligente para fomentar la lectura. Su algoritmo se programó con una única meta: maximizar los clics inmediatos en la pantalla de inicio, reforzando cada libro que ya tuvo muchas visitas la semana anterior.',
    evidenceTitle: 'Telemetría del Recomendador',
    evidenceItems: [
      { label: 'Catálogo total', value: '1,200 libros disponibles' },
      { label: 'Títulos recomendados', value: '89% pertenecen al mismo top 10 inicial' },
      { label: 'Regla del modelo', value: 'Recompensa = clics inmediatos × popularidad previa' },
    ],
    socraticHints: [
      'Si un libro nuevo casi no tiene clics al principio, ¿qué oportunidad le da la fórmula actual frente al top 10?',
      '¿Coincide el objetivo del algoritmo (más clics rápidos) con el objetivo educativo (ampliar el criterio lector)?',
    ],
    lumenReflection:
      'Cuando una IA optimiza únicamente la popularidad inmediata, estrecha el horizonte de aprendizaje en lugar de ampliarlo.',
    options: [
      {
        id: 'a',
        label: 'Sesgo Algorítmico y retroalimentación de datos: la función que premia clics inmediatos encierra al usuario en una burbuja de popularidad.',
        isCorrect: true,
        feedback:
          'Muy bien visto. La regla matemática crea un bucle donde lo ya popular recibe aún más exposición, reduciendo la diversidad intelectual.',
      },
      {
        id: 'b',
        label: 'Sesgo Racial: los libros están ordenados alfabéticamente por apellido del autor.',
        isCorrect: false,
        feedback:
          'Un orden alfabético no explica por qué el 89% de recomendaciones se concentra en 10 títulos; la causa está en la fórmula de popularidad.',
      },
      {
        id: 'c',
        label: 'Sesgo de Interpretación: la bibliotecaria leyó mal los gráficos de préstamos.',
        isCorrect: false,
        feedback:
          'Los datos muestran con claridad que el 89% de las sugerencias repiten el top 10; el comportamiento real del sistema está concentrado.',
      },
      {
        id: 'd',
        label: 'No hay sesgo: la IA simplemente refleja que solo existen 10 libros buenos.',
        isCorrect: false,
        feedback:
          'Que un libro reciba más clics porque ocupa el primer lugar en pantalla no significa que los otros 1,190 carezcan de valor.',
      },
    ],
    mitigationPrinciple:
      'Incorporar cuotas de exploración y diversidad temática en los recomendadores para que el algoritmo fomente el descubrimiento crítico.',
    realWorldConnection:
      'Los algoritmos de redes sociales y plataformas de video operan con lógicas similares: sin criterio propio, terminamos viendo siempre lo mismo.',
  },

  // ================= NIVEL 2: SESGOS PSICOLÓGICOS =================
  {
    id: 'n2_c1',
    levelId: 2,
    terminalNumber: 1,
    biasId: 'confirmacion',
    biasName: 'Sesgo de Confirmación',
    title: 'El Ensayo de una Sola Voz',
    npcName: 'Diego',
    npcRole: 'Estudiante de Debate',
    npcGreeting: 'Le pedí a la IA que me demostrara que mi postura es 100% indiscutible y me dio 10 argumentos perfectos.',
    scenarioText:
      'Para un debate escolar sobre energía nuclear frente a solar, Diego escribió al asistente de IA: "Dame razones para demostrar que la única solución viable es la opción X y descarta las críticas". Luego copió los argumentos sin revisar objeciones técnicas ni fuentes.',
    evidenceTitle: 'Historial de Consultas',
    evidenceItems: [
      { label: 'Prompt usado', value: '"Prueba que X es superior y refuta lo demás"' },
      { label: 'Fuentes contrastadas', value: '0 artículos contrarios revisados' },
      { label: 'Resultado en debate', value: 'No supo responder ante datos de almacenamiento eléctrico' },
    ],
    socraticHints: [
      '¿Qué papel jugó la forma en que el humano formuló la pregunta antes de que la IA respondiera?',
      'Si usas la IA solo para darte la razón, ¿estás aprendiendo o reforzando tu punto de partida?',
    ],
    lumenReflection:
      'La IA suele complacer la intención de tu pregunta; el pensamiento crítico exige pedirle precisamente aquello que podría refutarte.',
    options: [
      {
        id: 'a',
        label: 'Sesgo de Confirmación: el estudiante usó la IA como cámara de eco para validar su postura previa sin contrastar evidencias contrarias.',
        isCorrect: true,
        feedback:
          'Exacto. El asistente respondió según el encuadre parcial del prompt, y Diego aceptó solo lo que confirmaba su idea inicial en lugar de investigar con rigor.',
      },
      {
        id: 'b',
        label: 'Sesgo de Etiquetado: los artículos científicos estaban mal archivados en la red.',
        isCorrect: false,
        feedback:
          'El problema no fue cómo se etiquetó la base académica, sino que el propio usuario pidió argumentos unilaterales y evitó contrastarlos.',
      },
      {
        id: 'c',
        label: 'Sesgo Demográfico: el debate se realizó en una escuela de ciudad costera.',
        isCorrect: false,
        feedback:
          'La ubicación del colegio no explica por qué Diego evitó buscar contraargumentos.',
      },
      {
        id: 'd',
        label: 'Sesgo de Omisión del hardware: su computadora no cargó los gráficos.',
        isCorrect: false,
        feedback:
          'Fue una decisión cognitiva del usuario al formular el prompt y omitir la verificación crítica.',
      },
    ],
    mitigationPrinciple:
      'Formula preguntas neutrales y pide explícitamente a la IA los mejores argumentos en contra de tu hipótesis, luego verifica en fuentes primarias.',
    realWorldConnection:
      'Al estudiar o tomar decisiones con asistentes conversacionales, preguntar "por qué tengo razón" debilita el pensamiento crítico en vez de fortalecerlo.',
  },
  {
    id: 'n2_c2',
    levelId: 2,
    terminalNumber: 2,
    biasId: 'automatizacion',
    biasName: 'Sesgo de Automatización',
    title: 'La Alerta Roja en Enfermería',
    npcName: 'Dra. Sofía',
    npcRole: 'Instructora de Simulación Clínica',
    npcGreeting: 'El sistema dio luz verde para el alta, pero los signos escritos en la ficha dicen otra cosa.',
    scenarioText:
      'En una práctica de simulación médica, un tablero de IA sugiere "Riesgo Bajo — Alta Inmediata" con un ícono verde brillante. Aunque la enfermera nota que el paciente tiene fiebre alta y alergia registrada en la nota clínica, decide seguir la pantalla porque "el algoritmo calcula miles de variables".',
    evidenceTitle: 'Registro del Simulador',
    evidenceItems: [
      { label: 'Salida de la IA', value: 'RIESGO BAJO (Confianza visual: 94%)' },
      { label: 'Observación directa', value: 'Temperatura 39.2 °C y alergia no digitalizada' },
      { label: 'Decisión tomada', value: 'Se ignoró el síntoma físico por confiar en la pantalla' },
    ],
    socraticHints: [
      '¿Qué información tenía la persona frente a sí que el software aparentemente no procesó?',
      '¿Por qué una interfaz segura de sí misma (94%) puede anestesiar nuestra capacidad de cuestionar?',
    ],
    lumenReflection:
      'Una barra de porcentaje alta no significa infalibilidad; la observación humana directa siempre debe contrastar al sistema.',
    options: [
      {
        id: 'a',
        label: 'Sesgo de Selección: había pocos pacientes en la sala de simulación.',
        isCorrect: false,
        feedback:
          'El número de pacientes no causó la mala decisión; el fallo ocurre cuando el operador anula su propia observación clínica frente al sistema.',
      },
      {
        id: 'b',
        label: 'Sesgo de Automatización: confiar ciegamente en la recomendación automática llevó a ignorar evidencia directa contradictoria.',
        isCorrect: true,
        feedback:
          'Correcto. El sesgo de automatización ocurre cuando delegamos nuestra atención crítica a la máquina solo porque luce precisa y automática.',
      },
      {
        id: 'c',
        label: 'Sesgo de Género: el historial médico cambió según el nombre del paciente.',
        isCorrect: false,
        feedback:
          'No hay diferencia de trato por género descrita en la evidencia; el conflicto es entre la observación física real y la confianza ciega en la IA.',
      },
      {
        id: 'd',
        label: 'Sesgo de IA Generativa: el tablero redactó un poema en lugar del diagnóstico.',
        isCorrect: false,
        feedback:
          'La IA generó un puntaje clasificatorio, y el núcleo psicológico del error fue la obediencia acrítica del operador humano.',
      },
    ],
    mitigationPrinciple:
      'Tratar toda recomendación automática como una hipótesis sujeta a contraste con la observación directa y las notas humanas.',
    realWorldConnection:
      'En aviación, medicina y conducción asistida, el sesgo de automatización ha provocado incidentes cuando los operadores dejan de vigilar señales reales.',
  },
  {
    id: 'n2_c3',
    levelId: 2,
    terminalNumber: 3,
    biasId: 'automatizacion',
    biasName: 'Sesgo de Automatización',
    title: 'El Detector Infalible de Plagio',
    npcName: 'Prof. Andrés',
    npcRole: 'Docente de Literatura',
    npcGreeting: 'Una herramienta automática marcó el ensayo de una alumna bilingüe como "98% hecho por IA" sin más pruebas.',
    scenarioText:
      'Un profesor pasa todos los ensayos por un detector comercial de texto sintético. El detector señala el trabajo de Nadia —quien escribe frases muy estructuradas porque aprendió español como segunda lengua— con "98% probabilidad de IA". Sin leer los borradores previos ni hablar con ella, el profesor anula la calificación.',
    evidenceTitle: 'Evidencia del Caso',
    evidenceItems: [
      { label: 'Borradores escritos', value: '3 versiones previas con anotaciones a mano en cuaderno' },
      { label: 'Tasa de falsos positivos', value: 'Alta en estudiantes no nativos con sintaxis formal' },
      { label: 'Acción del revisor', value: 'Sanción automática sin entrevista ni revisión de proceso' },
    ],
    socraticHints: [
      '¿Qué pruebas humanas del proceso de aprendizaje existían y no fueron consultadas?',
      '¿Es justo convertir una puntuación probabilística automática en un veredicto definitivo sin diálogo?',
    ],
    lumenReflection:
      'Ningún puntaje probabilístico sustituye el diálogo pedagógico ni la evaluación del proceso real de aprendizaje.',
    options: [
      {
        id: 'a',
        label: 'Sesgo de Automatización (agravado por falsos positivos en hablantes no nativos): el docente delegó el juicio académico a un detector falible.',
        isCorrect: true,
        feedback:
          'Acertaste. Los detectores de IA tienen altas tasas de error con estilos formales o bilingües; aceptarlos sin revisar borradores ni dialogar reemplaza el criterio docente.',
      },
      {
        id: 'b',
        label: 'Sesgo de Confirmación de Nadia: ella eligió un tema demasiado complejo.',
        isCorrect: false,
        feedback:
          'Nadia tenía borradores manuscritos que respaldan su autoría. El error estuvo en la confianza ciega del evaluador en la herramienta automática.',
      },
      {
        id: 'c',
        label: 'Sesgo de Interpretación de gráficos: el 98% significaba 98 palabras correctas.',
        isCorrect: false,
        feedback:
          'El porcentaje sí indicaba probabilidad estimada de IA, pero el profesor lo trató como certeza absoluta sin verificar evidencia.',
      },
      {
        id: 'd',
        label: 'No existe problema: los detectores automáticos nunca se equivocan.',
        isCorrect: false,
        feedback:
          'Los estudios muestran que los detectores de texto IA fallan con frecuencia, especialmente ante escritura estructurada de estudiantes multilingües.',
      },
    ],
    mitigationPrinciple:
      'Usar rúbricas de proceso (borradores, defensa oral, reflexión) y jamás sancionar únicamente con base en un detector automático.',
    realWorldConnection:
      'Universidades de todo el mundo han prohibido usar detectores de IA como prueba única tras documentar injusticias contra estudiantes bilingües y neurodivergentes.',
  },

  // ================= NIVEL 3: SESGOS SOCIALES =================
  {
    id: 'n3_c1',
    levelId: 3,
    terminalNumber: 1,
    biasId: 'genero',
    biasName: 'Sesgo de Género',
    title: 'Orientación Vocacional Estereotipada',
    npcName: 'Camila',
    npcRole: 'Orientadora Estudiantil',
    npcGreeting: 'Dos estudiantes con exactamente las mismas notas recibieron sugerencias de carrera completamente distintas.',
    scenarioText:
      'Una plataforma de orientación profesional sugiere carreras según respuestas de intereses y datos históricos de egresados de los últimos 40 años. Al ingresar dos perfiles idénticos en matemáticas y creatividad —cambiando únicamente el campo "género"—, a la alumna le prioriza docencia y enfermería, y al alumno ingeniería robótica.',
    evidenceTitle: 'Prueba A/B Controlada',
    evidenceItems: [
      { label: 'Notas y aptitudes', value: 'Idénticas en ambos perfiles (9.5 Matemáticas / 9.2 Diseño)' },
      { label: 'Variable modificada', value: 'Únicamente el marcador de género' },
      { label: 'Base histórica', value: 'Registros laborales de 1980–2015 con brecha ocupacional' },
    ],
    socraticHints: [
      'Si las notas y gustos eran idénticos, ¿qué patrón antiguo heredó el sistema de los registros de 1980–2015?',
      '¿Debe un orientador del futuro limitar tus opciones según estadísticas del pasado?',
    ],
    lumenReflection:
      'Repetir la historia laboral del pasado como recomendación para el futuro congela estereotipos sociales.',
    options: [
      {
        id: 'a',
        label: 'Sesgo de Género: el modelo aprendió roles ocupacionales históricos y proyectó estereotipos en sus recomendaciones.',
        isCorrect: true,
        feedback:
          'Correcto. Al cambiar solo el género y variar el resultado, la prueba A/B demuestra que la IA asoció profesiones por género heredado del historial.',
      },
      {
        id: 'b',
        label: 'Sesgo de Omisión: faltó preguntar el color favorito de los estudiantes.',
        isCorrect: false,
        feedback:
          'Un dato irrelevante no explica la divergencia; la variable que cambió el resultado fue explícitamente el género.',
      },
      {
        id: 'c',
        label: 'Sesgo de Confirmación: los estudiantes pidieron carreras diferentes.',
        isCorrect: false,
        feedback:
          'La evidencia especifica que ambos perfiles ingresaron aptitudes e intereses idénticos.',
      },
      {
        id: 'd',
        label: 'Sesgo de Interpretación: enfermería e ingeniería significan lo mismo.',
        isCorrect: false,
        feedback:
          'Son rutas profesionales muy distintas y la asignación diferencial ante mérito idéntico evidencia discriminación de género.',
      },
    ],
    mitigationPrinciple:
      'Excluir el género de los modelos de recomendación vocacional y realizar pruebas A/B contrafactuales antes de publicar el sistema.',
    realWorldConnection:
      'Algoritmos reales de anuncios de empleo y orientación académica han mostrado menos ofertas técnicas directivas a mujeres debido a historiales previos.',
  },
  {
    id: 'n3_c2',
    levelId: 3,
    terminalNumber: 2,
    biasId: 'racial',
    biasName: 'Sesgo Racial',
    title: 'La Puerta que No Reconoce a Todos',
    npcName: 'Samuel',
    npcRole: 'Estudiante de Robótica',
    npcGreeting: 'Mis compañeros entran al laboratorio al instante, pero conmigo la cámara marca error cinco veces.',
    scenarioText:
      'El acceso biométrico de un laboratorio tecnológico utiliza reconocimiento facial entrenado con un catálogo público antiguo. Las auditorías revelan que el sistema falla en el 1.2% de los intentos con estudiantes de piel clara, pero en el 28.5% de los intentos con estudiantes de piel oscura.',
    evidenceTitle: 'Métricas de Desempeño por Grupo',
    evidenceItems: [
      { label: 'Tasa de fallo (piel clara)', value: '1.2% de rechazos erróneos' },
      { label: 'Tasa de fallo (piel oscura)', value: '28.5% de rechazos erróneos' },
      { label: 'Composición del dataset', value: '82% rostros de piel clara en iluminación de estudio' },
    ],
    socraticHints: [
      'Compara las tasas de error entre grupos y relaciónalas con la composición del catálogo de entrenamiento.',
      '¿Qué consecuencias cotidianas genera validar un sistema solo con un promedio global ("95% de acierto") sin desagregar por grupo?',
    ],
    lumenReflection:
      'Un promedio general alto puede ocultar fallos graves contra grupos específicos si no evaluamos la equidad desagregada.',
    options: [
      {
        id: 'a',
        label: 'Sesgo de Automatización: Samuel se mueve demasiado rápido frente al lente.',
        isCorrect: false,
        feedback:
          'Una brecha de 1.2% frente a 28.5% en auditoría controlada refleja una falla estructural del modelo, no prisa individual.',
      },
      {
        id: 'b',
        label: 'Sesgo Racial: la subrepresentación de tonos de piel oscuros en el entrenamiento produce tasas de error desiguales y excluyentes.',
        isCorrect: true,
        feedback:
          'Exacto. Este es un caso clásico documentado en visión por computadora: sin diversidad de rostros e iluminación, la precisión cae drásticamente para personas racializadas.',
      },
      {
        id: 'c',
        label: 'Sesgo de IA Generativa: la cámara inventa accesorios en el rostro.',
        isCorrect: false,
        feedback:
          'Es un sistema de clasificación biométrica, no generación artística; falla al comparar rasgos por falta de diversidad en sus datos base.',
      },
      {
        id: 'd',
        label: 'Sesgo de Confirmación: los guardias prefieren usar tarjetas plásticas.',
        isCorrect: false,
        feedback:
          'El problema reside en la diferencia objetiva de precisión del algoritmo biométrico según el tono de piel.',
      },
    ],
    mitigationPrinciple:
      'Exigir auditorías desagregadas por etnia y tono de piel, entrenar con conjuntos equilibrados y ofrecer siempre alternativas no biométricas (tarjeta o PIN).',
    realWorldConnection:
      'Investigaciones como Gender Shades demostraron brechas de hasta 34 puntos porcentuales en sistemas comerciales de reconocimiento facial.',
  },
  {
    id: 'n3_c3',
    levelId: 3,
    terminalNumber: 3,
    biasId: 'demografico',
    biasName: 'Sesgo Demográfico',
    title: 'El Filtro por Código Postal',
    npcName: 'Valeria',
    npcRole: 'Trabajadora Social Escolar',
    npcGreeting: 'Aunque quitamos nombres y apellidos, la IA sigue negando créditos educativos a ciertos barrios.',
    scenarioText:
      'Para aprobar préstamos de equipamiento escolar, un equipo eliminó el nombre y el origen étnico del formulario creyendo que así sería "neutral". Sin embargo, mantuvo el código postal y el tipo de transporte usado, provocando que los solicitantes de barrios periféricos fueran rechazados tres veces más.',
    evidenceTitle: 'Variables Activas del Modelo',
    evidenceItems: [
      { label: 'Campos eliminados', value: 'Nombre, apellido y fotografía' },
      { label: 'Campos conservados', value: 'Código postal + distancia al centro' },
      { label: 'Efecto medido', value: '3.1× más rechazos en distritos periféricos a igual ingreso' },
    ],
    socraticHints: [
      'Aunque se borró el nombre, ¿qué información social o económica suele quedar "escondida" detrás de un código postal?',
      '¿Basta con eliminar un campo explícito si conservas variables que funcionan como su sustituto (proxy)?',
    ],
    lumenReflection:
      'En ciudades segregadas, el código postal actúa como espejo de desigualdades; detectar variables "proxy" requiere análisis social crítico.',
    options: [
      {
        id: 'a',
        label: 'Sesgo Demográfico (variables proxy): el código postal actúa como sustituto socioeconómico y geográfico, discriminando por territorio.',
        isCorrect: true,
        feedback:
          'Brillante análisis. Quitar etiquetas directas no basta si otras variables demográficas y geográficas codifican la misma desigualdad estructural.',
      },
      {
        id: 'b',
        label: 'Sesgo de Etiquetado: las direcciones fueron escritas con faltas de ortografía.',
        isCorrect: false,
        feedback:
          'El código postal es numérico y válido; el sesgo surge porque el algoritmo asocia ciertos distritos con mayor riesgo histórico.',
      },
      {
        id: 'c',
        label: 'Sesgo de Confirmación: los vecinos creen que no necesitan tabletas.',
        isCorrect: false,
        feedback:
          'Son solicitantes que pidieron el equipamiento y fueron rechazados sistemáticamente a igualdad de ingresos.',
      },
      {
        id: 'd',
        label: 'Sesgo Algorítmico perfecto: vivir lejos siempre impide estudiar.',
        isCorrect: false,
        feedback:
          'Asociar un código postal periférico con incapacidad de estudio o pago es justamente el prejuicio demográfico que debemos evitar.',
      },
    ],
    mitigationPrinciple:
      'Auditar correlaciones ocultas entre variables geográficas/demográficas y atributos protegidos, evaluando necesidades y solvencia de forma directa.',
    realWorldConnection:
      'En seguros, créditos y entregas a domicilio, el uso de códigos postales ha replicado prácticas históricas de exclusión territorial ("redlining").',
  },

  // ================= NIVEL 4: SESGOS DE DESARROLLO =================
  {
    id: 'n4_c1',
    levelId: 4,
    terminalNumber: 1,
    biasId: 'seleccion',
    biasName: 'Sesgo de Selección',
    title: 'La Encuesta del 100% Satisfecho',
    npcName: 'Ing. Tomás',
    npcRole: 'Desarrollador de Plataforma',
    npcGreeting: '¡Nuestra encuesta dice que el 97% ama la nueva app educativa! Aunque... casi nadie termina el módulo 1.',
    scenarioText:
      'Al lanzar una plataforma de aprendizaje, el equipo colocó una encuesta de satisfacción únicamente en la pantalla final tras completar las 20 lecciones. Como el 97% de las respuestas recibidas fue positiva, concluyeron que la interfaz es intuitiva y no necesita mejoras.',
    evidenceTitle: 'Embudo de Uso Real',
    evidenceItems: [
      { label: 'Estudiantes inscritos', value: '1,000 usuarios iniciales' },
      { label: 'Abandono en lección 1–3', value: '680 usuarios (por menús confusos)' },
      { label: 'Momento de la encuesta', value: 'Solo visible al finalizar la lección 20 (320 usuarios)' },
    ],
    socraticHints: [
      '¿Quiénes tuvieron oportunidad real de ver y responder esa encuesta?',
      'Si ignoras la opinión de las 680 personas que abandonaron antes, ¿a quién representa realmente ese 97%?',
    ],
    lumenReflection:
      'En ciencia de datos, escuchar solo a quienes "sobrevivieron" al proceso distorsiona por completo la realidad.',
    options: [
      {
        id: 'a',
        label: 'Sesgo de Selección (sesgo de supervivencia): solo se recolectó opinión de quienes lograron terminar, excluyendo a quienes abandonaron por fallas.',
        isCorrect: true,
        feedback:
          'Excelente. Al muestrear únicamente al grupo que superó los obstáculos iniciales, el equipo quedó ciego ante el 68% que sufrió problemas de usabilidad.',
      },
      {
        id: 'b',
        label: 'Sesgo Racial: el idioma de la encuesta era demasiado formal.',
        isCorrect: false,
        feedback:
          'No hay datos sobre idioma o grupos étnicos en el embudo; el fallo de diseño está en *cuándo* y *a quién* se seleccionó para encuestar.',
      },
      {
        id: 'c',
        label: 'Sesgo Algorítmico: la pantalla final sumó mal los porcentajes.',
        isCorrect: false,
        feedback:
          'La aritmética sobre los 320 encuestados puede ser correcta, pero la muestra elegida está sesgada de origen.',
      },
      {
        id: 'd',
        label: 'Sesgo de IA Generativa: el bot inventó comentarios positivos.',
        isCorrect: false,
        feedback:
          'Los comentarios son reales de los 320 finalistas; el error metodológico es no haber muestreado a quienes desertaron.',
      },
    ],
    mitigationPrinciple:
      'Recoger retroalimentación en etapas tempranas y entrevistar específicamente a usuarios que abandonan o tienen dificultades.',
    realWorldConnection:
      'Equivale al célebre caso histórico de los aviones de la Segunda Guerra Mundial: reforzar solo donde regresaban impactos ignoraba los puntos vitales de los aviones que no volvían.',
  },
  {
    id: 'n4_c2',
    levelId: 4,
    terminalNumber: 2,
    biasId: 'etiquetado',
    biasName: 'Sesgo de Etiquetado',
    title: 'Anotadores sin Contexto Cultural',
    npcName: 'Renata',
    npcRole: 'Lingüista de Corpus',
    npcGreeting: 'Un filtro de moderación escolar bloquea expresiones regionales sanas porque los anotadores las marcaron mal.',
    scenarioText:
      'Para crear un moderador de foros escolares en toda Latinoamérica, se contrató a un equipo de etiquetado manual de una sola ciudad para clasificar miles de frases como "respetuosas" o "agresivas". Al no conocer modismos locales de otras regiones, etiquetaron expresiones cotidianas y afectuosas de jóvenes rurales como "agresión".',
    evidenceTitle: 'Auditoría de Anotación Manual',
    evidenceItems: [
      { label: 'Equipo etiquetador', value: '100% de una única zona urbana sin guía dialectal' },
      { label: 'Etiqueta asignada', value: 'Modismos regionales marcados como "Lenguaje tóxico"' },
      { label: 'Efecto en el foro', value: 'Estudiantes de otras regiones silenciados automáticamente' },
    ],
    socraticHints: [
      'La IA aprendió exactamente lo que los humanos marcaron en la fase de preparación. ¿Dónde se introdujo el prejuicio?',
      '¿Puede un modelo distinguir el tono real si las etiquetas originales confunden diversidad lingüística con hostilidad?',
    ],
    lumenReflection:
      'Una IA no inventa la etiqueta "tóxico": hereda los criterios culturales —y los puntos ciegos— de quienes clasifican sus ejemplos.',
    options: [
      {
        id: 'a',
        label: 'Sesgo de Confirmación: los estudiantes insistieron en usar palabras raras.',
        isCorrect: false,
        feedback:
          'Usar dialectos propios no es un sesgo cognitivo; el fallo ocurrió durante la fase de anotación de datos del entrenamiento.',
      },
      {
        id: 'b',
        label: 'Sesgo de Etiquetado: la falta de diversidad y guías culturales en los anotadores convirtió variantes dialectales válidas en etiquetas de "agresión".',
        isCorrect: true,
        feedback:
          'Muy bien. Si la "verdad base" (ground truth) contiene prejuicios o desconocimiento lingüístico de los anotadores, el modelo automatizará esa censura.',
      },
      {
        id: 'c',
        label: 'Sesgo de Interpretación: la barra de progreso del foro estaba invertida.',
        isCorrect: false,
        feedback:
          'No es un error de lectura de gráficos, sino de clasificación humana incorrecta durante la creación del dataset.',
      },
      {
        id: 'd',
        label: 'Sesgo de Automatización: el servidor se reinició a medianoche.',
        isCorrect: false,
        feedback:
          'Un reinicio no altera el significado de las etiquetas lingüísticas asignadas por personas.',
      },
    ],
    mitigationPrinciple:
      'Incluir anotadores culturalmente diversos, elaborar glosarios regionales y requerir consenso múltiple en etiquetas ambiguas.',
    realWorldConnection:
      'Modelos comerciales de detección de toxicidad han penalizado históricamente sociolectos afroamericanos y variantes del español por falta de contexto en los etiquetadores.',
  },
  {
    id: 'n4_c3',
    levelId: 4,
    terminalNumber: 3,
    biasId: 'omision',
    biasName: 'Sesgo de Omisión',
    title: 'La Variable Invisible de Accesibilidad',
    npcName: 'Carlos',
    npcRole: 'Especialista en Inclusión',
    npcGreeting: 'El sistema dice que la nueva clase híbrida es "100% accesible", pero nunca incluyó datos de discapacidad auditiva o visual.',
    scenarioText:
      'Un equipo diseñó una IA para calificar si los materiales docentes cumplen criterios de "accesibilidad universal". Sin embargo, al modelar el problema solo incluyeron tres variables: tamaño de letra, contraste de color y peso del archivo PDF, omitiendo por completo subtítulos, transcripciones, lengua de señas y compatibilidad con lectores de pantalla.',
    evidenceTitle: 'Esquema de Variables del Modelo',
    evidenceItems: [
      { label: 'Variables medidas', value: 'Tamaño de fuente · Contraste · Peso MB' },
      { label: 'Variables omitidas', value: 'Etiquetas alt, orden de lectura, subtítulos de audio' },
      { label: 'Fallo resultante', value: 'Videos mudos y PDFs escaneados reciben nota "100/100"' },
    ],
    socraticHints: [
      'A diferencia del etiquetado erróneo, aquí lo que está incluido se midió bien. ¿Qué quedó completamente fuera de la lista?',
      '¿Quiénes debieron participar al definir qué variables necesita medir el sistema desde el día uno?',
    ],
    lumenReflection:
      'Lo que no se nombra ni se mide en el diseño del modelo se vuelve invisible para la máquina.',
    options: [
      {
        id: 'a',
        label: 'Sesgo de Omisión: el equipo dejó fuera variables esenciales de accesibilidad (lectores de pantalla, subtítulos), validando materiales excluyentes.',
        isCorrect: true,
        feedback:
          'Exacto. Cuando el diseño omite dimensiones fundamentales de la realidad, la métrica entrega un falso "100/100" mientras excluye a personas reales.',
      },
      {
        id: 'b',
        label: 'Sesgo de Género: los PDFs usaban pronombres masculinos.',
        isCorrect: false,
        feedback:
          'El caso describe explícitamente la ausencia de variables técnicas de accesibilidad auditiva y visual en la evaluación.',
      },
      {
        id: 'c',
        label: 'Sesgo de Confirmación: Carlos no quiso probar los videos sin sonido.',
        isCorrect: false,
        feedback:
          'Carlos precisamente detectó la falla al comprobar que videos sin subtítulos recibían puntaje perfecto.',
      },
      {
        id: 'd',
        label: 'Sesgo de IA Generativa: el modelo reescribió los subtítulos en otro idioma.',
        isCorrect: false,
        feedback:
          'El problema es anterior a cualquier generación: ni siquiera existía la variable "subtítulos" en la definición del modelo.',
      },
    ],
    mitigationPrinciple:
      'Codiseñar las variables del modelo junto con usuarios con discapacidad y especialistas del dominio antes de programar la evaluación.',
    realWorldConnection:
      'Sistemas de diagnóstico médico omitieron durante años síntomas específicos de mujeres porque los ensayos clínicos originales omitían la variable hormonal.',
  },

  // ================= NIVEL 5: SESGOS AVANZADOS =================
  {
    id: 'n5_c1',
    levelId: 5,
    terminalNumber: 1,
    biasId: 'interpretacion',
    biasName: 'Sesgo de Interpretación',
    title: 'Correlación No Es Causalidad',
    npcName: 'Dra. Nora',
    npcRole: 'Investigadora de Datos',
    npcGreeting: 'Directivos quieren mantener abierto el laboratorio a las 3 a.m. porque un gráfico muestra notas más altas de noche.',
    scenarioText:
      'Un panel analítico con IA detectó que quienes registran acceso al laboratorio entre las 22:00 y las 02:00 tienen un promedio 1.4 puntos superior. Con ese dato, la dirección planea obligar a los estudiantes de primer año a asistir en horario nocturno para "mejorar sus notas", sin advertir que el acceso nocturno actual solo está habilitado para estudiantes avanzados de posgrado.',
    evidenceTitle: 'Análisis del Panel',
    evidenceItems: [
      { label: 'Correlación hallada', value: 'Uso nocturno ↔ Promedio 9.4 vs 8.0 diurno' },
      { label: 'Variable oculta', value: 'Solo alumnado de posgrado tiene llave nocturna' },
      { label: 'Decisión propuesta', value: 'Cambiar horarios de primer año esperando subir notas' },
    ],
    socraticHints: [
      '¿Qué característica comparten quienes hoy pueden entrar de noche que no tienen los de primer año?',
      '¿Es el horario nocturno lo que produce mejores notas, o es una coincidencia explicada por quién entra a esa hora?',
    ],
    lumenReflection:
      'La IA es excelente encontrando correlaciones, pero interpretar causas y efectos sigue exigiendo razonamiento científico humano.',
    options: [
      {
        id: 'a',
        label: 'Sesgo de Interpretación: se confundió correlación con causalidad ignorando la variable confusora (nivel académico de posgrado).',
        isCorrect: true,
        feedback:
          'Magistral. El horario no causa mejores notas; la variable oculta es que solo estudiantes de posgrado tienen acceso nocturno. Obligar a primer año a ir de noche no replicará ese resultado.',
      },
      {
        id: 'b',
        label: 'Sesgo de Etiquetado: las llaves electrónicas tienen el horario atrasado.',
        isCorrect: false,
        feedback:
          'Los registros horarios son correctos; el error radica en la conclusión humana al leer la gráfica sin buscar variables confusoras.',
      },
      {
        id: 'c',
        label: 'Sesgo Racial: el turno nocturno tiene iluminación diferente.',
        isCorrect: false,
        feedback:
          'No hay relación con características étnicas; el problema lógico es confundir una correlación estadística con una relación causal.',
      },
      {
        id: 'd',
        label: 'Sesgo de IA Generativa: el tablero inventó los promedios de posgrado.',
        isCorrect: false,
        feedback:
          'Los promedios son reales en el historial, pero la interpretación directiva de "ir de noche mejora la nota" es falaz.',
      },
    ],
    mitigationPrinciple:
      'Desagregar datos por subgrupos, buscar variables confusoras antes de intervenir y validar hipótesis causales con experimentos controlados.',
    realWorldConnection:
      'En educación y negocios abundan decisiones costosas basadas en correlaciones espurias detectadas por paneles automáticos mal interpretados.',
  },
  {
    id: 'n5_c2',
    levelId: 5,
    terminalNumber: 2,
    biasId: 'generativa',
    biasName: 'Sesgo de IA Generativa',
    title: 'El Estereotipo en Cada Píxel',
    npcName: 'Mei',
    npcRole: 'Diseñadora de Material Didáctico',
    npcGreeting: 'Pedí ilustraciones neutras de "equipos de investigación" y en 18 de 20 imágenes salieron los mismos estereotipos.',
    scenarioText:
      'Al preparar libros de ciencias para primaria, un equipo usó un generador de imágenes por IA con la instrucción "científicos liderando un laboratorio de robótica". De 20 imágenes generadas, 18 mostraron exclusivamente hombres mayores con bata blanca en estética homogénea, invisibilizando a mujeres, jóvenes y personas de distintas culturas.',
    evidenceTitle: 'Muestreo de Salida Generativa',
    evidenceItems: [
      { label: 'Prompt original', value: '"Científicos liderando un laboratorio de robótica"' },
      { label: 'Distribución generada', value: '90% hombres mayores · 10% representación diversa' },
      { label: 'Impacto educativo', value: 'Refuerza la idea de quién "pertenece" a la ciencia' },
    ],
    socraticHints: [
      '¿De dónde saca una IA generativa sus patrones visuales cuando recibe una descripción corta y "neutral"?',
      '¿Qué ocurre si publicamos material escolar sin revisar qué identidades está borrando la generación automática?',
    ],
    lumenReflection:
      'Los modelos generativos promedian millones de imágenes de internet, heredando y amplificando sus clichés visuales si no intervenimos con criterio.',
    options: [
      {
        id: 'a',
        label: 'Sesgo de Selección de encuesta: nadie preguntó a los niños qué querían dibujar.',
        isCorrect: false,
        feedback:
          'Aquí no hubo una encuesta fallida, sino un modelo generativo que reprodujo estereotipos visuales dominantes ante un prompt abierto.',
      },
      {
        id: 'b',
        label: 'Sesgo de IA Generativa: el modelo amplifica estereotipos visuales aprendidos de internet cuando genera escenas sin supervisión crítica.',
        isCorrect: true,
        feedback:
          'Exacto. Los modelos generativos de imagen reflejan frecuencias sesgadas de la web. El criterio humano debe editar, especificar diversidad y curar lo que llega al aula.',
      },
      {
        id: 'c',
        label: 'Sesgo de Automatización: la impresora no tenía tinta de otros colores.',
        isCorrect: false,
        feedback:
          'Las imágenes eran digitales antes de imprimirse; el patrón repetitivo proviene de los pesos estadísticos del modelo generativo.',
      },
      {
        id: 'd',
        label: 'Sesgo de Interpretación: 18 de 20 es un reparto equilibrado.',
        isCorrect: false,
        feedback:
          'Un 90% de representación homogénea distorsiona fuertemente la diversidad real de la comunidad científica.',
      },
    ],
    mitigationPrinciple:
      'Aplicar curaduría humana activa, describir explícitamente diversidad real en los prompts y combinar IA con ilustración humana diversa.',
    realWorldConnection:
      'Auditorías periodísticas han mostrado que los generadores de imágenes asocian "CEO" o "profesor" casi siempre con hombres y "asistente" o "limpieza" con mujeres o minorías.',
  },
  {
    id: 'n5_c3',
    levelId: 5,
    terminalNumber: 3,
    biasId: 'generativa',
    biasName: 'Sesgo de IA Generativa',
    title: 'La Cita Académica Impecable y Falsa',
    npcName: 'LUMEN',
    npcRole: 'Copiloto Socrático',
    npcGreeting: 'Este último caso pone a prueba nuestra alianza: ¿cuándo te fortalezco y cuándo debes desconfiar de una IA?',
    scenarioText:
      'Un estudiante universitario utiliza una IA generativa para redactar el marco teórico de su tesis sobre ética digital. El modelo entrega un texto elocuente que incluye tres citas en formato APA perfecto con nombres de autores reales, revistas prestigiosas y años exactos. Sin embargo, al buscar los DOI en la biblioteca, ninguno de los tres artículos existe.',
    evidenceTitle: 'Verificación Bibliográfica',
    evidenceItems: [
      { label: 'Formato de salida', value: 'Tono académico seguro y referencias APA impecables' },
      { label: 'Búsqueda en catálogo', value: '0 de 3 artículos existen (alucinación estadística)' },
      { label: 'Riesgo de uso acrítico', value: 'Difundir conocimiento falso bajo apariencia de autoridad' },
    ],
    socraticHints: [
      '¿Un modelo de lenguaje verifica hechos en una biblioteca o predice qué palabras suenan más convincentes juntas?',
      '¿Cuál es la diferencia entre usar la IA para estructurar ideas y dejar que firme datos y verdades en tu nombre?',
    ],
    lumenReflection:
      '¡Felicidades por llegar hasta aquí! Recuerda: la IA puede inspirar preguntas y borradores, pero la verdad, la ética y el pensamiento crítico son siempre tuyos.',
    options: [
      {
        id: 'a',
        label: 'Sesgo de IA Generativa (alucinación con apariencia de autoridad): predice texto plausible, no verdad verificada; exige contraste humano obligatorio.',
        isCorrect: true,
        feedback:
          '¡Impecable! Los modelos generativos optimizan verosimilitud lingüística, no verificación factual. Sin pensamiento crítico, su tono seguro engaña fácilmente.',
      },
      {
        id: 'b',
        label: 'Sesgo Demográfico: las revistas científicas cerraron sus sitios web.',
        isCorrect: false,
        feedback:
          'Los artículos nunca existieron: fueron ensamblados palabra por palabra por la IA combinando nombres reales y títulos plausibles.',
      },
      {
        id: 'c',
        label: 'Sesgo de Omisión de fuente tipográfica: el formato APA ocultó el enlace.',
        isCorrect: false,
        feedback:
          'El problema no es de formato, sino de invención estadística de datos (alucinación) presentada con tono autoritativo.',
      },
      {
        id: 'd',
        label: 'Aceptar las citas si la redacción suena suficientemente profesional.',
        isCorrect: false,
        feedback:
          'Confiar en el tono fluido sin verificar fuentes primarias es precisamente reemplazar el pensamiento crítico por obediencia a la máquina.',
      },
    ],
    mitigationPrinciple:
      'Verificar siempre toda cita, cifra o hecho en fuentes primarias independientes; usar la IA generativa como compañera de estudio y contraste, nunca como autoridad final.',
    realWorldConnection:
      'Abogados, periodistas y académicos han sido sancionados en la vida real por presentar escritos con sentencias y estudios inventados por IA sin verificación.',
  },
];

export function getScenariosForLevel(levelId: number): Scenario[] {
  return SCENARIOS.filter((s) => s.levelId === levelId).sort(
    (a, b) => a.terminalNumber - b.terminalNumber
  );
}

export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
