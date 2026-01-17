import { useState, useEffect } from "react";
import { Button, Modal } from "@social/ui";
import { supabase } from "../../../supabase/client";
import { useTheme } from "../../../shared/providers/ThemeProvider";

interface TeamCode {
  id: string;
  code: string;
  teamId?: string;
  teamName?: string;
  isUsed: boolean;
  assignedAt?: string;
  memberCount?: number;
}

interface TeamCodesManagerProps {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
  toast: (options: { title: string; variant: "success" | "error" | "info" }) => void;
}

export function TeamCodesManager({ sessionId, isOpen, onClose, toast }: TeamCodesManagerProps) {
  const { isDark } = useTheme();
  const [teamCodes, setTeamCodes] = useState<TeamCode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchTeamCodes();
    }
  }, [isOpen, sessionId]);

  const fetchTeamCodes = async () => {
    setLoading(true);
    try {
      console.log('Fetching team codes for session:', sessionId);
      
      // Direct query with type assertion
      const { data: codes, error } = await supabase
        .from('team_codes' as any)
        .select('id, code, team_id, assigned_at, is_used')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      
      console.log('Query result:', { codes, error });
      console.log('Codes array:', codes);
      console.log('Codes length:', codes?.length);
      console.log('Error details:', error);
      
      if (error) {
        console.error('Query error:', error);
        throw error;
      }

      // Process the data
      const processedCodes = (codes || []).map((code: any) => ({
        id: code.id,
        code: code.code,
        teamId: code.team_id || undefined,
        teamName: code.team_name || undefined,
        isUsed: code.is_used,
        assignedAt: code.assigned_at,
        memberCount: code.member_count || 0
      }));
      
      console.log('Processed codes:', processedCodes);
      setTeamCodes(processedCodes);
    } catch (error) {
      console.error('Error fetching team codes:', error);
      toast({
        title: "Failed to load team codes",
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyAllCodes = () => {
    const availableCodes = teamCodes
      .filter(code => !code.isUsed)
      .map(code => code.code)
      .join('\n');
    
    if (availableCodes) {
      navigator.clipboard.writeText(availableCodes);
      toast({
        title: "Team codes copied to clipboard",
        variant: "success"
      });
    } else {
      toast({
        title: "No available team codes to copy",
        variant: "info"
      });
    }
  };

  const copySingleCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: `Team code ${code} copied`,
      variant: "success"
    });
  };

  const availableCodes = teamCodes.filter(code => !code.isUsed);
  const usedCodes = teamCodes.filter(code => code.isUsed);

  return (
    <Modal open={isOpen} onClose={onClose} title="Team Codes Management" isDark={isDark}>
      <div className="space-y-4">
        {/* Summary */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-cyan-400' : 'text-slate-900'}`}>
                {availableCodes.length}
              </div>
              <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Available
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                {usedCodes.length}
              </div>
              <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Used
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                {teamCodes.length}
              </div>
              <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Total
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={copyAllCodes} variant="secondary" size="sm">
            Copy All Available Codes
          </Button>
          <Button onClick={fetchTeamCodes} variant="ghost" size="sm" disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {/* Available Codes */}
        {availableCodes.length > 0 && (
          <div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Available Team Codes
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {availableCodes.map((code) => (
                <button
                  key={code.id}
                  onClick={() => copySingleCode(code.code)}
                  className={`p-3 rounded-lg border text-center transition-all hover:scale-105 ${
                    isDark 
                      ? 'bg-slate-800 border-slate-600 hover:border-cyan-500 text-cyan-400' 
                      : 'bg-white border-slate-300 hover:border-blue-500 text-blue-600'
                  }`}
                >
                  <div className="font-mono text-lg font-bold">{code.code}</div>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Available
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Used Codes */}
        {usedCodes.length > 0 && (
          <div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Active Teams
            </h3>
            <div className="space-y-2">
              {usedCodes.map((code) => (
                <div
                  key={code.id}
                  className={`p-3 rounded-lg border flex items-center justify-between ${
                    isDark 
                      ? 'bg-slate-800 border-slate-600' 
                      : 'bg-white border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className={`font-mono font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        {code.code}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {code.teamName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {code.memberCount || 1} member{code.memberCount !== 1 ? 's' : ''}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      {code.assignedAt ? new Date(code.assignedAt).toLocaleTimeString() : 'Unknown'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Loading team codes...
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
