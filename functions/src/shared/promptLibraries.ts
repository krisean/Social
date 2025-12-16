import classicPrompts from "../../shared/prompts.json";
import barPrompts from "../../shared/barPrompts.json";
import basicPrompts from "../../shared/basicprompts.json";
import halloweenPrompts from "../../shared/halloweenPrompts.json";
import selfiePrompts from "../../shared/selfiePrompts.json";
import victoriaPrompts from "../../shared/victoriaPrompts.json";
import dangerfieldPrompts from "../../shared/dangerfieldPrompts.json";
import promptLibrariesMeta from "../../shared/promptLibraries.meta.json";

export type PromptLibraryId = "classic" | "bar" | "basic" | "halloween" | "selfie" | "victoria" | "dangerfield";

interface PromptLibraryMeta {
  id: PromptLibraryId;
  name: string;
  emoji: string;
  description: string;
  promptFile: string;
}

export interface PromptLibrary {
  id: PromptLibraryId;
  name: string;
  emoji: string;
  description: string;
  prompts: string[];
}

const promptFileMap: Record<string, string[]> = {
  "prompts.json": classicPrompts,
  "barPrompts.json": barPrompts,
  "basicprompts.json": basicPrompts,
  "halloweenPrompts.json": halloweenPrompts,
  "selfiePrompts.json": selfiePrompts,
  "victoriaPrompts.json": victoriaPrompts,
  "dangerfieldPrompts.json": dangerfieldPrompts,
};

export const PROMPT_LIBRARIES: PromptLibrary[] = (promptLibrariesMeta as PromptLibraryMeta[]).map(
  (meta) => ({
    id: meta.id,
    name: meta.name,
    emoji: meta.emoji,
    description: meta.description,
    prompts: promptFileMap[meta.promptFile] ?? classicPrompts,
  }),
);

export const DEFAULT_PROMPT_LIBRARY_ID: PromptLibraryId = "classic";

export function getPromptLibrary(id?: string) {
  return (
    PROMPT_LIBRARIES.find((library) => library.id === id) ??
    PROMPT_LIBRARIES.find((library) => library.id === DEFAULT_PROMPT_LIBRARY_ID)!
  );
}
