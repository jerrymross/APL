import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  ClipboardCheck,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { courseSteps, finalQuestions, totalEstimatedMinutes } from './courseData.js';

const STORAGE_KEY = 'astar-apl-handledarutbildning-v1';
const CERTIFICATE_STEP = courseSteps.length + 1;

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
      ? Math.min(Math.max(parsed.currentStep, 0), maxStep)
      : 0;
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
      name: typeof parsed.name === 'string' ? parsed.name : '',
      certificateDate:
        typeof parsed.certificateDate === 'string' ? parsed.certificateDate : getToday(),
    };
  } catch {
    return null;
  }
}

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

function ProgressBar({ currentStep, totalSteps }) {
  const percent = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div aria-label="Progress" className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-200">
        <span>Steg {Math.min(currentStep + 1, totalSteps)} av {totalSteps}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-astar-accent transition-all duration-300"
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
        'screen-enter rounded-lg border border-blue-100 bg-white p-5 shadow-glow sm:p-7',
        className,
      )}
    >
      {children}
    </section>
  );
}

function StepHeader({ section, title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-astar-secondary px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          {section}
        </span>
        {children}
      </div>
      <h1 className="text-3xl font-bold leading-tight text-astar-navy sm:text-4xl">{title}</h1>
    </div>
  );
}

function BulletList({ bullets }) {
  return (
    <ul className="grid gap-3 text-lg text-slate-800">
      {bullets.map((bullet) => (
        <li key={bullet} className="flex gap-3 rounded-md border border-blue-100 bg-blue-50/70 p-3">
          <Check className="mt-1 h-5 w-5 shrink-0 text-astar-secondary" aria-hidden="true" />
          <span>{bullet}</span>
        </li>
      ))}
    </ul>
  );
}

