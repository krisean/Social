import { Card, Button, Timer, ProgressBar } from "@social/ui";
import { useTheme } from "../../../shared/providers/ThemeProvider";
import { clsx } from "clsx";
import type { Session, RoundGroup, Answer } from "../../../shared/types";

interface AnswerPhaseProps {
  session: Session;
  myGroup: RoundGroup | null;
  roundGroups: RoundGroup[];
  prompts: string[];
  myAnswer: Answer | null;
  answerText: string;
  setAnswerText: (text: string) => void;
  handleSubmitAnswer: () => void;
  isSubmittingAnswer: boolean;
  totalSeconds: number;
}

export function AnswerPhase({
  session,
  myGroup,
  roundGroups,
  prompts,
  myAnswer,
  answerText,
  setAnswerText,
  handleSubmitAnswer,
  isSubmittingAnswer,
  totalSeconds,
}: AnswerPhaseProps) {
  const { isDark } = useTheme();
  const CHAR_LIMIT = 120;
  const promptFallback =
    myGroup?.prompt ??
    roundGroups[0]?.prompt ??
    prompts[session.roundIndex % prompts.length];
  const characterCount = Math.min(answerText.length, CHAR_LIMIT);
  const limitReached = characterCount >= CHAR_LIMIT;

  return (
    <Card className="space-y-3 p-3 sm:space-y-5 sm:p-5" isDark={isDark}>
      <div className="space-y-2 text-center">
        <div className={`rounded-2xl px-3 py-2 shadow-2xl text-xs font-semibold ${!isDark ? 'bg-slate-900/95 text-white' : 'bg-slate-800 text-cyan-100'}`}>
          <Timer endTime={session.endsAt} label="Time left" size="md" />
        </div>
        <div className={`rounded-full p-0.5 shadow-inner ${!isDark ? 'bg-white/80 shadow-slate-300' : 'bg-slate-700/80 shadow-slate-600'}`}>
          <ProgressBar endTime={session.endsAt} totalSeconds={totalSeconds} />
        </div>
      </div>
      <p className={`text-center text-xs font-semibold uppercase tracking-wide sm:text-sm ${!isDark ? 'text-slate-800' : 'text-cyan-200'}`}>
        Round {session.roundIndex + 1}
      </p>
      {myAnswer ? (
        <div className={`rounded-3xl p-5 text-center ${!isDark ? 'bg-brand-light' : 'bg-cyan-900/30'}`}>
          <p className={`text-sm font-semibold ${!isDark ? 'text-brand-primary' : 'text-cyan-400'}`}>
            Answer submitted!
          </p>
          <p className={`mt-2 ${!isDark ? 'text-slate-700' : 'text-slate-300'}`}>{myAnswer.text}</p>
        </div>
      ) : (
        <>
          <div className="space-y-2 sm:space-y-3">
            <div className={`rounded-3xl px-3 py-3 text-center sm:px-4 sm:py-4 shadow-md ${!isDark ? 'bg-white text-slate-900' : 'bg-slate-800 text-white'}`}>
              <p className={`text-2xl font-black tracking-tight drop-shadow-lg sm:text-3xl ${!isDark ? 'text-slate-900' : 'text-pink-400'}`}>
                {promptFallback}
              </p>
            </div>
            <div className={`flex items-center justify-between text-[11px] sm:text-xs ${!isDark ? 'text-brand-primary' : 'text-cyan-400'}`}>
              <span>Type your answer below</span>
              <span
                className={clsx(
                  limitReached && `${!isDark ? 'text-rose-600' : 'text-rose-400'} font-bold text-sm sm:text-base`,
                )}
              >
                {characterCount}/{CHAR_LIMIT}
              </span>
            </div>
            <textarea
              className="matte-input min-h-[90px] w-full rounded-3xl border border-white/40 bg-transparent px-3 py-3 text-sm leading-relaxed placeholder:text-slate-500 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-light sm:min-h-[140px] sm:px-5 sm:py-4 sm:text-base"
              placeholder="Type your best response"
              value={answerText.slice(0, CHAR_LIMIT)}
              maxLength={CHAR_LIMIT}
              onChange={(event) =>
                setAnswerText(event.target.value.slice(0, CHAR_LIMIT))
              }
              aria-label="Your answer"
            />
          </div>
          <Button
            onClick={handleSubmitAnswer}
            disabled={!answerText.trim()}
            isLoading={isSubmittingAnswer}
            fullWidth
            size="sm"
          >
            Submit answer
          </Button>
        </>
      )}
    </Card>
  );
}
