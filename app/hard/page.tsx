'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ScoreBar from '@/components/ScoreBar';
import { useVerbs } from '@/lib/useVerbs';
import { PRONOUNS, type Pronoun, type VerbEntry } from '@/lib/types';
import { normalizeAnswer } from '@/lib/utils';

type Question = {
  verb: VerbEntry;
  pronoun: Pronoun;
};

type ResultState =
  | { status: 'typing' }
  | { status: 'answered'; isCorrect: boolean; correctAnswer: string };

function newQuestion(verbs: VerbEntry[]): Question {
  const verb = verbs[Math.floor(Math.random() * verbs.length)];
  const pronoun = PRONOUNS[Math.floor(Math.random() * PRONOUNS.length)];
  return { verb, pronoun };
}

export default function HardPage() {
  const verbsState = useVerbs();

  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);

  const [seed, setSeed] = useState(0);
  const [value, setValue] = useState('');
  const [result, setResult] = useState<ResultState>({ status: 'typing' });

  const inputRef = useRef<HTMLInputElement | null>(null);

  const question = useMemo(() => {
    if (verbsState.status !== 'ready') return null;
    return newQuestion(verbsState.verbs);
  }, [verbsState, seed]);

  const onResetScore = useCallback(() => {
    setCorrect(0);
    setTotal(0);
  }, []);

  const goNext = useCallback(() => {
    setValue('');
    setResult({ status: 'typing' });
    setSeed((s) => s + 1);
  }, []);

  useEffect(() => {
    if (result.status === 'typing') inputRef.current?.focus();
  }, [result.status, seed]);

  const correctAnswer = useMemo(() => {
    if (!question) return '';
    return question.verb.present[question.pronoun];
  }, [question]);

  const handleSubmit = useCallback(() => {
    if (!question) return;
    if (result.status !== 'typing') return;

    const isCorrect = normalizeAnswer(value) === normalizeAnswer(correctAnswer);

    setTotal((t) => t + 1);
    if (isCorrect) setCorrect((c) => c + 1);

    setResult({ status: 'answered', isCorrect, correctAnswer });
  }, [question, result.status, value, correctAnswer]);

  if (verbsState.status === 'loading') {
    return (
      <main>
        <ScoreBar modeLabel="Hard" correct={correct} total={total} onReset={onResetScore} />
        <div className="card" style={{ padding: 18 }}>
          Loading verbs…
        </div>
      </main>
    );
  }

  if (verbsState.status === 'error') {
    return (
      <main>
        <ScoreBar modeLabel="Hard" correct={correct} total={total} onReset={onResetScore} />
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Couldn’t load verb data.</div>
          <div className="small">{verbsState.message}</div>
        </div>
      </main>
    );
  }

  if (!question) return null;

  return (
    <main>
      <ScoreBar modeLabel="Hard" correct={correct} total={total} onReset={onResetScore} />

      <div className="card" style={{ padding: 18 }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div className="small">English meaning</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{question.verb.english}</div>
          </div>
          <div className="pill">Pronoun: {question.pronoun}</div>
        </div>

        <div style={{ height: 14 }} />

        <div className="card" style={{ padding: 14, borderRadius: 14, background: 'var(--color-surface2)' }}>
          <div className="small" style={{ marginBottom: 8 }}>
            Type the present tense form.
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="row" style={{ alignItems: 'center' }}>
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={result.status !== 'typing'}
                aria-label="Answer"
                style={{
                  flex: '1 1 260px',
                  minWidth: 220,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-fg)',
                  fontWeight: 700
                }}
                placeholder="e.g. vado"
              />
              <button className="btn btnPrimary" type="submit" disabled={result.status !== 'typing'}>
                Submit
              </button>
            </div>
          </form>

          <div style={{ height: 12 }} />

          {result.status === 'typing' ? (
            <div className="small">
              Press <span className="kbd">Enter</span> to submit.
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 900 }} className={result.isCorrect ? 'badgeOk' : 'badgeBad'}>
                {result.isCorrect ? 'Correct' : 'Incorrect'}
              </div>
              {!result.isCorrect && (
                <div className="small" style={{ marginTop: 6 }}>
                  Correct answer:{' '}
                  <span style={{ color: 'var(--color-fg)', fontWeight: 800 }}>{result.correctAnswer}</span>
                </div>
              )}
              <div style={{ height: 10 }} />
              <button className="btn btnPrimary" type="button" onClick={goNext}>
                Next
              </button>
            </div>
          )}
        </div>

        <div className="small" style={{ marginTop: 12 }}>
          Note: the infinitive is hidden in Hard mode by design.
        </div>
      </div>
    </main>
  );
}
