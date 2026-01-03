export function VenueSelector() {
  const exampleVenues = [
    { key: 'the-drunken-duck', name: 'The Drunken Duck' },
    { key: 'mabels-pub', name: "Mabel's Pub" },
    { key: 'craft-beer-house', name: 'Craft Beer House' },
    { key: 'sports-bar', name: 'Sports Bar' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Pub Comment Walls
          </h1>
          <p className="text-xl text-gray-600">
            Visit your favorite pub's comment wall or create your own!
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {exampleVenues.map((venue) => (
            <a
              key={venue.key}
              href={`/${venue.key}`}
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-300"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {venue.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                pub.playnow.social/{venue.key}
              </p>
              <span className="text-blue-600 font-medium">
                View Comments →
              </span>
            </a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 mb-4">
            Don't see your pub? Venues can register at{' '}
            <a href="https://playnow.social" className="text-blue-600 hover:underline">
              playnow.social
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

