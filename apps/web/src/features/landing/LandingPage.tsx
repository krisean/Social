export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-6xl font-bold mb-4">PlayNow Social</h1>
          <p className="text-2xl mb-8">Interactive Games & Social Walls for Bars & Venues</p>
          <a 
            href="#features"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Learn More
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section id="features" className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            What We Offer
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Live Event Games</h3>
              <p className="text-gray-700 mb-4">
                Host interactive trivia nights, comedy shows, and team competitions with our real-time event platform.
              </p>
              <a href="https://events.playnow.social" className="text-blue-600 font-semibold hover:underline">
                Learn More →
              </a>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-8 rounded-lg shadow-md">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">24/7 Comment Walls</h3>
              <p className="text-gray-700 mb-4">
                Give your patrons a voice! Engage customers 24/7 with real-time comment walls visible throughout your venue.
              </p>
              <a href="https://pub.playnow.social" className="text-purple-600 font-semibold hover:underline">
                View Demo →
              </a>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-teal-100 p-8 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">AI Jukebox</h3>
              <p className="text-gray-700 mb-4">
                Let AI create the perfect atmosphere. VIBox analyzes your crowd and generates custom music experiences.
              </p>
              <a href="#" className="text-green-600 font-semibold hover:underline">
                Coming Soon →
              </a>
            </div>
          </div>
        </section>

        <section className="mb-20 bg-gray-50 p-12 rounded-lg">
          <h2 className="text-4xl font-bold text-center mb-8 text-gray-900">
            Why Venues Love Us
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="text-3xl">✓</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Easy Setup</h3>
                <p className="text-gray-600">Get started in minutes. No hardware required.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-3xl">✓</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Boost Engagement</h3>
                <p className="text-gray-600">Keep customers entertained and coming back.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-3xl">✓</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Real-Time Analytics</h3>
                <p className="text-gray-600">See what's working with detailed insights.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-3xl">✓</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Flexible Pricing</h3>
                <p className="text-gray-600">Plans that scale with your business.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">
            Ready to Transform Your Venue?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of venues using PlayNow Social to create unforgettable experiences for their customers.
          </p>
          <a
            href="mailto:hello@playnow.social"
            className="inline-block bg-blue-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </a>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 PlayNow Social. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

