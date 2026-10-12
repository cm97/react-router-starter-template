import type { ComponentType } from "react";
import MathPop from "./MathPop";
import MemoryMatch from "./MemoryMatch";
import PatternParty from "./PatternParty";
import WordBuilder from "./WordBuilder";

export const GAME_COMPONENTS: Record<string, ComponentType> = {
	"memory-match": MemoryMatch,
	"math-pop": MathPop,
	"word-builder": WordBuilder,
	"pattern-party": PatternParty,
};
