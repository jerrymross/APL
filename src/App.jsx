import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  LayoutDashboard,
  MapPinned,
  Printer,
  RotateCcw,
  Search,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { courseSteps, finalQuestions, totalEstimatedMinutes } from './courseData.js';
import { countyOptions } from './locationData.js';

const STORAGE_KEY = 'astar-apl-handledarutbildning-v1';
const COMPLETIONS_KEY = 'astar-apl-handledarutbildning-completions-v1';
const CERTIFICATE_STEP = courseSteps.length + 1;
const START_STEP = -1;

function getToday() {
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function getCompletionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `apl-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadCompletions() {
  try {
    const saved = localStorage.getItem(COMPLETIONS_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item === 'object') : [];
  } catch {
    return [];
  }
}

function saveCompletionRecord(record) {
  if (!record.id) return;

  const currentRecords = loadCompletions();
  const nextRecords = [...currentRecords];
  const recordIndex = nextRecords.findIndex((item) => item.id === record.id);

  if (recordIndex >= 0) {
    nextRecords[recordIndex] = {
      ...nextRecords[recordIndex],
      ...record,
      updatedAt: new Date().toISOString(),
    };
  } else {
    nextRecords.unshift({
      ...record,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(nextRecords));
}

function getCitiesForCounty(county) {
  return countyOptions.find((item) => item.name === county)?.cities ?? [];
}

function shuffleArray(items) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]];
  }

  return nextItems;
}

function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function createShuffledOrder(length, previousOrder = null) {
  const baseOrder = Array.from({ length }, (_, index) => index);

  if (length < 2) return baseOrder;

  let nextOrder = baseOrder;
  let attempts = 0;

  while (
    (arraysEqual(nextOrder, baseOrder) || (previousOrder && arraysEqual(nextOrder, previousOrder))) &&
    attempts < 12
  ) {
    nextOrder = shuffleArray(baseOrder);
    attempts += 1;
  }

  return nextOrder;
}

function createOptionOrders(previousOrders = null) {
  return {
    course: courseSteps.map((step, index) =>
      createShuffledOrder(step.options.length, previousOrders?.course?.[index] ?? null),
    ),
    final: finalQuestions.map((question, index) =>
      createShuffledOrder(question.options.length, previousOrders?.final?.[index] ?? null),
    ),
  };
}

function isValidOptionOrder(orders, sourceItems) {
  return (
    Array.isArray(orders) &&
    orders.length === sourceItems.length &&
    orders.every((order, itemIndex) => {
      const expected = sourceItems[itemIndex].options.map((_, index) => index).sort((a, b) => a - b);
      return (
        Array.isArray(order) &&
        order.length === expected.length &&
        [...order].sort((a, b) => a - b).every((value, valueIndex) => value === expected[valueIndex])
      );
    })
  );
}

function applyOptionOrder(items, orders) {
  return items.map((item, itemIndex) => {
    const order = orders[itemIndex];
    const randomizedOptions = order.map((originalIndex) => item.options[originalIndex]);
    const correctIndex = order.findIndex((originalIndex) => originalIndex === item.correctIndex);

    return {
      ...item,
      options: randomizedOptions,
      correctIndex,
    };
  });
}

function loadSavedState() {
  try {
    if (window.location.search.includes('reset=1')) {
      localStorage.removeItem(STORAGE_KEY);
      window.history.replaceState({}, '', window.location.pathname);
      return null;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    if (!parsed || typeof parsed !== 'object') return null;

    const maxStep = CERTIFICATE_STEP;
    const currentStep = Number.isInteger(parsed.currentStep)
      ? Math.min(Math.max(parsed.currentStep, START_STEP), maxStep)
      : START_STEP;
    const generatedOrders = createOptionOrders();
    const optionOrders = {
      course: isValidOptionOrder(parsed.courseOptionOrders, courseSteps)
        ? parsed.courseOptionOrders
        : generatedOrders.course,
      final: isValidOptionOrder(parsed.finalOptionOrders, finalQuestions)
        ? parsed.finalOptionOrders
        : generatedOrders.final,
    };
    const courseAnswers = Array.isArray(parsed.courseAnswers)
      ? courseSteps.map((_, index) =>
          Number.isInteger(parsed.courseAnswers[index]) ? parsed.courseAnswers[index] : null,
        )
      : Array(courseSteps.length).fill(null);
    const finalAnswers = Array.isArray(parsed.finalAnswers)
      ? finalQuestions.map((_, index) =>
          Number.isInteger(parsed.finalAnswers[index]) ? parsed.finalAnswers[index] : null,
        )
      : Array(finalQuestions.length).fill(null);

    return {
      currentStep,
      courseAnswers,
      finalAnswers,
      optionOrders,
      participant: {
        name: typeof parsed.name === 'string' ? parsed.name : '',
        company: typeof parsed.company === 'string' ? parsed.company : '',
        county: typeof parsed.county === 'string' ? parsed.county : '',
        city: typeof parsed.city === 'string' ? parsed.city : '',
      },
      completionId: typeof parsed.completionId === 'string' ? parsed.completionId : '',
      certificateDate:
        typeof parsed.certificateDate === 'string' ? parsed.certificateDate : getToday(),
    };
  } catch {
    return null;
  }
}

function ProgressBar({ currentStep, totalSteps }) {
  const displayStep = currentStep === START_STEP ? 0 : currentStep + 1;
  const percent = currentStep === START_STEP ? 0 : Math.round((displayStep / totalSteps) * 100);

  return (
    <div aria-label="Progress" className="space-y-2.5">
      <div className="flex items-center justify-between text-sm font-bold text-astar-navy">
        <span>
          {currentStep === START_STEP
            ? 'Start'
            : `Steg ${Math.min(displayStep, totalSteps)} av ${totalSteps}`}
        </span>
        <span>{percent}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-blue-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-astar-accent to-astar-secondary transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function Card({ children, className }) {
  return (
    <section
      className={cx(
        'screen-enter rounded-lg border border-blue-100/90 bg-white/95 p-5 shadow-card sm:p-7',
        className,
      )}
    >
      {children}
    </section>
  );
}

function AppButton({ children, variant = 'primary', className, ...props }) {
  const variants = {
    primary:
      'bg-astar-accent text-white shadow-lift hover:bg-[#d94f47] focus:ring-astar-accent/35 disabled:bg-slate-400',
    secondary:
      'bg-astar-secondary text-white shadow-lift hover:bg-astar-ink focus:ring-astar-secondary/35 disabled:bg-slate-400',
    ghost:
      'border border-blue-200 bg-white text-astar-navy hover:border-astar-secondary hover:bg-blue-50 focus:ring-astar-secondary/25 disabled:opacity-45',
  };

  return (
    <button
      className={cx(
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 py-3 font-bold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed',
        variants[variant],
        className,
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

function InfoPill({ icon: Icon, children }) {
  return (
    <div className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-bold text-astar-navy">
      <Icon className="h-4 w-4 text-astar-accent" aria-hidden="true" />
      {children}
    </div>
  );
}

function FormField({ label, htmlFor, icon: Icon, required = false, children }) {
  return (
    <label className="block space-y-2" htmlFor={htmlFor}>
      <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-astar-secondary">
        {Icon ? <Icon className="h-4 w-4 text-astar-accent" aria-hidden="true" /> : null}
        {label}
        {required ? <span className="text-astar-accent">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function StartPage({ onStart }) {
  const benefits = [
    {
      title: 'Tydligare start',
      text: 'Eleven vet vad som gäller från första dagen.',
    },
    {
      title: 'Tryggare handledning',
      text: 'Handledaren får enkla beteenden att använda direkt.',
    },
    {
      title: 'Bättre underlag',
      text: 'Skolan får tydligare bild av elevens utveckling.',
    },
  ];

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid min-w-0 gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="min-w-0 space-y-7 p-6 sm:p-8">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-astar-accent">
                APL-handledarutbildning
              </p>
              <h1 className="mt-2 max-w-xl text-[2.15rem] font-black leading-tight text-astar-navy sm:text-5xl lg:text-[2.85rem]">
                Tryggare APL på varje arbetsplats
              </h1>
            </div>
          </div>

          <p className="max-w-full break-words text-lg leading-relaxed text-slate-700 sm:max-w-2xl sm:text-xl">
            Den här utbildningen hjälper handledare att ge elever en tydlig, trygg och lärorik
            APL-period. När alla arbetsplatser gör utbildningen får eleverna ett mer likvärdigt
            stöd, oavsett bransch, plats eller handledare.
          </p>

          <div className="flex flex-wrap gap-3">
            <InfoPill icon={Clock3}>30 minuter</InfoPill>
            <InfoPill icon={BookOpen}>Praktiska scenarier</InfoPill>
            <InfoPill icon={BadgeCheck}>Certifikat vid godkänt</InfoPill>
          </div>

          <AppButton onClick={onStart} className="w-full sm:w-auto">
            Starta utbildningen
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </AppButton>
        </div>

        <aside className="min-w-0 border-t border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 sm:p-8 lg:border-l lg:border-t-0">
          <div className="space-y-4">
            <p className="break-words text-sm font-black uppercase leading-relaxed tracking-wide text-astar-secondary">
              Varför alla arbetsplatser ska göra den
            </p>
            {benefits.map((item) => (
              <div key={item.title} className="min-w-0 rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
                <Check className="mb-3 h-5 w-5 text-astar-accent" aria-hidden="true" />
                <h2 className="text-lg font-black text-astar-navy">{item.title}</h2>
                <p className="mt-1 leading-relaxed text-slate-700">{item.text}</p>
              </div>
            ))}
            <div className="rounded-lg border border-astar-light/70 bg-white p-5 text-slate-700">
              <p>
                Upplägget är kort, konkret och byggt för vardagen: vad handledaren gör, säger och
                följer upp när eleven är på plats.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </Card>
  );
}

function StepHeader({ section, title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-lg bg-astar-secondary px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white">
          {section}
        </span>
        {children}
      </div>
      <h1 className="max-w-3xl text-3xl font-black leading-tight text-astar-navy sm:text-4xl">
        {title}
      </h1>
    </div>
  );
}

function BulletList({ bullets }) {
  return (
    <ul className="grid gap-3 text-base text-slate-800 sm:text-lg">
      {bullets.map((bullet) => (
        <li
          key={bullet}
          className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50/70 p-4"
        >
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-astar-secondary shadow-sm">
            <Check className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>{bullet}</span>
        </li>
      ))}
    </ul>
  );
}

function AnswerButton({ option, index, isSelected, isCorrect, wasAnswered, onClick }) {
  const stateClass = wasAnswered
    ? isCorrect
      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-100'
      : isSelected
        ? 'border-astar-accent bg-red-50 text-red-950 ring-2 ring-red-100'
        : 'border-blue-100 bg-white text-slate-700'
    : isSelected
      ? 'border-astar-secondary bg-blue-50 text-astar-navy ring-2 ring-blue-100'
      : 'border-blue-100 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-astar-secondary hover:bg-blue-50 hover:shadow-sm';

  return (
    <button
      className={cx(
        'flex min-h-16 w-full items-center gap-3 rounded-lg border p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-astar-light/50',
        stateClass,
      )}
      onClick={onClick}
      type="button"
      aria-pressed={isSelected}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-astar-secondary/10 text-sm font-bold text-astar-secondary">
        {index + 1}
      </span>
      <span className="font-medium">{option}</span>
    </button>
  );
}

function FeedbackBox({ isCorrect, message }) {
  return (
    <div
      className={cx(
        'flex gap-3 rounded-lg border p-4 text-base shadow-sm',
        isCorrect
          ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
          : 'border-astar-accent bg-red-50 text-red-950',
      )}
      role="status"
    >
      {isCorrect ? (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <Check className="h-4 w-4" aria-hidden="true" />
        </span>
      ) : (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100">
          <X className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
      <p className="leading-relaxed">{message}</p>
    </div>
  );
}

function QuizCard({ step, answer, onAnswer }) {
  const wasAnswered = Number.isInteger(answer);
  const isCorrect = answer === step.correctIndex;

  return (
    <Card>
      <div className="space-y-6">
        <StepHeader section={step.section} title={step.title}>
          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-astar-secondary">
            60-90 sekunder
          </span>
        </StepHeader>
        {step.body && (
          <p className="rounded-lg border border-blue-100 bg-slate-50 p-5 text-lg leading-relaxed text-slate-800">
            {step.body}
          </p>
        )}
        <BulletList bullets={step.bullets} />
        {step.extra && (
          <p className="rounded-lg border border-astar-light bg-blue-50 p-4 font-semibold text-astar-navy">
            {step.extra}
          </p>
        )}
        <div className="space-y-4 rounded-lg border border-blue-100 bg-white p-4 sm:p-5">
          <h2 className="text-xl font-bold text-astar-navy">{step.prompt}</h2>
          <div className="grid gap-3">
            {step.options.map((option, index) => (
              <AnswerButton
                key={option}
                option={option}
                index={index}
                isSelected={answer === index}
                isCorrect={index === step.correctIndex}
                wasAnswered={wasAnswered}
                onClick={() => onAnswer(index)}
              />
            ))}
          </div>
        </div>
        {wasAnswered && (
          <FeedbackBox
            isCorrect={isCorrect}
            message={isCorrect ? step.feedback.correct : step.feedback.incorrect}
          />
        )}
      </div>
    </Card>
  );
}

function ScenarioCard(props) {
  return <QuizCard {...props} />;
}

function FinalTest({ answers, onAnswer, questions }) {
  const answeredCount = answers.filter(Number.isInteger).length;

  return (
    <Card>
      <div className="space-y-6">
        <StepHeader section="Sluttest" title="Visa vad du kan">
          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-astar-secondary">
            Minst 4 av 5 rätt
          </span>
        </StepHeader>
        <p className="text-lg text-slate-800">
          Svara på fem korta frågor. Du får resultatet direkt på nästa steg.
        </p>
        <div className="space-y-4">
          {questions.map((question, questionIndex) => (
            <div key={question.id} className="rounded-lg border border-blue-100 bg-slate-50 p-4 sm:p-5">
              <h2 className="mb-3 text-lg font-bold text-astar-navy">
                {questionIndex + 1}. {question.prompt}
              </h2>
              <div className="grid gap-2">
                {question.options.map((option, optionIndex) => (
                  <button
                    key={option}
                    className={cx(
                      'min-h-12 rounded-lg border px-4 py-3 text-left font-medium transition focus:outline-none focus:ring-4 focus:ring-astar-light/50',
                      answers[questionIndex] === optionIndex
                        ? 'border-astar-secondary bg-blue-50 text-astar-navy ring-2 ring-blue-100'
                        : 'border-blue-100 bg-white text-slate-800 hover:border-astar-secondary hover:bg-blue-50',
                    )}
                    type="button"
                    onClick={() => onAnswer(questionIndex, optionIndex)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-600">{answeredCount} av 5 besvarade</p>
      </div>
    </Card>
  );
}

function AdminPanel({ records }) {
  const [sortBy, setSortBy] = useState('date-desc');
  const [search, setSearch] = useState('');

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matchingRecords = records.filter((record) => {
      if (!query) return true;

      return [record.name, record.company, record.county, record.city, record.date]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });

    const compare = {
      'date-desc': (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0),
      'date-asc': (a, b) =>
        new Date(a.updatedAt || a.createdAt || 0) - new Date(b.updatedAt || b.createdAt || 0),
      name: (a, b) => a.name.localeCompare(b.name, 'sv'),
      company: (a, b) => a.company.localeCompare(b.company, 'sv'),
      county: (a, b) => a.county.localeCompare(b.county, 'sv'),
      city: (a, b) => a.city.localeCompare(b.city, 'sv'),
    };

    return [...matchingRecords].sort(compare[sortBy]);
  }, [records, search, sortBy]);

  return (
    <Card className="no-print">
      <div className="space-y-6">
        <StepHeader section="Admin" title="Genomförda utbildningar">
          <LayoutDashboard className="h-5 w-5 text-astar-accent" aria-hidden="true" />
        </StepHeader>
        <p className="text-base leading-relaxed text-slate-700 sm:text-lg">
          Här ser du vilka som genomfört utbildningen i den här webbläsaren. Listan går att
          sortera och söka i.
        </p>

        <div className="grid gap-4 rounded-lg border border-blue-100 bg-slate-50 p-4 sm:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              className="w-full rounded-lg border border-blue-100 bg-white py-3 pl-10 pr-4 text-slate-950 outline-none focus:border-astar-secondary focus:ring-4 focus:ring-astar-light/30"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Sök på namn, företag, län eller stad"
            />
          </div>
          <div className="relative">
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <select
              className="w-full appearance-none rounded-lg border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none focus:border-astar-secondary focus:ring-4 focus:ring-astar-light/30"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="date-desc">Senast genomförd</option>
              <option value="date-asc">Äldst först</option>
              <option value="name">Namn A-Ö</option>
              <option value="company">Företag A-Ö</option>
              <option value="county">Län A-Ö</option>
              <option value="city">Stad A-Ö</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-blue-100">
          <div className="hidden grid-cols-[1.1fr_1fr_1fr_1fr_0.8fr] bg-blue-50 text-sm font-black uppercase tracking-wide text-astar-secondary md:grid">
            {['Namn', 'Företag', 'Län', 'Stad', 'Datum'].map((heading) => (
              <div key={heading} className="border-r border-blue-100 px-4 py-3 last:border-r-0">
                {heading}
              </div>
            ))}
          </div>
          {filteredRecords.length === 0 ? (
            <div className="bg-white px-4 py-8 text-center text-slate-600">
              Inga genomförda utbildningar sparade ännu.
            </div>
          ) : (
            <div className="divide-y divide-blue-100 bg-white">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="grid grid-cols-1 gap-3 px-4 py-4 text-sm text-slate-700 md:grid-cols-[1.1fr_1fr_1fr_1fr_0.8fr] md:gap-4"
                >
                  <div>
                    <p className="font-bold text-astar-navy">{record.name}</p>
                    <p className="text-xs text-slate-500">Poäng: {record.score} av 5</p>
                  </div>
                  <div>
                    <span className="md:hidden font-bold text-slate-500">Företag: </span>
                    {record.company}
                  </div>
                  <div>
                    <span className="md:hidden font-bold text-slate-500">Län: </span>
                    {record.county}
                  </div>
                  <div>
                    <span className="md:hidden font-bold text-slate-500">Stad: </span>
                    {record.city}
                  </div>
                  <div>
                    <span className="md:hidden font-bold text-slate-500">Datum: </span>
                    {record.date}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function ResultCard({
  score,
  passed,
  participant,
  setParticipant,
  date,
  onRestart,
  onSaveCompletion,
}) {
  const [isCreatingPdf, setIsCreatingPdf] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const availableCities = getCitiesForCounty(participant.county);
  const canPrintCertificate =
    passed &&
    participant.name.trim() &&
    participant.company.trim() &&
    participant.county &&
    participant.city;

  function updateParticipant(field, value) {
    setParticipant((current) => {
      if (field === 'county') {
        return {
          ...current,
          county: value,
          city: '',
        };
      }

      return {
        ...current,
        [field]: value,
      };
    });
  }

  async function handlePrintCertificate() {
    if (!canPrintCertificate) {
      setPdfError('Fyll i namn, företag, län och stad innan du skriver ut certifikatet.');
      return;
    }

    setPdfError('');
    setIsCreatingPdf(true);

    try {
      onSaveCompletion();
      const { openCertificatePdf } = await import('./certificatePdf.js');
      await openCertificatePdf({
        name: participant.name,
        company: participant.company,
        county: participant.county,
        city: participant.city,
        date,
        score,
        logoSrc: '/astar-logo.jpg',
      });
    } catch {
      setPdfError('Certifikatet kunde inte skapas. Försök igen.');
    } finally {
      setIsCreatingPdf(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="space-y-6">
        <StepHeader section="Certifikat" title="APL-handledare - Astar">
          <Award className="h-5 w-5 text-astar-accent" aria-hidden="true" />
        </StepHeader>
        <p className="text-lg text-slate-800">
          Har genomfört Astar handledarutbildning enligt Skolverkets riktlinjer.
        </p>
        <div className="rounded-lg border border-blue-100 bg-gradient-to-br from-slate-50 to-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Namn" htmlFor="name" icon={UserRound} required>
              <input
                id="name"
                className="w-full rounded-lg border border-blue-100 bg-white px-4 py-3 text-lg text-slate-950 outline-none focus:border-astar-secondary focus:ring-4 focus:ring-astar-light/30"
                value={participant.name}
                onChange={(event) => updateParticipant('name', event.target.value)}
                placeholder="Skriv ditt namn"
              />
            </FormField>
            <FormField label="Företag" htmlFor="company" icon={Building2} required>
              <input
                id="company"
                className="w-full rounded-lg border border-blue-100 bg-white px-4 py-3 text-lg text-slate-950 outline-none focus:border-astar-secondary focus:ring-4 focus:ring-astar-light/30"
                value={participant.company}
                onChange={(event) => updateParticipant('company', event.target.value)}
                placeholder="Vilket företag kommer du från?"
              />
            </FormField>
            <FormField label="Län" htmlFor="county" icon={MapPinned} required>
              <div className="relative">
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <select
                  id="county"
                  className="w-full appearance-none rounded-lg border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none focus:border-astar-secondary focus:ring-4 focus:ring-astar-light/30"
                  value={participant.county}
                  onChange={(event) => updateParticipant('county', event.target.value)}
                >
                  <option value="">Välj län</option>
                  {countyOptions.map((county) => (
                    <option key={county.name} value={county.name}>
                      {county.name}
                    </option>
                  ))}
                </select>
              </div>
            </FormField>
            <FormField label="Stad" htmlFor="city" icon={MapPinned} required>
              <div className="relative">
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <select
                  id="city"
                  className="w-full appearance-none rounded-lg border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none focus:border-astar-secondary focus:ring-4 focus:ring-astar-light/30 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                  value={participant.city}
                  onChange={(event) => updateParticipant('city', event.target.value)}
                  disabled={!participant.county}
                >
                  <option value="">{participant.county ? 'Välj stad' : 'Välj län först'}</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </FormField>
          </div>
          <dl className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-3">
              <dt className="text-sm text-slate-600">Datum</dt>
              <dd className="font-bold text-astar-navy">{date}</dd>
            </div>
            <div className="rounded-lg bg-white p-3">
              <dt className="text-sm text-slate-600">Resultat</dt>
              <dd className={cx('font-bold', passed ? 'text-emerald-700' : 'text-red-700')}>
                {passed ? 'Godkänd' : 'Ej godkänd'}
              </dd>
            </div>
            <div className="rounded-lg bg-white p-3">
              <dt className="text-sm text-slate-600">Poäng</dt>
              <dd className="font-bold text-astar-navy">{score} av 5</dd>
            </div>
          </dl>
        </div>
        {!passed && (
          <FeedbackBox
            isCorrect={false}
            message="Du behöver minst 4 rätt. Starta om och gör utbildningen igen."
          />
        )}
        {passed && !canPrintCertificate && (
          <FeedbackBox
            isCorrect={false}
            message="Fyll i namn, företag, län och stad innan certifikatet kan skrivas ut och sparas i adminöversikten."
          />
        )}
        <div className="no-print flex flex-wrap gap-3">
          {passed && (
            <AppButton
              variant="secondary"
              onClick={handlePrintCertificate}
              disabled={isCreatingPdf || !canPrintCertificate}
            >
              <Printer className="h-5 w-5" aria-hidden="true" />
              {isCreatingPdf ? 'Skapar certifikat...' : 'Skriv ut certifikat'}
            </AppButton>
          )}
          <AppButton onClick={onRestart}>
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
            Starta om
          </AppButton>
        </div>
        {pdfError && (
          <p className="no-print rounded-md border border-astar-accent bg-red-50 p-3 text-red-950">
            {pdfError}
          </p>
        )}
      </div>
    </Card>
  );
}

function Navigation({ canGoBack, canGoNext, isFinalStep, onBack, onNext }) {
  return (
    <nav className="flex items-center justify-between gap-3" aria-label="Navigering">
      <AppButton variant="ghost" onClick={onBack} disabled={!canGoBack}>
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        Tillbaka
      </AppButton>
      <AppButton onClick={onNext} disabled={!canGoNext}>
        {isFinalStep ? 'Visa certifikat' : 'Gå vidare'}
        <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </AppButton>
    </nav>
  );
}

export default function App() {
  const savedState = useMemo(loadSavedState, []);
  const [optionOrders, setOptionOrders] = useState(savedState?.optionOrders ?? createOptionOrders());
  const randomizedCourseSteps = useMemo(
    () => applyOptionOrder(courseSteps, optionOrders.course),
    [optionOrders],
  );
  const randomizedFinalQuestions = useMemo(
    () => applyOptionOrder(finalQuestions, optionOrders.final),
    [optionOrders],
  );
  const [currentStep, setCurrentStep] = useState(savedState?.currentStep ?? START_STEP);
  const [courseAnswers, setCourseAnswers] = useState(
    savedState?.courseAnswers ?? Array(courseSteps.length).fill(null),
  );
  const [finalAnswers, setFinalAnswers] = useState(
    savedState?.finalAnswers ?? Array(finalQuestions.length).fill(null),
  );
  const [participant, setParticipant] = useState(
    savedState?.participant ?? {
      name: '',
      company: '',
      county: '',
      city: '',
    },
  );
  const [completionId, setCompletionId] = useState(savedState?.completionId ?? '');
  const [showAdmin, setShowAdmin] = useState(false);
  const [completionRecords, setCompletionRecords] = useState(() => loadCompletions());
  const [certificateDate, setCertificateDate] = useState(savedState?.certificateDate ?? getToday());

  const finalScore = finalAnswers.reduce(
    (total, answer, index) => total + (answer === randomizedFinalQuestions[index].correctIndex ? 1 : 0),
    0,
  );
  const passed = finalScore >= 4;
  const totalSteps = courseSteps.length + 2;
  const isFinalTest = currentStep === courseSteps.length;
  const isCertificate = currentStep === CERTIFICATE_STEP;
  const allFinalAnswered = finalAnswers.every(Number.isInteger);
  const isStart = currentStep === START_STEP;
  const canGoNext = isCertificate
    ? false
    : isFinalTest
      ? allFinalAnswered
      : Number.isInteger(courseAnswers[currentStep]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentStep,
        courseAnswers,
        finalAnswers,
        courseOptionOrders: optionOrders.course,
        finalOptionOrders: optionOrders.final,
        name: participant.name,
        company: participant.company,
        county: participant.county,
        city: participant.city,
        completionId,
        certificateDate,
        finalScore,
        passed,
      }),
    );
  }, [
    certificateDate,
    completionId,
    courseAnswers,
    currentStep,
    finalAnswers,
    finalScore,
    optionOrders,
    participant,
    passed,
  ]);

  function handleSaveCompletion() {
    if (!passed) return;

    const trimmedName = participant.name.trim();
    const trimmedCompany = participant.company.trim();
    if (!trimmedName || !trimmedCompany || !participant.county || !participant.city) return;

    const nextCompletionId = completionId || getCompletionId();
    if (!completionId) {
      setCompletionId(nextCompletionId);
    }

    saveCompletionRecord({
      id: nextCompletionId,
      name: trimmedName,
      company: trimmedCompany,
      county: participant.county,
      city: participant.city,
      date: certificateDate,
      score: finalScore,
    });

    setCompletionRecords(loadCompletions());
  }

  function handleCourseAnswer(index) {
    setCourseAnswers((answers) =>
      answers.map((answer, answerIndex) => (answerIndex === currentStep ? index : answer)),
    );
  }

  function handleFinalAnswer(questionIndex, optionIndex) {
    setFinalAnswers((answers) =>
      answers.map((answer, answerIndex) => (answerIndex === questionIndex ? optionIndex : answer)),
    );
  }

  function handleNext() {
    if (!canGoNext) return;
    if (currentStep === courseSteps.length) {
      setCertificateDate(getToday());
    }
    setCurrentStep((step) => Math.min(step + 1, CERTIFICATE_STEP));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleStart() {
    setCurrentStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBack() {
    setCurrentStep((step) => Math.max(step - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRestart() {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentStep(START_STEP);
    setCourseAnswers(Array(courseSteps.length).fill(null));
    setFinalAnswers(Array(finalQuestions.length).fill(null));
    setOptionOrders((currentOrders) => createOptionOrders(currentOrders));
    setParticipant({
      name: '',
      company: '',
      county: '',
      city: '',
    });
    setCompletionId('');
    setCertificateDate(getToday());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSkipToPassed() {
    setCurrentStep(CERTIFICATE_STEP);
    setFinalAnswers(randomizedFinalQuestions.map((question) => question.correctIndex));
    setCertificateDate(getToday());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const currentCourseStep = currentStep >= 0 ? randomizedCourseSteps[currentStep] : null;

  return (
    <main className="min-h-screen overflow-x-hidden px-4 py-4 sm:px-6 lg:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="sticky top-3 z-10 rounded-lg border border-blue-100 bg-white/95 p-4 shadow-card backdrop-blur sm:p-5">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <img
                src="/astar-logo.jpg"
                alt="Astar"
                className="h-10 w-fit rounded bg-white object-contain sm:h-14"
              />
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wide text-astar-accent sm:text-sm">
                  APL
                </p>
                <p className="max-w-full break-words text-lg font-black leading-tight text-astar-navy sm:text-xl">
                  30-minuters handledarutbildning
                </p>
              </div>
            </div>
            <div className="flex w-fit items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-bold text-astar-navy">
              <ClipboardCheck className="h-4 w-4 text-astar-accent" aria-hidden="true" />
              {totalEstimatedMinutes} min
            </div>
          </div>
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </header>

        {isStart && <StartPage onStart={handleStart} />}

        {currentCourseStep?.type === 'quiz' && (
          <QuizCard
            key={currentCourseStep.id}
            step={currentCourseStep}
            answer={courseAnswers[currentStep]}
            onAnswer={handleCourseAnswer}
          />
        )}

        {currentCourseStep?.type === 'scenario' && (
          <ScenarioCard
            key={currentCourseStep.id}
            step={currentCourseStep}
            answer={courseAnswers[currentStep]}
            onAnswer={handleCourseAnswer}
          />
        )}

        {isFinalTest && (
          <FinalTest
            answers={finalAnswers}
            onAnswer={handleFinalAnswer}
            questions={randomizedFinalQuestions}
          />
        )}

        {isCertificate && (
          <ResultCard
            score={finalScore}
            passed={passed}
            participant={participant}
            setParticipant={setParticipant}
            date={certificateDate}
            onRestart={handleRestart}
            onSaveCompletion={handleSaveCompletion}
          />
        )}

        {showAdmin && <AdminPanel records={completionRecords} />}

        {!isStart && !isCertificate && (
          <Navigation
            canGoBack={currentStep > 0}
            canGoNext={canGoNext}
            isFinalStep={isFinalTest}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}

        <footer className="flex items-center justify-center gap-2 pb-4 text-center text-sm text-slate-600">
          <Sparkles className="h-4 w-4 text-astar-accent" aria-hidden="true" />
          Progress och resultat sparas automatiskt i den här webbläsaren.
        </footer>

        <div className="no-print flex justify-center">
          <AppButton variant="ghost" onClick={() => setShowAdmin((value) => !value)}>
            <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
            {showAdmin ? 'Dölj adminöversikt' : 'Visa adminöversikt'}
          </AppButton>
        </div>

        <button
          className="no-print fixed bottom-4 right-4 z-20 hidden rounded-md border border-astar-accent bg-white px-3 py-2 text-xs font-bold text-astar-accent shadow-glow transition hover:bg-red-50 sm:block"
          type="button"
          onClick={handleSkipToPassed}
        >
          Test: godkänt
        </button>
      </div>
    </main>
  );
}
