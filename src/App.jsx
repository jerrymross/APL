import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Check,
  ClipboardCheck,
  Clock3,
  Printer,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { courseSteps, finalQuestions, totalEstimatedMinutes } from './courseData.js';

const STORAGE_KEY = 'astar-apl-handledarutbildning-v1';
const CERTIFICATE_STEP = courseSteps.length + 1;
const START_STEP = -1;

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
            <img
              src="/astar-logo.jpg"
              alt="Astar"
              className="h-14 w-fit rounded bg-white object-contain sm:h-16"
            />
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
            Den här utbildningen hjälper handledare att ge elever en tydlig, trygg och
            lärorik APL-period. När alla arbetsplatser gör utbildningen får eleverna ett
            mer likvärdigt stöd, oavsett bransch, plats eller handledare.
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
                Upplägget är kort, konkret och byggt för vardagen: vad handledaren gör,
                säger och följer upp när eleven är på plats.
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

function FinalTest({ answers, onAnswer }) {
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
          {finalQuestions.map((question, questionIndex) => (
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

function ResultCard({ score, passed, name, setName, date, onRestart }) {
  const [isCreatingPdf, setIsCreatingPdf] = useState(false);
  const [pdfError, setPdfError] = useState('');

  async function handlePrintCertificate() {
    setPdfError('');
    setIsCreatingPdf(true);

    try {
      const { openCertificatePdf } = await import('./certificatePdf.js');
      await openCertificatePdf({
        name,
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
        <StepHeader section="Certifikat" title="APL-handledare – Astar">
          <Award className="h-5 w-5 text-astar-accent" aria-hidden="true" />
        </StepHeader>
        <p className="text-lg text-slate-800">
          Har genomfört Astar handledarutbildning enligt Skolverkets riktlinjer.
        </p>
        <div className="rounded-lg border border-blue-100 bg-gradient-to-br from-slate-50 to-white p-5">
          <label className="block text-sm font-bold uppercase tracking-wide text-astar-secondary" htmlFor="name">
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
        <div className="no-print flex flex-wrap gap-3">
          {passed && (
            <AppButton
              variant="secondary"
              onClick={handlePrintCertificate}
              disabled={isCreatingPdf}
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
  const [currentStep, setCurrentStep] = useState(savedState?.currentStep ?? START_STEP);
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
    setName('');
    setCertificateDate(getToday());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSkipToPassed() {
    setCurrentStep(CERTIFICATE_STEP);
    setFinalAnswers(finalQuestions.map((question) => question.correctIndex));
    setCertificateDate(getToday());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const currentCourseStep = currentStep >= 0 ? courseSteps[currentStep] : null;

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
