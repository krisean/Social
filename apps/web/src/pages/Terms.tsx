export default function Terms() {
  return (
    <section id="terms" className="pricing page-single">
      <div className="container">
        <h2 className="section-title">Terms of Service</h2>
        <p className="section-sub">
          By using Pub Söcial, venues and players agree to play fair, respect local laws,
          and keep the jokes fun for everyone.
        </p>

        <div className="price-grid">
          <article className="price-card">
            <header className="price-head">
              <h3 className="price-role">For venues</h3>
              <p className="price-tagline">
                You host the games and are responsible for the in-venue experience.
              </p>
            </header>
            <ul className="price-features">
              <li className="feat"><span>Comply with local laws, age restrictions, and licensing rules.</span></li>
              <li className="feat"><span>Use Pub Söcial as an entertainment layer, not for harassment or exclusion.</span></li>
              <li className="feat"><span>Let players know how long games will run and how winners are decided.</span></li>
            </ul>
          </article>

          <article className="price-card">
            <header className="price-head">
              <h3 className="price-role">For players</h3>
              <p className="price-tagline">
                Pub Söcial is meant to be social, friendly, and inclusive.
              </p>
            </header>
            <ul className="price-features">
              <li className="feat"><span>Keep jokes within the bounds of the venue's guidelines.</span></li>
              <li className="feat"><span>Don't attempt to disrupt games, cheat, or abuse other players.</span></li>
              <li className="feat"><span>Understand that the host can remove players who break the rules.</span></li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  )
}
