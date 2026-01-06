import type { Session, RoundGroup } from "../../../shared/types";
import type { Toast } from "@social/ui";
import { submitVote } from "../../session/sessionService";
import { getErrorMessage } from "../../../shared/utils/errors";

interface HostVoteDeps {
  session: Session | null;
  activeGroup: RoundGroup | null;
  activeGroupVote: string | null;
  toast: Toast;
  setIsSubmittingVote: React.Dispatch<React.SetStateAction<boolean>>;
  setHostGroupVotes: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  isSubmittingVote: boolean;
}
export const handleHostVote =
  (deps: HostVoteDeps) => async (answerId: string) => {
    const {
      session,
      activeGroup,
      activeGroupVote,
      toast,
      setIsSubmittingVote,
      setHostGroupVotes,
      isSubmittingVote, // <-- add this to deps interface & destructure here
    } = deps;

    if (!session) return;
    if (!activeGroup) return;
    if (activeGroupVote === answerId) return;
    if (isSubmittingVote) return; // Prevent multiple simultaneous votes

    setIsSubmittingVote(true);

    try {
      await submitVote({ sessionId: session.id, answerId });
      setHostGroupVotes((prev) => ({ ...prev, [activeGroup.id]: answerId }));
      toast("Vote cast", "success");
    } catch (error: unknown) {
      toast(getErrorMessage(error, "Could not record vote. Try again while voting is open."), "error");
    } finally {
      setIsSubmittingVote(false);
    }
  };
