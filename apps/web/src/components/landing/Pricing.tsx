type Feature = { text: string }

const Check = ({ className = '' }: { className?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="currentColor" d="M20.285 6.709a1 1 0 0 1 0 1.414l-9.193 9.193a1 1 0 0 1-1.414 0L3.715 11.35a1 1 0 1 1 1.414-1.414l5.07 5.07 8.486-8.486a1 1 0 0 1 1.414 0z"/>
  </svg>
)

const venuesFeatures: Feature[] = [
  { text: 'Up to 15 teams per night' },
  { text: 'Core BarScores game library' },
  { text: 'Automatic scoring & live leaderboard' },
  { text: 'Email support' },
]

const proFeatures: Feature[] = [
  { text: 'Up to 50 teams per night' },
  { text: 'Full BarScores game library' },
  { text: 'Leaderboard control & scheduled resets' },
  { text: 'Custom branding & prompts' },
  { text: 'Basic analytics dashboard' },
  { text: 'Priority support' },
]

const enterpriseFeatures: Feature[] = [
  { text: 'Unlimited teams' },
  { text: 'Multi-venue management & reporting' },
  { text: 'Advanced analytics & ROI tracking' },
  { text: 'Dedicated account management' },
  { text: 'Custom integrations & API access' },
  { text: 'Early access to new game formats' },
]

export default function Pricing() {
  return (
    <section id="pricing" className="pricing">
      <div className="container">
        <h2 className="section-title">Simple, Transparent Pricing</h2>
        <p className="section-sub">Flexible plans built for every type of venue.</p>

        <div className="mascot-row" aria-hidden="true">
          <div className="mascot-avatar">
            <img src="/assets/mascots/whiskey.png" alt="" />
          </div>
          <div className="mascot-avatar">
            <img src="/assets/mascots/martini.png" alt="" />
          </div>
        </div>

        <div className="price-grid">
          {/* Venues - $99 */}
          <article className="price-card">
            <header className="price-head">
              <h3 className="price-role">Venues</h3>
              <div className="price-row">
                <span className="price-amount">$99</span>
                <span className="price-per">/month</span>
              </div>
              <p className="price-tagline">
                Perfect for small to medium bars getting started
              </p>
            </header>

            <ul className="price-features">
              {venuesFeatures.map((f) => (
                <li key={f.text} className="feat">
                  <Check className="feat-icon green" />
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>

            <a className="btn btn-primary price-cta" href="/contact">Start Free Trial</a>
            <p className="trial-note">14-day free trial • No credit card required</p>
          </article>

          {/* Pro - $249 (Popular) */}
          <article className="price-card popular">
            <div className="popular-pill" aria-hidden="true">Popular</div>

            <header className="price-head">
              <h3 className="price-role">Pro</h3>
              <div className="price-row">
                <span className="price-amount">$249</span>
                <span className="price-per">/month</span>
              </div>
              <p className="price-tagline">
                Custom branding and analytics for growing venues
              </p>
            </header>

            <ul className="price-features">
              {proFeatures.map((f) => (
                <li key={f.text} className="feat">
                  <Check className="feat-icon orange" />
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>

            <a className="btn btn-primary price-cta" href="/contact">Start Free Trial</a>
            <p className="trial-note">14-day free trial • No credit card required</p>
          </article>

          {/* Enterprise - $549 */}
          <article className="price-card">
            <header className="price-head">
              <h3 className="price-role">Enterprise</h3>
              <div className="price-row">
                <span className="price-amount">$549</span>
                <span className="price-per">/month</span>
              </div>
              <p className="price-tagline">
                Full control and advanced features for large chains
              </p>
            </header>

            <ul className="price-features">
              {enterpriseFeatures.map((f) => (
                <li key={f.text} className="feat">
                  <Check className="feat-icon orange" />
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>

            <a className="btn btn-primary price-cta" href="/contact">Contact Sales</a>
            <p className="trial-note">Custom enterprise solutions available</p>
          </article>
        </div>
      </div>
    </section>
  )
}
