import { useEffect, useRef, useState } from "react";
import { WinScreen } from "~/components/ui";
import { saveStars, shuffle } from "~/lib/progress";

const FACES = ["🐶", "🐱", "🐸", "🦊", "🐼", "🐵", "🦁", "🐷", "🐙", "🦄"];
const LEVELS = [
	{ pairs: 3, cols: "grid-cols-3" },
	{ pairs: 6, cols: "grid-cols-4" },
	{ pairs: 8, cols: "grid-cols-4" },
];

type Card = { id: number; face: string; matched: boolean };

function deal(pairs: number): Card[] {
	const faces = shuffle(FACES).slice(0, pairs);
	return shuffle([...faces, ...faces]).map((face, id) => ({ id, face, matched: false }));
}

export default function MemoryMatch() {
	const [level, setLevel] = useState(0);
	const [cards, setCards] = useState(() => deal(LEVELS[0].pairs));
	const [open, setOpen] = useState<number[]>([]);
	const [moves, setMoves] = useState(0);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
	useEffect(() => () => clearTimeout(timer.current), []);

	const { pairs, cols } = LEVELS[level];
	const won = cards.every((c) => c.matched);
	const stars = moves <= pairs * 1.5 ? 3 : moves <= pairs * 2.5 ? 2 : 1;

	useEffect(() => {
		if (won) saveStars(`game:memory-match:${level}`, stars);
	}, [won, level, stars]);

	function start(next: number) {
		clearTimeout(timer.current);
		setLevel(next);
		setCards(deal(LEVELS[next].pairs));
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
		const last = level === LEVELS.length - 1;
		return (
			<WinScreen
				stars={stars}
				message={last ? "Memory master!" : `Level ${level + 1} done!`}
				onAgain={() => start(last ? 0 : level + 1)}
				nextHref={last ? "/games" : undefined}
				nextLabel="More games"
			/>
		);
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-4 font-bold text-indigo-900">
				<span>Level {level + 1} of {LEVELS.length}</span>
				<span>Moves: {moves}</span>
			</div>
			<div className={`grid ${cols} gap-3 max-w-md mx-auto`}>
				{cards.map((c, i) => {
					const shown = c.matched || open.includes(i);
					return (
						<button
							key={c.id}
							type="button"
							onClick={() => flip(i)}
							aria-label={shown ? c.face : "Hidden card"}
							className={`aspect-square rounded-2xl text-4xl sm:text-5xl font-bold shadow-md transition-all duration-200 motion-reduce:transition-none ${
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
