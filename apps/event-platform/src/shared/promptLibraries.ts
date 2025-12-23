import promptLibrariesMeta from "./promptLibraries.meta.json";
import classicPrompts from "./prompts.json";
import barPrompts from "./barPrompts.json";
import basicPrompts from "./basicprompts.json";
import halloweenPrompts from "./halloweenPrompts.json";
import selfiePrompts from "./selfiePrompts.json";
import victoriaPrompts from "./victoriaPrompts.json";
import dangerfieldPrompts from "./dangerfieldPrompts.json";

const promptFileMap: Record<string, string[]> = {
  "prompts.json": classicPrompts,
  "barPrompts.json": barPrompts,
  "basicprompts.json": basicPrompts,
  "halloweenPrompts.json": halloweenPrompts,
  "selfiePrompts.json": selfiePrompts,
  "victoriaPrompts.json": victoriaPrompts,
  "dangerfieldPrompts.json": dangerfieldPrompts,
};

export type PromptLibraryId = (typeof promptLibrariesMeta)[number]["id"];

export interface PromptLibrary {
  id: PromptLibraryId;
  name: string;
  emoji: string;
  description: string;
  prompts: string[];
}

export const promptLibraries: PromptLibrary[] = promptLibrariesMeta.map(
  (meta) => ({
    id: meta.id as PromptLibraryId,
    name: meta.name,
    emoji: meta.emoji,
    description: meta.description,
    prompts: promptFileMap[meta.promptFile] ?? classicPrompts,
  }),
);

export const defaultPromptLibrary = promptLibraries[0];
export const defaultPromptLibraryId = defaultPromptLibrary?.id ?? "classic";
