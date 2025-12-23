import type { Answer } from "../../shared/types";
type AnswerCardVariant = "team" | "host" | "presenter";
interface AnswerCardProps {
    answer: Answer;
    voteCount: number;
    isWinner?: boolean;
    authorName?: string;
    isSelected?: boolean;
    onClick?: () => void;
    disabled?: boolean;
    showSummary?: boolean;
    variant?: AnswerCardVariant;
    className?: string;
}
export declare function AnswerCard({ answer, voteCount, isWinner, authorName, isSelected, onClick, disabled, showSummary, variant, className, }: AnswerCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AnswerCard.d.ts.map