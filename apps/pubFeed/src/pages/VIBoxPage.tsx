import { VIBoxPlayer } from '../components/vibox';
import { useViboxQueue } from '../hooks/vibox';

export function VIBoxPage() {
  const { addToQueue } = useViboxQueue();

  const handleAddSampleTrack = async () => {
    await addToQueue({
      track_id: `track-${Date.now()}`,
      track_title: 'Sample Track',
      track_artist: 'Test Artist',
      track_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      track_genre: 'Electronic',
      track_duration: 360,
      primary_vibe: 'Energetic',
      secondary_vibe: 'Upbeat',
      added_by: 'pubFeed User',
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">VIBox Music Player</h1>
          <p className="text-gray-400">
            Unified music queue powered by VIBox API
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={handleAddSampleTrack}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            + Add Sample Track
          </button>
        </div>

        <VIBoxPlayer />

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">ℹ️ About VIBox</h3>
          <ul className="text-gray-300 space-y-1 text-sm">
            <li>• Shared queue across all apps (pubFeed, dashboard, web)</li>
            <li>• Real-time synchronization via Supabase</li>
            <li>• Add tracks from any connected application</li>
            <li>• Changes appear instantly everywhere</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
