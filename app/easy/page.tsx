'use client';

import { useCallback, useEffect, useMemo, useState, type DragEvent } from 'react';
import ConfettiOverlay from '@/components/ConfettiOverlay';
import ScoreBar from '@/components/ScoreBar';
import { useVerbs } from '@/lib/useVerbs';
import { PRONOUNS, type Pronoun, type VerbEntry } from '@/lib/types';
import { sampleUnique, shuffle } from '@/lib/utils';

type TapSelection = { tileId: string; fromPronoun?: Pronoun };

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
  const conjugations = shuffle(PRONOUNS.map((p) => ({ id: p, value: verb.present[p] })));

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

type Round = ReturnType<typeof newRound>;

export default function EasyPage() {
  const verbsState = useVerbs();

  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);

  const [assignments, setAssignments] = useState<Partial<Record<Pronoun, string>>>({});
  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(null);

  const [roundSeed, setRoundSeed] = useState(0);

  const isTapMode = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  }, []);

  const [tapSelection, setTapSelection] = useState<TapSelection | null>(null);

  const round = useMemo(() => {
    if (verbsState.status !== 'ready') return null;
    return newRound(verbsState.verbs);
  }, [verbsState, roundSeed]);

  const [checkState, setCheckState] = useState<CheckState>({ status: 'editing' });
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (checkState.status === 'checked' && checkState.isRoundCorrect) {
      setCelebrate(true);
      const t = window.setTimeout(() => setCelebrate(false), 10);
      return () => window.clearTimeout(t);
    }
  }, [checkState]);

  const canCheck = useMemo(() => {
    if (!round) return false;
    return PRONOUNS.every((p) => Boolean(assignments[p])) && Boolean(selectedMeaning) && checkState.status === 'editing';
  }, [assignments, selectedMeaning, checkState.status, round]);

  const onResetScore = useCallback(() => {
    setCorrect(0);
    setTotal(0);
  }, []);

  const resetRoundUi = useCallback(() => {
    setAssignments({});
    setSelectedMeaning(null);
    setTapSelection(null);
    setCheckState({ status: 'editing' });
  }, []);

  const goNextRound = useCallback(() => {
    resetRoundUi();
    setRoundSeed((x) => x + 1);
  }, [resetRoundUi]);

  const conjugationById = useMemo(() => {
    if (!round) return new Map<string, string>();
    return new Map(round.conjugations.map((t) => [t.id, t.value]));
  }, [round]);

  const availableConjugations = useMemo<Round['conjugations']>(() => {
    if (!round) return [];
    const used = new Set(Object.values(assignments).filter(Boolean) as string[]);
    return round.conjugations.filter((t) => !used.has(t.id));
  }, [round, assignments]);

  const setDragPayload = useCallback((e: DragEvent, payload: { tileId: string; fromPronoun?: Pronoun }) => {
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';

    // Hide the default drag preview/ghost image.
    // Using a canvas avoids "loading" cursor/preview glitches some browsers show with Image().
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    e.dataTransfer.setDragImage(canvas, 0, 0);
  }, []);

  const readDragPayload = useCallback((e: DragEvent) => {
    const raw = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as { tileId: string; fromPronoun?: Pronoun };
    } catch {
      return null;
    }
  }, []);

  const assignTileToPronoun = useCallback(
    (pronoun: Pronoun, payload: TapSelection) => {
      const { tileId, fromPronoun } = payload;

      setAssignments((prev) => {
        const next: Partial<Record<Pronoun, string>> = { ...prev };

        if (fromPronoun) delete next[fromPronoun];

        // If this tile was assigned elsewhere, clear it.
        for (const p of PRONOUNS) {
          if (next[p] === tileId) delete next[p];
        }

        next[pronoun] = tileId;
        return next;
      });
    },
    []
  );

  const unassignTileToPool = useCallback((payload: TapSelection) => {
    const { fromPronoun, tileId } = payload;
    if (!fromPronoun) return;

    setAssignments((prev) => {
      const next = { ...prev };
      if (next[fromPronoun] === tileId) delete next[fromPronoun];
      return next;
    });
  }, []);

  const handleDropOnPronoun = useCallback(
    (pronoun: Pronoun, e: DragEvent) => {
      if (checkState.status !== 'editing') return;
      const payload = readDragPayload(e);
      if (!payload) return;
      assignTileToPronoun(pronoun, payload);
    },
    [checkState.status, readDragPayload, assignTileToPronoun]
  );

  const handleDropOnPool = useCallback(
    (e: DragEvent) => {
      if (checkState.status !== 'editing') return;
      const payload = readDragPayload(e);
      if (!payload) return;
      unassignTileToPool(payload);
    },
    [checkState.status, readDragPayload, unassignTileToPool]
  );

  const handleCheck = useCallback(() => {
    if (!round) return;
    if (!canCheck) return;

    const perPronounCorrect: Record<Pronoun, boolean> = {
      'io': conjugationById.get(assignments['io'] ?? '') === round.verb.present['io'],
      'tu': conjugationById.get(assignments['tu'] ?? '') === round.verb.present['tu'],
      'lui/lei': conjugationById.get(assignments['lui/lei'] ?? '') === round.verb.present['lui/lei'],
      'noi': conjugationById.get(assignments['noi'] ?? '') === round.verb.present['noi'],
      'voi': conjugationById.get(assignments['voi'] ?? '') === round.verb.present['voi'],
      'loro': conjugationById.get(assignments['loro'] ?? '') === round.verb.present['loro']
    };

    const meaningCorrect = selectedMeaning === round.verb.english;
    const isRoundCorrect = Object.values(perPronounCorrect).every(Boolean) && meaningCorrect;

    setTotal((t) => t + 1);
    if (isRoundCorrect) setCorrect((c) => c + 1);

    setCheckState({ status: 'checked', isRoundCorrect, perPronounCorrect, meaningCorrect });
  }, [assignments, selectedMeaning, round, canCheck, conjugationById]);

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
      <ConfettiOverlay active={celebrate} />
      <ScoreBar modeLabel="Easy" correct={correct} total={total} onReset={onResetScore} />

      <div className="card cardFrame" style={{ padding: 18 }}>
        <div className="row" style={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div className="small">Verb</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{round.verb.infinitive}</div>
          </div>
          <div className="pill">Present tense</div>
        </div>

        <div style={{ height: 14 }} />

        <div className="grid2">
          <div className="card" style={{ padding: 14, borderRadius: 14, background: 'var(--color-panel)' }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>
              1) {isTapMode ? 'Tap a conjugation, then tap the correct pronoun' : 'Drag each conjugation onto the correct pronoun'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ display: 'grid', gap: 10 }}>
                {PRONOUNS.map((p) => {
                  const tileId = assignments[p];
                  const value = tileId ? conjugationById.get(tileId) : undefined;
                  const checked = checkState.status === 'checked';
                  const correctness = checked ? checkState.perPronounCorrect[p] : null;
                  const disabled = checkState.status !== 'editing';

                  const isSelected = Boolean(
                    isTapMode && tileId && tapSelection?.tileId === tileId && tapSelection?.fromPronoun === p
                  );
                  const showTapTarget = isTapMode && !disabled && Boolean(tapSelection) && checkState.status === 'editing';

                  return (
                    <div
                      key={p}
                      className="card"
                      onClick={() => {
                        if (!isTapMode) return;
                        if (disabled) return;
                        if (!tapSelection) return;
                        assignTileToPronoun(p, tapSelection);
                        setTapSelection(null);
                      }}
                      onDragOver={(e) => {
                        if (disabled || isTapMode) return;
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        if (disabled || isTapMode) return;
                        e.preventDefault();
                        handleDropOnPronoun(p, e);
                      }}
                      style={{
                        padding: 10,
                        borderRadius: 12,
                        background: 'var(--color-surface)',
                        borderColor:
                          checked && correctness != null
                            ? correctness
                              ? 'var(--color-success)'
                              : 'var(--color-danger)'
                            : isSelected
                              ? 'var(--color-accent)'
                              : showTapTarget
                                ? 'var(--color-border-strong)'
                                : 'var(--color-border)'
                      }}
                    >
                      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div style={{ fontWeight: 800 }}>{p}</div>
                        {checked && (
                          <span className={correctness ? 'badgeOk' : 'badgeBad'} style={{ fontWeight: 800 }}>
                            {correctness ? '✓' : '✕'}
                          </span>
                        )}
                      </div>

                      <div style={{ height: 6 }} />

                      {tileId && value ? (
                        <button
                          type="button"
                          className="btn"
                          draggable={!disabled && !isTapMode}
                          onDragStart={(e) => {
                            if (isTapMode) return;
                            setDragPayload(e, { tileId, fromPronoun: p });
                          }}
                          onClick={(e) => {
                            if (!isTapMode) return;
                            if (disabled) return;
                            e.stopPropagation();
                            setTapSelection((prev) => {
                              if (prev && prev.tileId === tileId && prev.fromPronoun === p) return null;
                              return { tileId, fromPronoun: p };
                            });
                          }}
                          aria-pressed={isTapMode ? isSelected : undefined}
                          style={{ width: '100%', justifyContent: 'center' }}
                          title={
                            disabled
                              ? undefined
                              : isTapMode
                                ? 'Tap to select, then tap another pronoun to move'
                                : 'Drag to another pronoun (or back to the pool)'
                          }
                        >
                          {value}
                        </button>
                      ) : (
                        <div
                          className="small"
                          style={{
                            padding: '10px 12px',
                            border: '1px dashed var(--color-border-strong)',
                            borderRadius: 12,
                            color: 'var(--color-fg-muted)'
                          }}
                        >
                          {isTapMode ? 'Tap to place' : 'Drop here'}
                        </div>
                      )}

                      {checked && !correctness && (
                        <div className="small" style={{ marginTop: 6 }}>
                          Correct:{' '}
                          <span style={{ color: 'var(--color-fg)', fontWeight: 700 }}>{round.verb.present[p]}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div>
                <div className="small" style={{ marginBottom: 8 }}>
                  Conjugations ({isTapMode ? 'tap to select' : 'drag from here'})
                </div>

                <div
                  className="card"
                  onClick={() => {
                    if (!isTapMode) return;
                    if (checkState.status !== 'editing') return;
                    if (!tapSelection) return;

                    if (tapSelection.fromPronoun) {
                      unassignTileToPool(tapSelection);
                    }
                    setTapSelection(null);
                  }}
                  onDragOver={(e) => {
                    if (isTapMode) return;
                    if (checkState.status !== 'editing') return;
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    if (isTapMode) return;
                    if (checkState.status !== 'editing') return;
                    e.preventDefault();
                    handleDropOnPool(e);
                  }}
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    background: 'var(--color-surface)',
                    borderColor:
                      isTapMode && tapSelection
                        ? tapSelection.fromPronoun
                          ? 'var(--color-border-strong)'
                          : 'var(--color-accent)'
                        : undefined
                  }}
                >
                  <div className="row">
                    {availableConjugations.map((t) => {
                      const isSelected = isTapMode && tapSelection?.tileId === t.id && !tapSelection.fromPronoun;

                      return (
                        <button
                          key={t.id}
                          type="button"
                          className="btn"
                          draggable={checkState.status === 'editing' && !isTapMode}
                          onDragStart={(e) => {
                            if (isTapMode) return;
                            setDragPayload(e, { tileId: t.id });
                          }}
                          onClick={() => {
                            if (!isTapMode) return;
                            if (checkState.status !== 'editing') return;
                            setTapSelection((prev) => {
                              if (prev && prev.tileId === t.id && !prev.fromPronoun) return null;
                              return { tileId: t.id };
                            });
                          }}
                          aria-pressed={isTapMode ? isSelected : undefined}
                          style={{
                            cursor: checkState.status === 'editing' && !isTapMode ? 'grab' : undefined,
                            borderColor: isSelected ? 'var(--color-accent)' : undefined
                          }}
                        >
                          {t.value}
                        </button>
                      );
                    })}
                    {availableConjugations.length === 0 && (
                      <div className="small" style={{ padding: '6px 2px' }}>
                        All assigned
                      </div>
                    )}
                  </div>
                </div>

                <div className="small" style={{ marginTop: 8 }}>
                  Tip: {isTapMode ? 'Tap an assigned conjugation to select it, then tap here to unassign (or tap another pronoun to move it).' : 'Drag an assigned conjugation back here to unassign it.'}
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 14, borderRadius: 14, background: 'var(--color-panel)' }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>2) Choose the English meaning</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {round.meaningOptions.map((m) => {
                const checked = checkState.status === 'checked';
                const isSelected = selectedMeaning === m;
                const isCorrect = m === round.verb.english;

                let borderColor: string | undefined;
                if (checked) {
                  if (isCorrect) borderColor = 'var(--color-success)';
                  else if (isSelected && !isCorrect) borderColor = 'var(--color-danger)';
                } else if (isSelected) {
                  borderColor = 'var(--color-accent)';
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
              Tip: {isTapMode ? 'You can reassign by selecting a conjugation, then tapping a different pronoun.' : 'You can reassign by dragging a conjugation onto a different pronoun.'}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
