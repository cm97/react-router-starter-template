import { useEffect, useState } from "react";
import { ProgressDots, WinScreen } from "~/components/ui";
import { saveStars, shuffle } from "~/lib/progress";

const WORDS: [string, string][] = [
	["CAT", "🐱"], ["DOG", "🐶"], ["SUN", "☀️"], ["BEE", "🐝"], ["BUS", "🚌"], ["PIG", "🐷"],
	["FISH", "🐟"], ["FROG", "🐸"], ["STAR", "⭐"], ["CAKE", "🎂"], ["MOON", "🌙"], ["TREE", "🌳"],
	["APPLE", "🍎"], ["HORSE", "🐴"], ["TRAIN", "🚆"], ["ROBOT", "🤖"],
];
const ROUNDS = 8;
const ALPHABET = "ABCDEFGHIJKLMNOPRSTUVWY";

type Round = { word: string; emoji: string; tiles: { id: number; letter: string }[] };

function makeRounds(): Round[] {
	const short = shuffle(WORDS.filter(([w]) => w.length === 3)).slice(0, 3);
	const mid = shuffle(WORDS.filter(([w]) => w.length === 4)).slice(0, 3);
	const long = shuffle(WORDS.filter(([w]) => w.length === 5)).slice(0, 2);
	return [...short, ...mid, ...long].map(([word, emoji], i) => {
		const extra = i < 3 ? 1 : 2;
		const letters = [...word];
		for (let k = 0; k < extra; k++) letters.push(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);
		return { word, emoji, tiles: shuffle(letters).map((letter, id) => ({ id, letter })) };
	});
}

export default function WordBuilder() {
	const [rounds, setRounds] = useState(makeRounds);
	const [round, setRound] = useState(0);
	const [used, setUsed] = useState<number[]>([]);
	const [shake, setShake] = useState<number | null>(null);
	const [mistakes, setMistakes] = useState(0);

	const done = round >= ROUNDS;
	const stars = mistakes <= 2 ? 3 : mistakes <= 5 ? 2 : 1;

	useEffect(() => {
		if (done) saveStars("game:word-builder", stars);
	}, [done, stars]);

	if (done) {
		return (
			<WinScreen
				stars={stars}
				message="Super speller!"
				onAgain={() => { setRounds(makeRounds()); setRound(0); setUsed([]); setMistakes(0); }}
				nextHref="/games"
				nextLabel="More games"
			/>
		);
	}

	const { word, emoji, tiles } = rounds[round];
	const spelled = used.map((id) => tiles.find((t) => t.id === id)!.letter).join("");
	const complete = spelled === word;

	function tap(id: number, letter: string) {
		if (complete || used.includes(id)) return;
		if (letter === word[spelled.length]) {
			const now = [...used, id];
			setUsed(now);
			if (now.length === word.length) {
				setTimeout(() => { setRound((r) => r + 1); setUsed([]); }, 900);
			}
		} else {
			setMistakes((m) => m + 1);
			setShake(id);
			setTimeout(() => setShake(null), 400);
		}
	}

	return (
		<div className="text-center">
			<ProgressDots total={ROUNDS} done={round} />
			<div className="text-8xl my-6" aria-hidden>{emoji}</div>
			<p className="sr-only">Spell the word for this picture. It has {word.length} letters.</p>
			<div className="flex justify-center gap-2 mb-8" aria-live="polite">
				{[...word].map((_, i) => (
					<span
						key={i}
						className={`grid place-items-center w-14 h-16 rounded-xl text-3xl font-extrabold border-4 ${
							spelled[i] ? (complete ? "bg-emerald-100 border-emerald-400 text-emerald-800" : "bg-amber-100 border-amber-400 text-indigo-900") : "border-dashed border-indigo-200"
						}`}
					>
						{spelled[i] ?? ""}
					</span>
				))}
			</div>
			<div className="flex flex-wrap justify-center gap-3 max-w-sm mx-auto">
				{tiles.map((t) => (
					<button
						key={`${round}-${t.id}`}
						type="button"
						disabled={used.includes(t.id)}
						onClick={() => tap(t.id, t.letter)}
						className={`w-16 h-16 rounded-2xl text-3xl font-extrabold shadow-md bg-white text-indigo-900 ring-2 ring-indigo-200 hover:bg-indigo-50 disabled:opacity-25 ${
							shake === t.id ? "motion-safe:animate-[shake_300ms] ring-rose-400" : ""
						}`}
					>
						{t.letter}
					</button>
				))}
			</div>
			{complete && <p className="mt-6 text-2xl font-extrabold text-emerald-700">{word}! 🎉</p>}
		</div>
	);
}
