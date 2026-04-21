export const courseSteps = [
  {
    id: 'intro',
    type: 'quiz',
    section: 'Introduktion',
    title: 'Din roll som handledare',
    bullets: [
      'Eleven är här för att lära',
      'Du visar → eleven gör → du ger feedback',
      'Du skapar trygghet och tydlighet',
    ],
    prompt: 'Vad är din viktigaste uppgift?',
    options: [
      'Få arbetet gjort snabbt',
      'Låta eleven observera hela dagen',
      'Lära ut arbetet i praktiken',
    ],
    correctIndex: 2,
    feedback: {
      correct: 'Handledning handlar om att visa, låta prova och ge feedback.',
      incorrect: 'Fokus ska vara elevens lärande, inte produktion.',
    },
  },
  {
    id: 'first-day',
    type: 'quiz',
    section: 'Första dagen',
    title: 'Första dagen',
    bullets: [
      'Visa arbetsplatsen',
      'Gå igenom säkerhet och rutiner',
      'Förklara tider och ansvar',
      'Ge en första uppgift direkt',
    ],
    prompt: 'Vad är viktigast första dagen?',
    options: [
      'Låta eleven ta det lugnt',
      'Ge en tydlig start och uppgift direkt',
      'Vänta tills det finns tid',
    ],
    correctIndex: 1,
    feedback: {
      correct: 'En tydlig start minskar osäkerhet.',
      incorrect: 'Eleven behöver snabbt förstå vad som gäller.',
    },
  },
  {
    id: 'guidance',
    type: 'scenario',
    section: 'Handledning i praktiken',
    title: 'Så lär du ut',
    bullets: ['Visa', 'Gör tillsammans', 'Låt eleven göra själv'],
    prompt: 'Eleven har sett dig göra ett moment. Vad gör du nu?',
    options: [
      'Låter eleven göra själv direkt',
      'Gör tillsammans först',
      'Går vidare till något annat',
    ],
    correctIndex: 1,
    feedback: {
      correct: 'Att göra tillsammans skapar trygghet.',
      incorrect: 'Att hoppa över steg leder ofta till osäkerhet.',
    },
  },
  {
    id: 'feedback',
    type: 'quiz',
    section: 'Feedback',
    title: 'Ge bra feedback',
    bullets: ['Var tydlig', 'Var konkret', 'Visa hur det kan bli bättre'],
    prompt: 'Vilken feedback är bäst?',
    options: [
      'Det där var inte bra',
      'Bra, fortsätt',
      'Testa att göra så här istället för att få bättre resultat',
    ],
    correctIndex: 2,
    feedback: {
      correct: 'Tydlig och konkret feedback hjälper eleven att utvecklas.',
      incorrect: 'Otydlig feedback leder inte till lärande.',
    },
  },
  {
    id: 'assessment',
    type: 'scenario',
    section: 'Bedömning',
    title: 'Vad du ska titta på',
    bullets: [
      'Hur arbetet utförs (kvalitet)',
      'Hur självständig eleven är',
      'Hur eleven utvecklas över tid',
    ],
    extra: 'Skolan ansvarar för betyg – du bidrar med underlag',
    prompt: 'Eleven gör uppgiften korrekt men behöver mycket stöd.',
    options: [
      'Godkänd utan kommentarer',
      'Behöver utveckla sin självständighet',
      'Underkänd direkt',
    ],
    correctIndex: 1,
    feedback: {
      correct: 'Självständighet är en viktig del av utvecklingen.',
      incorrect: 'Bedömning handlar om helhet, inte en enskild faktor.',
    },
  },
];

export const finalQuestions = [
  {
    id: 'final-role',
    prompt: 'Vad är handledarens viktigaste fokus?',
    options: [
      'Att eleven lär sig arbetet i praktiken',
      'Att arbetet blir klart snabbast möjligt',
      'Att eleven bara tittar på',
    ],
    correctIndex: 0,
  },
  {
    id: 'final-start',
    prompt: 'Vad hjälper eleven mest första dagen?',
    options: [
      'En tydlig start, rutiner och en första uppgift',
      'Att vänta tills någon får tid',
      'Att slippa uppgifter första dagen',
    ],
    correctIndex: 0,
  },
  {
    id: 'final-method',
    prompt: 'Vilken ordning passar bäst när du lär ut ett moment?',
    options: [
      'Visa, gör tillsammans, låt eleven göra själv',
      'Låt eleven göra själv, visa efteråt',
      'Prata om momentet och gå vidare',
    ],
    correctIndex: 0,
  },
  {
    id: 'final-feedback',
    prompt: 'Vilken feedback hjälper eleven mest?',
    options: [
      'Kort beröm utan förklaring',
      'Tydlig och konkret feedback med förbättring',
      'Att bara säga vad som blev fel',
    ],
    correctIndex: 1,
  },
  {
    id: 'final-assessment',
    prompt: 'Vad bidrar handledaren med vid bedömning?',
    options: [
      'Betyg direkt till eleven',
      'Underlag om kvalitet, självständighet och utveckling',
      'Endast närvarolista',
    ],
    correctIndex: 1,
  },
];

export const totalEstimatedMinutes = 30;
