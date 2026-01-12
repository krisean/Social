import type { Session } from "../../../shared/types";
import type { Toast } from "../../../shared/hooks/useToast";
import { banPlayer } from "../../session/sessionService";

interface BanTeamDeps {
  session: Session | null;
  toast: Toast;
  setBanningTeamId: React.Dispatch<React.SetStateAction<string | null>>;
  refresh?: () => void;
}

export const handleBanTeam =
  (deps: BanTeamDeps) => async (teamId: string) => {
    const { session, toast, setBanningTeamId, refresh } = deps;

    if (!session) return;

    setBanningTeamId(teamId);
    try {
      await banPlayer({ sessionId: session.id, teamId });
      
      if (refresh) {
        setTimeout(refresh, 100);
      }
      
      toast({ title: "Team banned from session", variant: "info" });
    } catch (error: unknown) {
      console.log(error);
      toast({ title: "Could not ban team. Please try again.", variant: "error" });
    } finally {
      setBanningTeamId(null);
    }
  };
