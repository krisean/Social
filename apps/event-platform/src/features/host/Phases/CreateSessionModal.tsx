import React from "react";
import { Button, FormField, Modal } from "@social/ui";
import { useTheme } from "../../../shared/providers/ThemeProvider";

interface CreateSessionModalProps {
  open: boolean;
  onClose: () => void;
  createForm: { teamName: string; venueName: string };
  setCreateForm: React.Dispatch<
    React.SetStateAction<{ teamName: string; venueName: string }>
  >;
  createErrors: Record<string, string>;
  isCreating: boolean;
  canCreateSession: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function CreateSessionModal({
  open,
  onClose,
  createForm,
  setCreateForm,
  createErrors,
  isCreating,
  canCreateSession,
  onSubmit,
}: CreateSessionModalProps) {
  const { isDark } = useTheme();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create a Söcial session"
      isDark={isDark}
      footer={
        <div className="flex w-full items-center justify-between">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            form="create-session-form"
            type="submit"
            isLoading={isCreating}
            disabled={!canCreateSession || isCreating}
            title={
              !canCreateSession
                ? "Please wait for authentication to complete"
                : undefined
            }
          >
            Create session
          </Button>
        </div>
      }
    >
      <form id="create-session-form" className="space-y-4" onSubmit={onSubmit}>
        {!canCreateSession && (
          <div className={`rounded-lg border p-3 text-sm ${!isDark ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-700 border-cyan-400/50 text-cyan-200'}`}>
            <p className="font-semibold">Authentication required</p>
            <p className="mt-1">
              {isCreating
                ? "Creating session..."
                : "Please wait for authentication to complete."}
            </p>
          </div>
        )}
        <FormField
          label="Your team name"
          name="teamName"
          placeholder="Host team name"
          maxLength={15}
          value={createForm.teamName}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, teamName: e.target.value }))
          }
          error={createErrors.teamName}
          isDark={isDark}
        />
        <FormField
          label="Venue name (optional)"
          name="venueName"
          placeholder="Bar, team, or event name"
          maxLength={40}
          value={createForm.venueName}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, venueName: e.target.value }))
          }
          hint="Shown to teams in the lobby"
          error={createErrors.venueName}
          isDark={isDark}
        />
        <p className={`text-xs ${!isDark ? 'text-slate-600' : 'text-slate-400'}`}>
          You'll get a 6-character room code and QR to share with teams.
          Anonymous sign-in keeps things lightweight.
        </p>
      </form>
    </Modal>
  );
}
