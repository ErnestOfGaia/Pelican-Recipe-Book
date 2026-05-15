export type Lang = 'en' | 'es';

export const i18n = {
  en: {
    // Bottom nav
    navDashboard: 'Dashboard',
    navRecipes: 'Recipes',
    navQuizzes: 'Quizzes',
    navSettings: 'Settings',

    // App header
    appName: 'PELLITO HUB',

    // Recipe detail sections
    sectionIngredients: 'Ingredients',
    sectionCookSteps: 'Cook Steps',
    sectionPlatingSteps: 'Plating Steps',
    sectionAllergens: 'Allergens',
    labelYield: 'Yield',
    labelPrepTime: 'Prep Time',
    labelShelfLife: 'Shelf Life',
    labelPlateware: 'Plateware',
    labelBack: 'Back to recipes',

    // Dashboard / recipe list
    searchPlaceholder: 'Search recipes…',
    filterAll: 'All',
    filterSaute: 'Saute',
    filterGrill: 'Grill',
    filterFryer: 'Fryer',
    filterPantry: 'Pantry',
    filterPizza: 'Pizza',
    emptyRecipes: 'No recipes found.',
    badgeCore: 'Core',
    badgeSpecials: 'Specials',
    badgeNew: 'New',

    // Quiz drawer
    quizStart: 'Start Quiz',
    quizEasyTitle: 'Easy Questions',
    quizHardTitle: 'Hard Questions',
    quizHardPrompt: 'Ready for the hard round?',
    quizHardSubtext: 'Three harder questions to test your deeper knowledge.',
    quizStartHard: 'Start Hard Round',
    quizSkipHard: 'Skip — I\'m done',
    quizNextQuestion: 'Next Question',
    quizFinish: 'Finish',
    quizCorrect: 'Correct!',
    quizIncorrect: 'Incorrect',
    quizResultEasy: 'Easy Round Complete',
    quizResultHard: 'Hard Round Complete',
    quizScore: 'Score',
    quizClose: 'Close',
    quizLoading: 'Loading questions…',
    quizTakeQuiz: 'Take the Quiz',
    quizDescription: 'Test your knowledge of this recipe with a short quiz.',

    // Quiz history
    quizHistoryTitle: 'YOUR QUIZZES',
    quizActivityTitle: 'QUIZ ACTIVITY',
    quizHistorySubtextUser: 'Most recent 20 attempts on this account.',
    quizHistorySubtextAdmin: 'Most recent 100 attempts across all roles.',
    quizHistoryAttempts: 'Attempts',
    quizHistoryCorrect: 'Correct',
    quizHistoryAccuracy: 'Accuracy',
    quizHistoryEmpty: 'No quiz attempts yet. Take a quiz from any recipe!',
    quizHistoryColRecipe: 'Recipe',
    quizHistoryColQuestion: 'Question',
    quizHistoryColResult: 'Result',
    quizHistoryColDate: 'Date',
    quizHistoryColRole: 'Role',

    // Settings
    settingsTitle: 'SETTINGS',
    settingsAccount: 'Account',
    settingsSignedInAs: 'Signed in as',
    settingsLogOut: 'Log Out',
    settingsSwitchRole: 'Switch Role',
    settingsLanguage: 'Language',
    settingsSelectLanguage: 'Select your preferred language.',
  },
  es: {
    // Bottom nav
    navDashboard: 'Panel',
    navRecipes: 'Recetas',
    navQuizzes: 'Cuestionarios',
    navSettings: 'Configuración',

    // App header
    appName: 'PELLITO HUB',

    // Recipe detail sections
    sectionIngredients: 'Ingredientes',
    sectionCookSteps: 'Pasos de Cocción',
    sectionPlatingSteps: 'Pasos de Emplatado',
    sectionAllergens: 'Alérgenos',
    labelYield: 'Rendimiento',
    labelPrepTime: 'Tiempo de Prep.',
    labelShelfLife: 'Vida Útil',
    labelPlateware: 'Vajilla',
    labelBack: 'Volver a recetas',

    // Dashboard / recipe list
    searchPlaceholder: 'Buscar recetas…',
    filterAll: 'Todo',
    filterSaute: 'Salteado',
    filterGrill: 'Parrilla',
    filterFryer: 'Freidora',
    filterPantry: 'Despensa',
    filterPizza: 'Pizza',
    emptyRecipes: 'No se encontraron recetas.',
    badgeCore: 'Básico',
    badgeSpecials: 'Especiales',
    badgeNew: 'Nuevo',

    // Quiz drawer
    quizStart: 'Iniciar Cuestionario',
    quizEasyTitle: 'Preguntas Fáciles',
    quizHardTitle: 'Preguntas Difíciles',
    quizHardPrompt: '¿Listo para la ronda difícil?',
    quizHardSubtext: 'Tres preguntas más difíciles para probar tu conocimiento profundo.',
    quizStartHard: 'Iniciar Ronda Difícil',
    quizSkipHard: 'Saltar — ya terminé',
    quizNextQuestion: 'Siguiente Pregunta',
    quizFinish: 'Terminar',
    quizCorrect: '¡Correcto!',
    quizIncorrect: 'Incorrecto',
    quizResultEasy: 'Ronda Fácil Completa',
    quizResultHard: 'Ronda Difícil Completa',
    quizScore: 'Puntaje',
    quizClose: 'Cerrar',
    quizLoading: 'Cargando preguntas…',
    quizTakeQuiz: 'Tomar el Cuestionario',
    quizDescription: 'Pon a prueba tu conocimiento de esta receta con un breve cuestionario.',

    // Quiz history
    quizHistoryTitle: 'TUS CUESTIONARIOS',
    quizActivityTitle: 'ACTIVIDAD DE CUESTIONARIOS',
    quizHistorySubtextUser: 'Los 20 intentos más recientes en esta cuenta.',
    quizHistorySubtextAdmin: 'Los 100 intentos más recientes en todos los roles.',
    quizHistoryAttempts: 'Intentos',
    quizHistoryCorrect: 'Correctos',
    quizHistoryAccuracy: 'Precisión',
    quizHistoryEmpty: 'Aún no hay intentos. ¡Toma un cuestionario desde cualquier receta!',
    quizHistoryColRecipe: 'Receta',
    quizHistoryColQuestion: 'Pregunta',
    quizHistoryColResult: 'Resultado',
    quizHistoryColDate: 'Fecha',
    quizHistoryColRole: 'Rol',

    // Settings
    settingsTitle: 'CONFIGURACIÓN',
    settingsAccount: 'Cuenta',
    settingsSignedInAs: 'Conectado como',
    settingsLogOut: 'Cerrar Sesión',
    settingsSwitchRole: 'Cambiar Rol',
    settingsLanguage: 'Idioma',
    settingsSelectLanguage: 'Selecciona tu idioma preferido.',
  },
} satisfies Record<Lang, Record<string, string>>;

export type I18nKey = keyof typeof i18n.en;
