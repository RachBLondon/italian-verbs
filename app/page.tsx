import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="card">
      <div className="header">
        <h1 className="title">Italian Irregular Verbs</h1>
        <p className="subtitle">
          Practice 20 common Italian irregular verbs in the present tense (io, tu, lui/lei, noi, voi, loro).
          Choose a mode to start. Your score is session-only and resets on refresh.
        </p>
      </div>

      <div style={{ padding: 22, paddingTop: 0 }}>
        <div className="grid2">
          <div className="card" style={{ padding: 18, borderRadius: 14 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Easy</h2>
            <p className="small" style={{ marginTop: 8 }}>
              Match all 6 pronouns to the correct conjugations, then pick the correct English meaning.
              A round is only correct if everything is right.
            </p>
            <Link className="btn btnPrimary" href="/easy" style={{ display: 'inline-block', marginTop: 10 }}>
              Start Easy
            </Link>
          </div>

          <div className="card" style={{ padding: 18, borderRadius: 14 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Hard</h2>
            <p className="small" style={{ marginTop: 8 }}>
              You’ll see an English meaning + a pronoun. Type the correct conjugated form and submit.
              Use <span className="kbd">Enter</span> to submit.
            </p>
            <Link className="btn btnPrimary" href="/hard" style={{ display: 'inline-block', marginTop: 10 }}>
              Start Hard
            </Link>
          </div>
        </div>

        <p className="small" style={{ marginTop: 14 }}>
          Verb data loads from a local JSON file. If it fails to load, you’ll see an error message in the mode view.
        </p>
      </div>
    </main>
  );
}
