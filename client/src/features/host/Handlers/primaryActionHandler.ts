import type { Session } from "../../../shared/types";
import type { Toast } from "../../../shared/hooks/useToast";
import { advancePhase, startGame } from "../../session/sessionService";

interface PrimaryActionDeps {
  session: Session | null;
  isPerformingAction: boolean;
  triggerPerformingAction: (value: boolean) => void;
  toast: Toast;
  setShowCreateModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const handlePrimaryAction = (deps: PrimaryActionDeps) => async () => {
  const {
    session,
    isPerformingAction,
    triggerPerformingAction,
    toast,
    setShowCreateModal,
  } = deps;

  if (!session) {
    setShowCreateModal(true);
    return;
  }
  if (isPerformingAction) return;

  triggerPerformingAction(true);
  try {
    if (session.status === "lobby") {
      await startGame({ sessionId: session.id });
      toast({ title: "Game started", variant: "success" });
    } else if (
      session.status === "answer" ||
      session.status === "vote" ||
      session.status === "results"
    ) {
      await advancePhase({ sessionId: session.id });
    }
  } catch (error: unknown) {
    console.log(error);
    toast({
      title: "Action failed",
      description: "Please try again.",
      variant: "error",
    });
  } finally {
    triggerPerformingAction(false);
  }
};
