export default function Contact() {
  return (
    <section id="contact" className="why page-single">
      <div className="container">
        <h2 className="section-title">Contact</h2>
        <p className="section-sub">
          Have questions or want to bring Pub Söcial to your venue? Reach out and we'll get in touch.
        </p>

        <div className="features-grid">
          <article className="feature-card">
            <h3 className="feature-title">Venue inquiries</h3>
            <p className="feature-desc">
              Tell us about your bar, typical crowd size, and preferred game nights.
              We'll help you decide how Pub Söcial can fit your schedule and goals.
            </p>
          </article>

          <article className="feature-card">
            <h3 className="feature-title">Support & questions</h3>
            <p className="feature-desc">
              Already running games and need help or feedback? Share what's working,
              what's not, and we'll work with you to keep nights smooth and fun.
            </p>
          </article>
        </div>

        <div className="mascot-row" aria-hidden="true">
          <div className="mascot-avatar">
            <img src="/assets/mascots/jager.png" alt="" />
          </div>
        </div>
      </div>
    </section>
  )
}
