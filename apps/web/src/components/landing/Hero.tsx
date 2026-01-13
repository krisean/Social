export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-grid">
        <div className="hero-copy">
          <h1 id="hero-title" className="headline">
            <span>Turn Your Pub Into a</span>
            <br />
            <span className="highlight">Community Hub</span>
          </h1>

          <p className="sub">
            Pub Söcial transforms any bar into an interactive comedy game.
            Patrons compete with witty responses, vote for favorites, and climb
            the leaderboard - all from their phones.
          </p>

          <div className="cta-row">
            <a className="btn btn-primary" href="https://event.playnow.social">View the Demo</a>
          </div>
        </div>

        <div className="visual">
          {/* GameFlowCarousel removed */}
        </div>
      </div>
    </section>
  )
}
