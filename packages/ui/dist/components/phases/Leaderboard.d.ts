export interface LeaderboardTeam {
    id: string;
    rank: number;
    teamName: string;
    score: number;
    mascotId?: number;
}
type LeaderboardVariant = "team" | "host" | "presenter";
interface LeaderboardProps {
    leaderboard: LeaderboardTeam[];
    highlightTeamId?: string;
    maxItems?: number;
    variant?: LeaderboardVariant;
    className?: string;
    itemClassName?: string;
}
export declare function Leaderboard({ leaderboard, highlightTeamId, maxItems, variant, className, itemClassName, }: LeaderboardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Leaderboard.d.ts.map