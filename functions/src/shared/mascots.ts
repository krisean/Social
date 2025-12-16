import mascotsMeta from "../../shared/mascots.meta.json";

export interface MascotMeta{
    id: number;
    name: string;
    path: string;
}

export const MASCOTS: MascotMeta[] = mascotsMeta as MascotMeta[];

export function getMascotById(id: number): MascotMeta | undefined {
    return MASCOTS.find(mascot => mascot.id === id);
}

export function getNextMascotId(usedMascotIds: number[]): number {
    // Get all available mascot IDs
    const availableIds = MASCOTS.map(mascot => mascot.id);
    //find the first available mascot that hasn't been used
    for (const mascot of MASCOTS) {
        if (!usedMascotIds.includes(mascot.id)) {
            return mascot.id;
        }
    }
    //if no available mascots, return the first one
    return MASCOTS[0].id ?? 1;
}