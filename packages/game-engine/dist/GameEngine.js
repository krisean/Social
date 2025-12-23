/**
 * Game Engine Interface for Supabase
 * All games must implement this interface
 */
// Base abstract class that games can extend
export class BaseGameEngine {
    // Helper methods
    now() {
        return new Date().toISOString();
    }
    futureTimestamp(seconds) {
        return new Date(Date.now() + seconds * 1000).toISOString();
    }
}
//# sourceMappingURL=GameEngine.js.map