'use client';

import { useCallback, useMemo, useState } from 'react';
import ScoreBar from '@/components/ScoreBar';
import { useVerbs } from '@/lib/useVerbs';
import { PRONOUNS, type Pronoun, type VerbEntry } from '@/lib/types';
import { sampleUnique, shuffle } from '@/lib/utils';

type CheckState =
  | { status: 'editing' }
  | {
      status: 'checked';
      isRoundCorrect: boolean;
      perPronounCorrect: Record<Pronoun, boolean>;
      meaningCorrect: boolean;
    };

function newRound(verbs: VerbEntry[]) {
  const verb = verbs[Math.floor(Math.random() * verbs.length)];
  const conjugations = shuffle(PRONOUNS.map((p) => verb.present[p]));

  const options = [
    verb.english,
    ...sampleUnique(
      verbs.map((v) => v.english),
      3,
      new Set([verb.english])
    )
  ];

  return {
    verb,
    conjugations,
    meaningOptions: shuffle(options)
  };
}

export default function EasyPage() {
  const verbsState = useVerbs();

  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);

  const [selectedPronoun, setSelectedPronoun] = useState<Pronoun | null>(null);
  const [assignments, setAssignments] = useState<Partial<Record<Pronoun, string>>>({});
  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(null);

  const [roundSeed, setRoundSeed] = useState(0);

  const round = useMemo(() => {
    if (verbsState.status !== 'ready') return null;
    return newRound(verbsState.verbs);
  }, [verbsState, roundSeed]);

  const [checkState, setCheckState] = useState<CheckState>({ status: 'editing' });

  const canCheck = useMemo(() => {
    if (!round) return false;
    return PRONOUNS.every((p) => Boolean(assignments[p])) && Boolean(selectedMeaning) && checkState.status === 'editing';
  }, [assignments, selectedMeaning, checkState.status, round]);

  const onResetScore = useCallback(() => {
    setCorrect(0);
    setTotal(0);
  }, []);

  const resetRoundUi = useCallback(() => {
    setSelectedPronoun(null);
    setAssignments({});
    setSelectedMeaning(null);
    setCheckState({ status);
    setCheckState({ status: 'editing' });
  }, []);

  const goNextRound = useCallback(() => {
    resetRoundUi();
    setRoundSeed((x) => x + 1);
  }, [resetRoundUi]);

  const handleAssign = useCallback(
    (conjugation: string) => {
      if (!round) return;
      if (!selectedPronoun) return;
      if (checkState.status !== 'editing') return;

      setAssignments((prev) => {
        const next = { ...prev };

        // If this conjugation was assigned elsewhere, clear it.
        for (const p of PRONOUNS) {
          if (next[p] === conjugation) delete next[p];
        }

        next[selectedPronoun] = conjugation;
        return next;
      });

      setSelectedPronoun(null);
    },
    [round, selectedPronoun, checkState.status]
  );

  const handleCheck = useCallback(() => {
    if (!round) return;
    if (!canCheck) return;

    const perPronounCorrect: Record<Pronoun, boolean> = {
      'io': assignments['io'] === round.verb.present['io'],
      'tu': assignments['tu'] === round.verb.present['tu'],
      'lui/lei': assignments['lui/lei'] === round.verb.present['lui/lei'],
      'noi': assignments['noi'] === round.verb.present['noi'],
      'voi': assignments['voi'] === round.verb.present['voi'],
      'loro': assignments['loro'] === round.verb.present['loro']
    };

    const meaningCorrect = selectedMeaning === round.verb.english;
    const isRoundCorrect = Object.values(perPronounCorrect).every(Boolean) && meaningCorrect;

    setTotal((t) => t + 1);
    if (isRoundCorrect) setCorrect((c) => c + 1);

    setCheckState({ status: 'checked', isRoundCorrect, perPronounCorrect, meaningCorrect });
  }, [assignments, selectedMeaning, round, canCheck]);

  if (verbsState.status === 'loading') {
    return (
      <main>
        <ScoreBar modeLabel="Easy" correct={correct} total={total} onReset={onResetScore} />
        <div className="card" style={{ padding: 18 }}>
          Loading verbs…
        </div>
      </main>
    );
  }

  if (verbsState.status === 'error') {
    return (
      <main>
        <ScoreBar modeLabel="Easy" correct={correct} total={total} onReset={onResetScore} />
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Couldn’t load verb data.</div>
          <div className="small">{verbsState.message}</div>
        </div>
      </main>
    );
  }

  if (!round) return null;

  return (
    <main>
      <ScoreBar modeLabel="Easy" correct={correct} total={total} onReset={onResetScore} />

      <div className="card" style={{ padding: 18 }}>
        <div className="row" style={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div className="small">Verb</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{round.verb.infinitive}</div>
          </div>
          <div className="pill">Present tense</div>
        </div>

        <div style={{ height: 14 }} />

        <div className="grid2">
          <div className="card" style={{ padding: 14, borderRadius: 14, background: 'rgba(23, 32, 70, 0.55)' }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>1) Pick a pronoun, then assign a conjugation</div>
            <div className="row">
              {PRONOUNS.map((p) => {
                const isSelected = selectedPronoun === p;
                const checked = checkState.status === 'checked';
                const correctness = checked ? checkState.perPronounCorrect[p] : null;

                return (
                  <button
                    key={p}
                    type="button"
                    className="btn"
                    onClick={() => {
                      if (checkState.status !== 'editing') return;
                      setSelectedPronoun((cur) => (cur === p ? null : p));
                    }}
                    style={{
                      borderColor: isSelected ? 'rgba(124, 156, 255, 0.75)' : undefined,
                      background: isSelected ? 'rgba(124, 156, 255, 0.12)' : undefined
                    }}
                  >
                    <span style={{ fontWeight: 800 }}>{p}</span>
                    {checked && (
                      <span className={correctness ? 'badgeOk' : 'badgeBad'} style={{ marginLeft: 8 }}>
                        {correctness ? '✓' : '✕'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ height: 10 }} />

            <div className="small" style={{ marginBottom: 8 }}>
              Assignments
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {PRONOUNS.map((p) => {
                const value = assignments[p];
                const checked = checkState.status === 'checked';
                const correctness = checked ? checkState.perPronounCorrect[p] : null;

                return (
                  <div
                    key={p}
                    className="card"
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      background: 'rgba(18, 26, 51, 0.65)',
                      borderColor:
                        checked && correctness != null
                          ? correctness
                            ? 'rgba(45, 212, 191, 0.55)'
                            : 'rgba(251, 113, 133, 0.55)'
                          : 'var(--border)'
                    }}
                  >
                    <div className="small" style={{ marginBottom: 2 }}>
                      {p}
                    </div>
                    <div style={{ fontWeight: 800 }}>{value ?? '—'}</div>
                    {checked && !correctness && (
                      <div className="small" style={{ marginTop: 4 }}>
                        Correct: <span style={{ color: 'var(--text)', fontWeight: 700 }}>{round.verb.present[p]}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ padding: 14, borderRadius: 14, background: 'rgba(23, 32, 70, 0.55)' }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Conjugations</div>
            <div className="row">
              {round.conjugations.map((c) => {
                const disabled = checkState.status !== 'editing';
                const isUsed = PRONOUNS.some((p) => assignments[p] === c);

                return (
                  <button
                    key={c}
                    type="button"
                    className="btn"
                    disabled={disabled}
                    onClick={() => handleAssign(c)}
                    style={{
                      opacity: disabled ? 0.85 : 1,
                      borderColor: isUsed ? 'rgba(124, 156, 255, 0.55)' : undefined
                    }}
                    title={isUsed ? 'Currently assigned' : 'Click to assign'}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            <div style={{ height: 12 }} />

            <div style={{ fontWeight: 800, marginBottom: 8 }}>2) Choose the English meaning</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {round.meaningOptions.map((m) => {
                const checked = checkState.status === 'checked';
                const isSelected = selectedMeaning === m;
                const isCorrect = m === round.verb.english;

                let borderColor: string | undefined;
                if (checked) {
                  if (isCorrect) borderColor = 'rgba(45, 212, 191, 0.55)';
                  else if (isSelected && !isCorrect) borderColor = 'rgba(251, 113, 133, 0.55)';
                } else if (isSelected) {
                  borderColor = 'rgba(124, 156, 255, 0.75)';
                }

                return (
                  <button
                    key={m}
                    type="button"
                    className="btn"
                    disabled={checked}
                    onClick={() => {
                      if (checkState.status !== 'editing') return;
                      setSelectedMeaning(m);
                    }}
                    style={{
                      textAlign: 'left',
                      justifyContent: 'space-between',
                      display: 'flex',
                      borderColor
                    }}
                  >
                    {m}
                    {checked && isCorrect && <span className="badgeOk">✓</span>}
                    {checked && isSelected && !isCorrect && <span className="badgeBad">✕</span>}
                  </button>
                );
              })}
            </div>

            <div style={{ height: 14 }} />

            {checkState.status === 'editing' ? (
              <button className="btn btnPrimary" type="button" disabled={!canCheck} onClick={handleCheck}>
                Check round
              </button>
            ) : (
              <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 800 }} className={checkState.isRoundCorrect ? 'badgeOk' : 'badgeBad'}>
                  {checkState.isRoundCorrect ? 'Round correct' : 'Round incorrect'}
                </div>
                <button className="btn btnPrimary" type="button" onClick={goNextRound}>
                  Next round
                </button>
              </div>
            )}

            <div className="small" style={{ marginTop: 10 }}>
              Tip: You can reassign by choosing a pronoun again and clicking a different conjugation.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
