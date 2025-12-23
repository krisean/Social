import promptLibrariesMeta from "./promptLibraries.meta.json";
export type PromptLibraryId = (typeof promptLibrariesMeta)[number]["id"];
export interface PromptLibrary {
    id: PromptLibraryId;
    name: string;
    emoji: string;
    description: string;
    prompts: string[];
}
export declare const promptLibraries: PromptLibrary[];
export declare const defaultPromptLibrary: PromptLibrary;
export declare const defaultPromptLibraryId: string;
//# sourceMappingURL=promptLibraries.d.ts.map