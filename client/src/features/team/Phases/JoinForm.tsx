import type { FormEvent } from "react";
import { Card } from "../../../components/Card";
import { Button } from "../../../components/Button";
import { FormField } from "../../../components/FormField";
import { formatCode } from "../../../shared/constants";

interface JoinFormProps {
  joinForm: { code: string; teamName: string };
  joinErrors: Record<string, string>;
  isJoining: boolean;
  handleJoin: (event: FormEvent<HTMLFormElement>) => void;
  setJoinForm: React.Dispatch<
    React.SetStateAction<{ code: string; teamName: string }>
  >;
}

export function JoinForm({
  joinForm,
  joinErrors,
  isJoining,
  handleJoin,
  setJoinForm,
}: JoinFormProps) {
  return (
    <Card className="space-y-5">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black text-slate-900">Join Bar_Scores</h1>
        <p className="text-sm text-slate-600">
          Enter the room code from the host screen and pick a team name.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleJoin}>
        <FormField
          label="Room code"
          name="code"
          placeholder="A1B2C3"
          value={joinForm.code}
          onChange={(event) =>
            setJoinForm((prev) => ({
              ...prev,
              code: formatCode(event.target.value),
            }))
          }
          inputMode="text"
          autoComplete="off"
          error={joinErrors.code}
          maxLength={6}
        />
        <FormField
          label="Team name"
          name="teamName"
          placeholder="Your team name"
          value={joinForm.teamName}
          onChange={(event) =>
            setJoinForm((prev) => ({ ...prev, teamName: event.target.value }))
          }
          maxLength={15}
          error={joinErrors.teamName}
        />
        <Button type="submit" fullWidth isLoading={isJoining}>
          Join game
        </Button>
      </form>
    </Card>
  );
}

