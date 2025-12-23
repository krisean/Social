export interface MascotMeta {
    id: number;
    name: string;
    path: string;
}
export declare const MASCOTS: MascotMeta[];
export declare function getMascotById(id?: number): MascotMeta | undefined;
export declare function getMascotPath(id?: number): string | undefined;
//# sourceMappingURL=mascots.d.ts.map