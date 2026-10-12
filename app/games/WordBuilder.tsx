import { useState } from "react";
import { ProgressDots } from "~/components/ui";
import { shuffle } from "~/lib/progress";
import type { GameProps } from ".";
import { LevelDone } from "./LevelDone";

const WORDS: Record<number, [string, string][]> = {
	3: [
		["CAT", "🐱"], ["DOG", "🐶"], ["SUN", "☀️"], ["BEE", "🐝"], ["BUS", "🚌"], ["PIG", "🐷"], ["COW", "🐮"],
		["HAT", "🎩"], ["BED", "🛏️"], ["CAR", "🚗"], ["EGG", "🥚"], ["FOX", "🦊"], ["OWL", "🦉"], ["ANT", "🐜"],
	],
	4: [
		["FISH", "🐟"], ["FROG", "🐸"], ["STAR", "⭐"], ["CAKE", "🎂"], ["MOON", "🌙"], ["TREE", "🌳"], ["BOOK", "📚"],
		["SHIP", "🚢"], ["BEAR", "🐻"], ["DUCK", "🦆"], ["LION", "🦁"], ["BALL", "⚽"], ["KITE", "🪁"], ["DRUM", "🥁"],
	],
	5: [
		["APPLE", "🍎"], ["HORSE", "🐴"], ["TRAIN", "🚆"], ["ROBOT", "🤖"], ["TIGER", "🐯"], ["ZEBRA", "🦓"], ["PIZZA", "🍕"],
		["CLOCK", "⏰"], ["HOUSE", "🏠"], ["SNAKE", "🐍"], ["WHALE", "🐳"], ["CLOUD", "☁️"], ["GRAPE", "🍇"], ["SHEEP", "🐑"],
	],
	6: [
		["RABBIT", "🐰"], ["ROCKET", "🚀"], ["BANANA", "🍌"], ["TURTLE", "🐢"], ["MONKEY", "🐵"], ["CASTLE", "🏰"],
		["FLOWER", "🌸"], ["PENCIL", "✏️"], ["CHEESE", "🧀"], ["PLANET", "🪐"], ["DRAGON", "🐉"], ["CARROT", "🥕"],
	],
};
const ROUNDS = 5;
const ALPHABET = "ABCDEFGHIJKLMNOPRSTUVWY";

// Levels 1–5 use 3-letter words, 6–10 four, 11–15 five, 16–20 six.
// Within each band, extra decoy letters make the later levels harder.
const lengthFor = (level: number) => Math.min(6, 3 + Math.floor((level - 1) / 5));
const decoysFor = (level: number) => Math.floor(((level - 1) % 5) / 2);

type Round = { word: string; emoji: string; tiles: { id: number; letter: string }[] };

function makeRounds(level: number): Round[] {
	return shuffle(WORDS[lengthFor(level)])
		.slice(0, ROUNDS)
		.map(([word, emoji]) => {
			const letters = [...word];
			for (let k = 0; k < decoysFor(level); k++) letters.push(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);
			return { word, emoji, tiles: shuffle(letters).map((letter, id) => ({ id, letter })) };
		});
}

export default function WordBuilder({ slug, level }: GameProps) {
	const [rounds, setRounds] = useState(() => makeRounds(level));
	const [round, setRound] = useState(0);
	const [used, setUsed] = useState<number[]>([]);
	const [shake, setShake] = useState<number | null>(null);
	const [mistakes, setMistakes] = useState(0);

	const stars = mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1;

	if (round >= ROUNDS) {
		return (
			<LevelDone
				slug={slug}
				level={level}
				stars={stars}
				message="Super speller!"
				onAgain={() => { setRounds(makeRounds(level)); setRound(0); setUsed([]); setMistakes(0); }}
			/>
		);
	}

	const { word, emoji, tiles } = rounds[round];
	const spelled = used.map((id) => tiles.find((t) => t.id === id)!.letter).join("");
	const complete = spelled === word;
	const slot = word.length >= 5 ? "w-11 h-14 text-2xl" : "w-14 h-16 text-3xl";

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
						className={`grid place-items-center ${slot} rounded-xl font-extrabold border-4 ${
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
