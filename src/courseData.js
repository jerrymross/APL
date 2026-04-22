export const courseSteps = [
  {
    id: 'intro',
    type: 'quiz',
    section: 'Introduktion',
    title: 'Din roll som handledare',
    body:
      'Som handledare är du elevens närmaste stöd i vardagen. Du behöver inte hålla en lektion, utan visa hur arbetet går till och hjälpa eleven att förstå vad som är viktigt på arbetsplatsen.',
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
    body:
      'Första dagen sätter tonen för hela APL-perioden. När eleven snabbt får veta var saker finns, vilka regler som gäller och vad hen ska börja med blir starten lugnare och mer meningsfull.',
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
    body:
      'Bra handledning sker i små steg. Börja med att visa momentet, gör det sedan tillsammans och låt eleven ta mer ansvar när du ser att hen är redo.',
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
    body:
      'Feedback fungerar bäst när den kommer nära situationen. Säg vad eleven gjorde, vad som behöver ändras och visa gärna hur nästa försök kan bli bättre.',
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
    body:
      'Du sätter inte betyg, men dina observationer hjälper skolan att förstå elevens utveckling. Titta på hur eleven arbetar, hur mycket stöd som behövs och om utvecklingen går framåt över tid.',
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
  {
    id: 'communication',
    type: 'quiz',
    section: 'Kommunikation',
    title: 'Prata tydligt i vardagen',
    body:
      'Eleven behöver förstå vad som ska göras, varför det är viktigt och när uppgiften är klar. Korta avstämningar under dagen gör att små frågor inte växer till stora problem.',
    bullets: [
      'Säg vad som ska göras först',
      'Kontrollera att eleven har förstått',
      'Stäm av innan dagen är slut',
    ],
    prompt: 'Vad är bäst när du ger en ny uppgift?',
    options: [
      'Ge uppgiften snabbt och gå därifrån',
      'Förklara uppgiften och kontrollera att eleven förstått',
      'Låta eleven gissa hur arbetet ska göras',
    ],
    correctIndex: 1,
    feedback: {
      correct: 'Tydliga instruktioner och avstämning minskar missförstånd.',
      incorrect: 'Eleven behöver veta både vad som ska göras och hur starten ska se ut.',
    },
  },
  {
    id: 'safety',
    type: 'scenario',
    section: 'Säkerhet',
    title: 'Säkerhet går först',
    body:
      'Säkerhet är alltid en del av handledningen. Eleven ska veta vilka risker som finns, vilka rutiner som gäller och när hen ska fråga innan arbetet fortsätter.',
    bullets: [
      'Visa risker innan uppgiften startar',
      'Följ arbetsplatsens rutiner',
      'Stoppa arbetet vid osäkerhet',
    ],
    prompt: 'Eleven är osäker på en säkerhetsrutin. Vad gör du?',
    options: [
      'Ber eleven fortsätta försiktigt',
      'Stoppar och går igenom rutinen igen',
      'Säger att eleven får fråga någon annan senare',
    ],
    correctIndex: 1,
    feedback: {
      correct: 'Vid osäkerhet ska arbetet stoppas och rutinen förklaras igen.',
      incorrect: 'Säkerhet ska hanteras direkt, inte skjutas upp.',
    },
  },
  {
    id: 'support',
    type: 'scenario',
    section: 'Stöd',
    title: 'När eleven fastnar',
    body:
      'Alla elever fastnar ibland. Din uppgift är att hjälpa eleven vidare utan att ta över hela arbetet. Ställ frågor, visa nästa steg och låt eleven prova igen.',
    bullets: [
      'Ställ en enkel fråga',
      'Visa nästa steg',
      'Låt eleven försöka igen',
    ],
    prompt: 'Eleven säger: “Jag kan inte det här.” Vad gör du?',
    options: [
      'Tar över uppgiften direkt',
      'Visar nästa steg och låter eleven prova igen',
      'Säger att uppgiften är för svår',
    ],
    correctIndex: 1,
    feedback: {
      correct: 'Stöd ska hjälpa eleven att komma vidare och bli mer självständig.',
      incorrect: 'Att ta över eller ge upp minskar elevens möjlighet att utvecklas.',
    },
  },
  {
    id: 'school-contact',
    type: 'quiz',
    section: 'Kontakt med skolan',
    title: 'Säg till i tid',
    body:
      'Handledaren är inte ensam. Om något inte fungerar, om eleven ofta är frånvarande eller om du ser att målen inte nås, ska skolan få veta det i tid.',
    bullets: [
      'Ta problem tidigt',
      'Dokumentera konkreta exempel',
      'Kontakta skolan vid oro',
    ],
    prompt: 'När bör du kontakta skolan?',
    options: [
      'När APL-perioden är helt slut',
      'Tidigt om frånvaro, oro eller problem uppstår',
      'Bara om eleven själv ber om det',
    ],
    correctIndex: 1,
    feedback: {
      correct: 'Tidiga signaler gör att skolan kan stötta eleven och arbetsplatsen.',
      incorrect: 'Vänta inte till slutet om något inte fungerar.',
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
