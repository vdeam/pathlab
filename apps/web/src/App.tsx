export function App() {
  return (
    <>
      <header className="header">
        <div className="header__inner">
          <span className="brand">
            <span className="brand__mark" aria-hidden="true" />
            Pathlab
          </span>
        </div>
      </header>

      <main className="page">
        <section className="hero">
          <div>
            <h1>Find the way.</h1>
            <p>Draw a map, pick an algorithm, and watch exactly how it searches.</p>
          </div>
        </section>

        <div className="workspace">
          <aside className="panel" />
          <section className="stage">
            <div className="card card--stage" />
          </section>
        </div>
      </main>
    </>
  );
}