function AnswerButton({ option, index, isSelected, isCorrect, wasAnswered, onClick }) {
  const stateClass = wasAnswered
    ? isCorrect
      ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
      : isSelected
        ? 'border-astar-accent bg-red-50 text-red-950'
        : 'border-blue-100 bg-white text-slate-700'
    : isSelected
      ? 'border-astar-secondary bg-blue-50 text-astar-navy'
      : 'border-blue-100 bg-white text-slate-800 hover:border-astar-secondary hover:bg-blue-50';

  return (
    <button
      className={cx(
        'flex min-h-16 w-full items-center gap-3 rounded-md border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-astar-light',
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
        'flex gap-3 rounded-md border p-4 text-base',
        isCorrect
          ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
          : 'border-astar-accent bg-red-50 text-red-950',
      )}
      role="status"
    >
      {isCorrect ? (
        <Check className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      ) : (
        <X className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      )}
      <p>{message}</p>
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
          <span className="text-sm font-semibold text-astar-secondary">60-90 sekunder</span>
        </StepHeader>
        {step.body && (
          <p className="rounded-md border border-blue-100 bg-slate-50 p-4 text-lg leading-relaxed text-slate-800">
            {step.body}
          </p>
        )}
        <BulletList bullets={step.bullets} />
        {step.extra && (
          <p className="rounded-md border border-astar-light bg-blue-50 p-3 text-astar-navy">
            {step.extra}
          </p>
        )}
        <div className="space-y-4">
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

function FinalTest({ answers, onAnswer }) {
  const answeredCount = answers.filter(Number.isInteger).length;

  return (
    <Card>
      <div className="space-y-6">
        <StepHeader section="Sluttest" title="Visa vad du kan">
          <span className="text-sm font-semibold text-astar-secondary">Minst 4 av 5 rätt</span>
        </StepHeader>
        <p className="text-lg text-slate-800">
          Svara på fem korta frågor. Du får resultatet direkt på nästa steg.
        </p>
        <div className="space-y-5">
          {finalQuestions.map((question, questionIndex) => (
            <div key={question.id} className="rounded-lg border border-blue-100 bg-slate-50 p-4">
              <h2 className="mb-3 text-lg font-bold text-astar-navy">
                {questionIndex + 1}. {question.prompt}
              </h2>
              <div className="grid gap-2">
                {question.options.map((option, optionIndex) => (
                  <button
                    key={option}
                    className={cx(
                      'min-h-12 rounded-md border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-astar-light',
                      answers[questionIndex] === optionIndex
                        ? 'border-astar-secondary bg-blue-50 text-astar-navy'
                        : 'border-blue-100 bg-white text-slate-800 hover:border-astar-secondary',
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

function ResultCard({ score, passed, name, setName, date, onRestart }) {
  return (
    <Card className="overflow-hidden">
      <div className="space-y-6">
        <StepHeader section="Certifikat" title="APL-handledare – Astar">
          <Award className="h-5 w-5 text-astar-accent" aria-hidden="true" />
        </StepHeader>
        <p className="text-lg text-slate-800">
          Har genomfört Astar handledarutbildning enligt Skolverkets riktlinjer.
        </p>
        <div className="rounded-lg border border-blue-100 bg-slate-50 p-5">
          <label className="block text-sm font-bold uppercase tracking-wide text-astar-light" htmlFor="name">
            Namn
          </label>
          <input
            id="name"
            className="mt-2 w-full rounded-md border border-blue-100 bg-white px-4 py-3 text-lg text-slate-950 outline-none focus:border-astar-secondary focus:ring-2 focus:ring-astar-light/40"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Skriv ditt namn"
          />
          <dl className="mt-5 grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-slate-600">Datum</dt>
              <dd className="font-bold text-astar-navy">{date}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-600">Resultat</dt>
              <dd className={cx('font-bold', passed ? 'text-emerald-200' : 'text-red-100')}>
                {passed ? 'Godkänd' : 'Ej godkänd'}
              </dd>
            </div>
            <div>
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
        <button
          className="inline-flex min-h-12 items-center gap-2 rounded-md bg-astar-accent px-5 py-3 font-bold text-white transition hover:bg-[#d94f47] focus:outline-none focus:ring-2 focus:ring-astar-light"
          type="button"
          onClick={onRestart}
        >
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
          Starta om
        </button>
      </div>
    </Card>
  );
}

function Navigation({ canGoBack, canGoNext, isFinalStep, onBack, onNext }) {
  return (
    <nav className="flex items-center justify-between gap-3" aria-label="Navigering">
      <button
        className="inline-flex min-h-12 items-center gap-2 rounded-md border border-blue-200 bg-white px-4 py-3 font-bold text-astar-navy transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
        type="button"
        onClick={onBack}
        disabled={!canGoBack}
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        Tillbaka
      </button>
      <button
        className="inline-flex min-h-12 items-center gap-2 rounded-md bg-astar-accent px-5 py-3 font-bold text-white transition hover:bg-[#d94f47] disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
      >
        {isFinalStep ? 'Visa certifikat' : 'Gå vidare'}
        <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </nav>
  );
}

export default function App() {
  const savedState = useMemo(loadSavedState, []);
  const [currentStep, setCurrentStep] = useState(savedState?.currentStep ?? 0);
  const [courseAnswers, setCourseAnswers] = useState(
    savedState?.courseAnswers ?? Array(courseSteps.length).fill(null),
  );
  const [finalAnswers, setFinalAnswers] = useState(
    savedState?.finalAnswers ?? Array(finalQuestions.length).fill(null),
  );
  const [name, setName] = useState(savedState?.name ?? '');
  const [certificateDate, setCertificateDate] = useState(savedState?.certificateDate ?? getToday());

  const finalScore = finalAnswers.reduce(
    (total, answer, index) => total + (answer === finalQuestions[index].correctIndex ? 1 : 0),
    0,
  );
  const passed = finalScore >= 4;
  const totalSteps = courseSteps.length + 2;
  const isFinalTest = currentStep === courseSteps.length;
  const isCertificate = currentStep === CERTIFICATE_STEP;
  const allFinalAnswered = finalAnswers.every(Number.isInteger);
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
        name,
        certificateDate,
        finalScore,
        passed,
      }),
    );
  }, [certificateDate, courseAnswers, currentStep, finalAnswers, finalScore, name, passed]);

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

  function handleBack() {
    setCurrentStep((step) => Math.max(step - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRestart() {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentStep(0);
    setCourseAnswers(Array(courseSteps.length).fill(null));
    setFinalAnswers(Array(finalQuestions.length).fill(null));
    setName('');
    setCertificateDate(getToday());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const currentCourseStep = courseSteps[currentStep];

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
        <header className="sticky top-0 z-10 rounded-lg border border-blue-100 bg-white/95 p-4 shadow-glow backdrop-blur">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/astar-logo.jpg"
                alt="Astar"
                className="h-12 w-auto rounded bg-white object-contain sm:h-14"
              />
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-astar-accent">APL</p>
                <p className="text-xl font-bold text-astar-navy">30-minuters handledarutbildning</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-astar-navy">
              <ClipboardCheck className="h-4 w-4 text-astar-accent" aria-hidden="true" />
              {totalEstimatedMinutes} min
            </div>
          </div>
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </header>

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
          />
        )}

        {isCertificate && (
          <ResultCard
            score={finalScore}
            passed={passed}
            name={name}
            setName={setName}
            date={certificateDate}
            onRestart={handleRestart}
          />
        )}

        {!isCertificate && (
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
      </div>
    </main>
  );
}
