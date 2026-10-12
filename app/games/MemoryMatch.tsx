import { useEffect, useRef, useState } from "react";
import { shuffle } from "~/lib/progress";
import type { GameProps } from ".";
import { LevelDone } from "./LevelDone";

const THEMES = [
	["🐶", "🐱", "🐸", "🦊", "🐼", "🐵", "🦁", "🐷", "🐙", "🦄", "🐨", "🐯"],
	["🍎", "🍌", "🍇", "🍓", "🍉", "🍍", "🥝", "🍒", "🍑", "🥕", "🌽", "🍋"],
	["🚗", "🚀", "🚲", "⛵", "🚂", "🚁", "🚒", "🚜", "🛸", "🚌", "🛵", "✈️"],
	["🌞", "🌙", "⭐", "🪐", "☄️", "🌍", "🌈", "⚡", "❄️", "🔥", "🌊", "☁️"],
	["🐠", "🐳", "🦀", "🐬", "🦑", "🐢", "🦭", "🐡", "🦐", "🐚", "🦈", "🐊"],
];

// Level 1 has 3 pairs; every two levels add a pair, up to 12 pairs (24 cards).
const pairsFor = (level: number) => Math.min(12, 2 + Math.ceil(level / 2));
const colsFor = (cards: number) =>
	cards <= 6 ? "grid-cols-3" : cards <= 12 ? "grid-cols-4" : cards <= 20 ? "grid-cols-5" : "grid-cols-6";

type Card = { id: number; face: string; matched: boolean };

function deal(level: number): Card[] {
	const faces = shuffle(THEMES[(level - 1) % THEMES.length]).slice(0, pairsFor(level));
	return shuffle([...faces, ...faces]).map((face, id) => ({ id, face, matched: false }));
}

export default function MemoryMatch({ slug, level }: GameProps) {
	const [cards, setCards] = useState(() => deal(level));
	const [open, setOpen] = useState<number[]>([]);
	const [moves, setMoves] = useState(0);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
	useEffect(() => () => clearTimeout(timer.current), []);

	const pairs = pairsFor(level);
	const won = cards.every((c) => c.matched);
	const stars = moves <= pairs * 1.5 ? 3 : moves <= pairs * 2.2 ? 2 : 1;
	const big = cards.length > 12;

	function restart() {
		clearTimeout(timer.current);
		setCards(deal(level));
		setOpen([]);
		setMoves(0);
	}

	function flip(i: number) {
		if (open.length === 2 || open.includes(i) || cards[i].matched) return;
		const now = [...open, i];
		setOpen(now);
		if (now.length < 2) return;
		setMoves((m) => m + 1);
		const [a, b] = now;
		if (cards[a].face === cards[b].face) {
			setCards((cs) => cs.map((c, k) => (k === a || k === b ? { ...c, matched: true } : c)));
			setOpen([]);
		} else {
			timer.current = setTimeout(() => setOpen([]), 800);
		}
	}

	if (won) {
		return <LevelDone slug={slug} level={level} stars={stars} message="Memory master!" onAgain={restart} />;
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-4 font-bold text-indigo-900">
				<span>{pairs} pairs</span>
				<span>Moves: {moves}</span>
			</div>
			<div className={`grid ${colsFor(cards.length)} gap-2 sm:gap-3 max-w-lg mx-auto`}>
				{cards.map((c, i) => {
					const shown = c.matched || open.includes(i);
					return (
						<button
							key={c.id}
							type="button"
							onClick={() => flip(i)}
							aria-label={shown ? c.face : "Hidden card"}
							className={`aspect-square min-h-11 rounded-2xl ${big ? "text-2xl sm:text-4xl" : "text-4xl sm:text-5xl"} font-bold shadow-md transition-all duration-200 motion-reduce:transition-none ${
								c.matched
									? "bg-emerald-100 scale-95"
									: shown
										? "bg-white ring-4 ring-amber-300"
										: "bg-gradient-to-br from-indigo-400 to-sky-400 hover:scale-105 text-white"
							}`}
						>
							{shown ? c.face : "?"}
						</button>
					);
				})}
			</div>
		</div>
	);
}
