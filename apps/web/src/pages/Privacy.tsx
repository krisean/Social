export default function Privacy() {
  return (
    <section id="privacy" className="pricing page-single">
      <div className="container">
        <h2 className="section-title">Privacy Policy</h2>
        <p className="section-sub">
          We collect only the data needed to run games and leaderboards, and we never sell
          your personal information.
        </p>
        <div className="mascot-row" aria-hidden="true">
          <div className="mascot-avatar">
            <img src="/assets/mascots/wine.png" alt="" />
          </div>
        </div>

        <div className="price-grid">
          <article className="price-card">
            <header className="price-head">
              <h3 className="price-role">What we collect</h3>
              <p className="price-tagline">
                Limited account and gameplay data to keep your experience running.
              </p>
            </header>
            <ul className="price-features">
              <li className="feat"><span>Basic account details (like email or display name).</span></li>
              <li className="feat"><span>Gameplay activity (like scores and participation).</span></li>
              <li className="feat"><span>Technical logs to keep the service reliable and secure.</span></li>
            </ul>
          </article>

          <article className="price-card">
            <header className="price-head">
              <h3 className="price-role">How we use it</h3>
              <p className="price-tagline">
                To run games, improve the product, and support venues and players.
              </p>
            </header>
            <ul className="price-features">
              <li className="feat"><span>We don't sell personal data to third parties.</span></li>
              <li className="feat"><span>We use aggregated stats to understand usage patterns.</span></li>
              <li className="feat"><span>You can request deletion of your account data at any time.</span></li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  )
}
