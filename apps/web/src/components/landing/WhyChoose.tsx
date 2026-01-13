import React from 'react'

type Feature = {
  title: string
  desc: string
  chipClass: string
  icon: React.ReactNode
}

const UsersIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2a5 5 0 0 0-5 5 1 1 0 0 0 1 1h8a1 1 0 0 0 1-1 5 5 0 0 0-5-5Zm8 0a5.006 5.006 0 0 0-4.9 4h9.8A5.006 5.006 0 0 0 16 13Z"/>
  </svg>
)

const MonitorStar = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-6v2h3a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2h3v-2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm8.01 2.99-.9 1.83-2.02.29a.75.75 0 0 0-.41 1.28l1.46 1.42-.35 2a.75.75 0 0 0 1.09.79L12 13.6l1.82.96a.75.75 0 0 0 1.09-.79l-.35-2 1.46-1.42a.75.75 0 0 0-.41-1.28l-2.02-.29-.9-1.83a.75.75 0 0 0-1.35 0Z"/>
  </svg>
)

const GroupIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M12 12a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 12 12Zm5.5-1a2.5 2.5 0 1 0-2.5-2.5A2.5 2.5 0 0 0 17.5 11Zm-11 0A2.5 2.5 0 1 0 4 8.5 2.5 2.5 0 0 0 6.5 11ZM12 14c-3.86 0-7 2.14-7 4.77A1.23 1.23 0 0 0 6.23 20h11.54A1.23 1.23 0 0 0 19 18.77C19 16.14 15.86 14 12 14Zm8.5 0a4.86 4.86 0 0 0-1.57.26 6.2 6.2 0 0 1 2.07 4.25A1.23 1.23 0 0 1 19.77 20h1A1.23 1.23 0 0 0 22 18.77C22 16.94 20.45 14 20.5 14Zm-17 0C3.55 14 2 16.94 2 18.77A1.23 1.23 0 0 0 3.23 20h1A1.23 1.23 0 0 1 3 18.51a6.2 6.2 0 0 1 2.07-4.25A4.86 4.86 0 0 0 3.5 14Z"/>
  </svg>
)

const PersonIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.87 0-7 2.13-7 4.76A1.24 1.24 0 0 0 6.24 20h11.52A1.24 1.24 0 0 0 19 18.76C19 16.13 15.87 14 12 14Z"/>
  </svg>
)

const BoltIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M14 2 4 13h6l-2 9 10-11h-6l2-9Z"/>
  </svg>
)

const TrophyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M18 2h-2V1a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v1H6a1 1 0 0 0-1 1v3a5 5 0 0 0 4 4.9V13H7a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2h-2V10.9A5 5 0 0 0 19 6V3a1 1 0 0 0-1-1Z"/>
  </svg>
)

const features: Feature[] = [
  {
    title: 'Real-Time Voting',
    desc: 'Instant results as votes come in. Everyone sees who\'s winning in real-time.',
    chipClass: 'chip-pink',
    icon: <UsersIcon />,
  },
  {
    title: 'Dynamic Leaderboards',
    desc: 'Track top comedians and reset boards whenever you want. Keep it fresh!',
    chipClass: 'chip-gold',
    icon: <MonitorStar />,
  },
  {
    title: 'Multi-Venue Profiles',
    desc: 'One account, multiple bars. Players track their stats across all their favorite spots.',
    chipClass: 'chip-orange',
    icon: <GroupIcon />,
  },
  {
    title: 'No App Required',
    desc: 'Play instantly through any mobile browser. Zero friction to join the fun.',
    chipClass: 'chip-orange-line',
    icon: <PersonIcon />,
  },
  {
    title: 'Custom Prompts',
    desc: 'Venue owners can create their own questions or use our curated library.',
    chipClass: 'chip-green',
    icon: <BoltIcon />,
  },
  {
    title: 'Increase Dwell Time',
    desc: 'Keep customers entertained and ordering. Fun games mean longer visits.',
    chipClass: 'chip-orange',
    icon: <TrophyIcon />,
  },
]

export default function WhyChoose() {
  return (
    <section id="features" className="why">
      <div className="container">
        <h2 className="section-title">Why Choose Pub Söcial?</h2>
        <p className="section-sub">
          Everything you need to create memorable social experiences.
        </p>

        <div className="features-grid">
          {features.map((f) => (
            <article className="feature-card" key={f.title}>
              <span className={`feature-chip ${f.chipClass}`}>{f.icon}</span>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
