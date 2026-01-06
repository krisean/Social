import type { Session } from "../../../shared/types";
import type { Toast } from "@social/ui";
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
      toast("Team removed", "info");
    } catch (error: unknown) {
      console.log(error);
      toast("Could not kick team. Please try again.", "error");
    } finally {
      setKickingTeamId(null);
    }
  };
