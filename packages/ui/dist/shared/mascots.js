import mascotsMeta from "./mascots.meta.json";
export const MASCOTS = mascotsMeta;
export function getMascotById(id) {
    if (!id)
        return undefined;
    return MASCOTS.find(mascot => mascot.id === id);
}
export function getMascotPath(id) {
    if (!id)
        return undefined;
    return getMascotById(id)?.path;
}
//# sourceMappingURL=mascots.js.map