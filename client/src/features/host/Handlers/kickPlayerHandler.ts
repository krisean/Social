import type { Session } from "../../../shared/types";
import type { Toast } from "../../../shared/hooks/useToast";
import { kickPlayer } from "../../session/sessionService";

interface KickTeamDeps {
  session: Session | null;
  toast: Toast;
  setKickingTeamId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const handleKickTeam =
  (deps: KickTeamDeps) => async (teamId: string) => {
    const { session, toast, setKickingTeamId } = deps;

    if (!session) return;

    setKickingTeamId(teamId);
    try {
      await kickPlayer({ sessionId: session.id, teamId });
      toast({ title: "Team removed", variant: "info" });
    } catch (error: unknown) {
      console.log(error);
      toast({
        title: "Could not kick team",
        description: "Please try again.",
        variant: "error",
      });
    } finally {
      setKickingTeamId(null);
    }
  };
