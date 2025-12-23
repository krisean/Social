/**
 * Game Registry for Supabase
 * Manages registration and retrieval of available games
 */
export class GameRegistry {
    static games = new Map();
    static register(game) {
        this.games.set(game.descriptor.id, game);
    }
    static get(gameId) {
        return this.games.get(gameId);
    }
    static getAll() {
        return Array.from(this.games.values());
    }
    static getAllDescriptors() {
        return Array.from(this.games.values()).map((game) => game.descriptor);
    }
    static exists(gameId) {
        return this.games.has(gameId);
    }
    static clear() {
        this.games.clear();
    }
}
//# sourceMappingURL=GameRegistry.js.map