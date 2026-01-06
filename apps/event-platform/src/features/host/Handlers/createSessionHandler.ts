import type { FormEvent } from "react";
import type { Toast } from "@social/ui";
import { createSession } from "../../session/sessionService";
import { createSessionSchema } from "../../../shared/schemas";
import { maskProfanity } from "../../../shared/utils/profanity";
import { getErrorMessage } from "../../../shared/utils/errors";
import type { User } from "@supabase/supabase-js";

interface CreateSessionHandlersDeps {
  user: User | null;
  authLoading: boolean;
  toast: Toast;
  setCreateErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isCreating: boolean; // Added this prop
  setIsCreating: React.Dispatch<React.SetStateAction<boolean>>;
  setSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  setHostSession: (sessionInfo: { sessionId: string; code: string }) => void;
  setShowCreateModal: React.Dispatch<React.SetStateAction<boolean>>;
  onSessionCreated: () => void;
}

export const handleCreateSession =
  (deps: CreateSessionHandlersDeps) =>
  async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const {
      user,
      authLoading,
      toast,
      setCreateErrors,
      isCreating,
      setIsCreating,
      setSessionId,
      setHostSession,
      setShowCreateModal,
      onSessionCreated,
    } = deps;

    if (isCreating) {
      // Prevent multiple submissions while request is in flight
      return;
    }

    if (authLoading) {
      toast("Hang tight - finishing sign-in before creating your room", "info");
      return;
    }
    if (!user) {
      toast("Sign-in failed - refresh the page and try again once connected", "error");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const values = {
      teamName: String(formData.get("teamName") ?? ""),
      venueName: String(formData.get("venueName") ?? ""),
    };

    const parsed = createSessionSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0];
        fieldErrors[String(path)] = issue.message;
      });
      setCreateErrors(fieldErrors);
      return;
    }

    setCreateErrors({});
    setIsCreating(true);

    try {
      const response = await createSession({
        teamName: maskProfanity(parsed.data.teamName),
        venueName: parsed.data.venueName
          ? maskProfanity(parsed.data.venueName)
          : undefined,
      });
      if (response) {
        setSessionId(response.sessionId);
        setHostSession({ sessionId: response.sessionId, code: response.code });
        setShowCreateModal(false);
        onSessionCreated();
        toast(`Game room ready! Share code ${response.session.code} to invite teams`, "success");
      }
    } catch (error: unknown) {
      toast(getErrorMessage(error, "Could not create session. Please try again in a moment."), "error");
    } finally {
      setIsCreating(false);
    }
  };
