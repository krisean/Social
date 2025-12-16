import promptLibrariesMeta from "../../../functions/shared/promptLibraries.meta.json";
import classicPrompts from "../../../functions/shared/prompts.json";
import barPrompts from "../../../functions/shared/barPrompts.json";
import basicPrompts from "../../../functions/shared/basicprompts.json";
import halloweenPrompts from "../../../functions/shared/halloweenPrompts.json";
import selfiePrompts from "../../../functions/shared/selfiePrompts.json";
import victoriaPrompts from "../../../functions/shared/victoriaPrompts.json";
import dangerfieldPrompts from "../../../functions/shared/dangerfieldPrompts.json";

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
