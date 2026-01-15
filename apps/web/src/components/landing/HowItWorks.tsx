const PhoneIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 2v16h10V4H7Zm5 14a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z"/>
  </svg>
)

const BarsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M4 21a1 1 0 0 1-1-1V9a1 1 0 1 1 2 0v11a1 1 0 0 1-1 1Zm8 0a1 1 0 0 1-1-1V4a1 1 0 1 1 2 0v16a1 1 0 0 1-1 1Zm8 0a1 1 0 0 1-1-1V12a1 1 0 1 1 2 0v8a1 1 0 0 1-1 1Z"/>
  </svg>
)

type Step = { title: string; body: string; n: number }

const playersSteps: Step[] = [
  {
    n: 1,
    title: 'Scan QR Code',
    body:
      'See the code at your table? Scan and join instantly—no app download needed.',
  },
  {
    n: 2,
    title: 'Submit Responses',
    body:
      'Read the prompt and type your funniest answer. Be creative!',
  },
  {
    n: 3,
    title: 'Vote & Win',
    body:
      "Vote on others' responses and watch yourself climb the leaderboard.",
  },
]

const ownersSteps: Step[] = [
  { n: 1, title: 'Quick Setup',
    body: 'Create your venue profile in under 5 minutes. Customize prompts and branding.' },
  { n: 2, title: 'Display QR Codes',
    body: 'Print QR codes for tables or display on screens. That\'s it!' },
  { n: 3, title: 'Watch Engagement Soar',
    body: 'Reset leaderboards anytime. Track participation and keep customers longer.' },
]

export default function HowItWorks() {
  return (
    <section id="how" className="hiw">
      <div className="container">
        <h2 className="section-title">How It Works</h2>
        <p className="section-sub">Simple, social, and hilarious. Get started in minutes.</p>

        <div className="hiw-grid">
          {/* Owners card */}
          <article className="hiw-card">
            <header className="hiw-card-head">
              <span className="icon-chip icon-orange"><BarsIcon/></span>
              <h3>For Bar Owners</h3>
            </header>
            <p className="hiw-lead">Boost engagement effortlessly</p>

            <ul className="steps">
              {ownersSteps.map(s => (
                <li className="step" key={s.n}>
                  <span className="num num-green">{s.n}</span>
                  <div className="step-text">
                    <div className="step-title">{s.title}</div>
                    <p className="step-body">{s.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          {/* Players card */}
          <article className="hiw-card">
            <header className="hiw-card-head">
              <span className="icon-chip icon-green"><PhoneIcon/></span>
              <h3>For Players</h3>
            </header>
            <p className="hiw-lead">Join the fun in 3 easy steps</p>

            <ul className="steps">
              {playersSteps.map(s => (
                <li className="step" key={s.n}>
                  <span className="num num-orange">{s.n}</span>
                  <div className="step-text">
                    <div className="step-title">{s.title}</div>
                    <p className="step-body">{s.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  )
}
