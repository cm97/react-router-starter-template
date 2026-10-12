import type { ComponentType } from "react";
import MathPop from "./MathPop";
import MemoryMatch from "./MemoryMatch";
import PatternParty from "./PatternParty";
import WordBuilder from "./WordBuilder";

export type GameProps = { slug: string; level: number };

export const GAME_COMPONENTS: Record<string, ComponentType<GameProps>> = {
	"memory-match": MemoryMatch,
	"math-pop": MathPop,
	"word-builder": WordBuilder,
	"pattern-party": PatternParty,
};
