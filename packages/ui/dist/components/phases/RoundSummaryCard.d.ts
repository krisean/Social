import type { Answer, RoundGroup } from "../../shared/types";
export interface RoundSummary {
    group: RoundGroup;
    index: number;
    answers: Answer[];
    winners: Answer[];
}
type RoundSummaryCardVariant = "host" | "presenter";
interface RoundSummaryCardProps {
    summary: RoundSummary;
    voteCounts: Map<string, number>;
    variant?: RoundSummaryCardVariant;
    className?: string;
}
export declare function RoundSummaryCard({ summary, voteCounts, variant, className, }: RoundSummaryCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=RoundSummaryCard.d.ts.map