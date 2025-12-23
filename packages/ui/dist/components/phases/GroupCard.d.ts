import type { RoundGroup } from "../../shared/types";
type GroupCardVariant = "host" | "presenter";
interface GroupCardProps {
    group: RoundGroup;
    index: number;
    teamLookup: Map<string, string>;
    variant?: GroupCardVariant;
    className?: string;
}
export declare function GroupCard({ group, index, teamLookup, variant, className, }: GroupCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=GroupCard.d.ts.map