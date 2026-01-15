import { useState, useEffect } from "react";
import { Button, Card, Modal } from "@social/ui";
import { supabase } from "../../../supabase/client";

interface BannedTeam {
  id: string;
  session_id: string;
  team_id: string;
  team_name: string;
  banned_at: string;
  banned_by: string;
  reason?: string;
}

interface BannedTeamsManagerProps {
  sessionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  toast: (options: { title: string; variant: "success" | "error" | "info" }) => void;
}

export function BannedTeamsManager({ 
  sessionId, 
  isOpen, 
  onClose, 
  toast 
}: BannedTeamsManagerProps) {
  const [bannedTeams, setBannedTeams] = useState<BannedTeam[]>([]);
  const [loading, setLoading] = useState(false);
  const [unbanningTeamId, setUnbanningTeamId] = useState<string | null>(null);

  
  useEffect(() => {
    if (isOpen && sessionId) {
      fetchBannedTeams();
    }
  }, [isOpen, sessionId]);

  const fetchBannedTeams = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("banned_teams" as any)
        .select("*")
        .eq("session_id", sessionId)
        .order("banned_at", { ascending: false });

      if (error) throw error;
      setBannedTeams((data || []) as unknown as BannedTeam[]);
    } catch (error) {
      console.error("Error fetching banned teams:", error);
      toast({
        title: "Failed to load banned teams",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnbanTeam = async (bannedTeam: BannedTeam) => {
    if (!sessionId) return;

    setUnbanningTeamId(bannedTeam.id);
    try {
      const { error } = await supabase.functions.invoke('sessions-unban-player', {
        body: {
          sessionId: sessionId,
          bannedTeamId: bannedTeam.id
        }
      });

      if (error) throw error;

      // Remove from local state
      setBannedTeams(prev => prev.filter(team => team.id !== bannedTeam.id));
      
      toast({
        title: `${bannedTeam.team_name} has been unbanned`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error unbanning team:", error);
      toast({
        title: "Failed to unban team",
        variant: "error",
      });
    } finally {
      setUnbanningTeamId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Banned Teams">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Banned Teams</h2>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading banned teams...</div>
          </div>
        ) : bannedTeams.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">No banned teams</div>
          </div>
        ) : (
          <div className="space-y-3">
            {bannedTeams.map((bannedTeam) => (
              <Card key={bannedTeam.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{bannedTeam.team_name}</h3>
                    <p className="text-sm text-gray-500">
                      Banned on {formatDate(bannedTeam.banned_at)}
                    </p>
                    {bannedTeam.reason && (
                      <p className="text-sm text-gray-600 mt-1">
                        Reason: {bannedTeam.reason}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => handleUnbanTeam(bannedTeam)}
                    disabled={unbanningTeamId === bannedTeam.id}
                    className="text-green-600 hover:text-green-700"
                  >
                    {unbanningTeamId === bannedTeam.id ? "Unbanning..." : "Unban"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600">
            Banned teams cannot rejoin the session. Use "Unban" to allow them to rejoin.
          </p>
        </div>
      </div>
    </Modal>
  );
}
