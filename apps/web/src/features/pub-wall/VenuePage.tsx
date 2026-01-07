import { useParams } from 'react-router-dom';
import { useVenueWall } from './hooks/useVenueWall';
import { CommentWall } from './components/CommentWall';

export function VenuePage() {
  const { venueKey } = useParams();

  const { venue, answers, submitComment, loading } = useVenueWall(venueKey);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading venue...</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Venue Not Found</h1>
          <p className="text-xl text-gray-600 mb-8">The venue "{venueKey}" doesn't exist yet.</p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Browse Venues
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {venue.name}
          </h1>
          <p className="text-lg text-gray-600">Share your funniest thoughts!</p>
        </div>

        <CommentWall
          answers={answers}
          onSubmit={submitComment}
          venueName={venue.name}
        />
      </div>
    </div>
  );
}

