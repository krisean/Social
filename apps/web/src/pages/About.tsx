export default function About() {
  return (
    <section id="about" className="hiw page-single">
      <div className="container">
        <h2 className="section-title">About Pub Söcial</h2>
        <p className="section-sub">
          Pub Söcial helps pubs and bars turn a regular night out into a shared game night
          with live voting, leaderboards, and unforgettable comedy prompts.
        </p>

        <div className="hiw-grid">
          <article className="hiw-card">
            <p className="hiw-lead">Built for busy venues</p>
            <p className="step-body">
              We designed Pub Söcial with real-world pubs in mind. Owners and staff need
              something that is easy to start, simple to explain to guests, and reliable
              on a busy Friday night.
            </p>
          </article>

          <article className="hiw-card">
            <p className="hiw-lead">Why it works</p>
            <ul className="steps">
              <li className="step">
                <div className="step-text">
                  <div className="step-title">Everyone can join</div>
                  <p className="step-body">Players participate from their phones—no app downloads, no friction.</p>
                </div>
              </li>
              <li className="step">
                <div className="step-text">
                  <div className="step-title">The room stays engaged</div>
                  <p className="step-body">Rounds are quick, funny, and social, keeping patrons talking and ordering.</p>
                </div>
              </li>
              <li className="step">
                <div className="step-text">
                  <div className="step-title">You own the experience</div>
                  <p className="step-body">Hosts pick prompts, control pacing, and shape the tone of the night.</p>
                </div>
              </li>
            </ul>
          </article>
        </div>

        <div className="mascot-row" aria-hidden="true">
          <div className="mascot-avatar">
            <img src="/assets/mascots/caesar.png" alt="" />
          </div>
          <div className="mascot-avatar">
            <img src="/assets/mascots/stout.png" alt="" />
          </div>
          <div className="mascot-avatar">
            <img src="/assets/mascots/mimosa.png" alt="" />
          </div>
        </div>
      </div>
    </section>
  )
}
