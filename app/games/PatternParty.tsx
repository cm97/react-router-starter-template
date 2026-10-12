import { useEffect, useState } from "react";
import { ProgressDots, WinScreen } from "~/components/ui";
import { saveStars, shuffle } from "~/lib/progress";

const SETS = [
	["🔴", "🔵", "🟡", "🟢"],
	["🍎", "🍌", "🍇", "🍊"],
	["🐶", "🐱", "🐭", "🐰"],
	["⭐", "🌙", "☀️", "☁️"],
	["🚗", "🚀", "🚲", "⛵"],
];
// Each rule is a repeating unit, harder ones later in the game.
const RULES = ["AB", "AB", "AAB", "ABC", "ABB", "AABB", "ABCD", "ABAC"];

type Round = { shown: string[]; answer: string; choices: string[] };

function makeRounds(): Round[] {
	return RULES.map((rule) => {
		const set = shuffle(SETS[Math.floor(Math.random() * SETS.length)]);
		const pick = (ch: string) => set[ch.charCodeAt(0) - 65];
		const seq = Array.from({ length: Math.max(6, rule.length * 2 + 1) + 1 }, (_, i) =>
			pick(rule[i % rule.length]),
		);
		const answer = seq.pop()!;
		const others = shuffle(set.filter((s) => s !== answer)).slice(0, 2);
		return { shown: seq, answer, choices: shuffle([answer, ...others]) };
	});
}

export default function PatternParty() {
	const [rounds, setRounds] = useState(makeRounds);
	const [round, setRound] = useState(0);
	const [mistakes, setMistakes] = useState(0);
	const [wrong, setWrong] = useState<string | null>(null);
	const [right, setRight] = useState(false);

	const done = round >= rounds.length;
	const stars = mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1;

	useEffect(() => {
		if (done) saveStars("game:pattern-party", stars);
	}, [done, stars]);

	if (done) {
		return (
			<WinScreen
				stars={stars}
				message="Pattern pro!"
				onAgain={() => { setRounds(makeRounds()); setRound(0); setMistakes(0); }}
				nextHref="/games"
				nextLabel="More games"
			/>
		);
	}

	const { shown, answer, choices } = rounds[round];

	function choose(c: string) {
		if (right) return;
		if (c === answer) {
			setRight(true);
			setTimeout(() => { setRight(false); setRound((r) => r + 1); }, 800);
		} else {
			setMistakes((m) => m + 1);
			setWrong(c);
			setTimeout(() => setWrong(null), 400);
		}
	}

	return (
		<div className="text-center">
			<ProgressDots total={rounds.length} done={round} />
			<p className="text-xl font-bold text-indigo-900 mt-6 mb-4">What comes next?</p>
			<div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-4xl sm:text-5xl mb-10" aria-label={`Pattern: ${shown.join(" ")}, then what?`}>
				{shown.map((s, i) => (
					<span key={i} className="motion-safe:animate-[pop_300ms_ease-out_both]" style={{ animationDelay: `${i * 60}ms` }}>
						{s}
					</span>
				))}
				<span
					className={`grid place-items-center w-16 h-16 rounded-2xl border-4 ${right ? "border-emerald-400 bg-emerald-100" : "border-dashed border-amber-400 bg-amber-50"}`}
				>
					{right ? answer : "?"}
				</span>
			</div>
			<div className="flex justify-center gap-4">
				{choices.map((c) => (
					<button
						key={`${round}-${c}`}
						type="button"
						onClick={() => choose(c)}
						aria-label={c}
						className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl text-5xl bg-white shadow-md ring-2 ring-indigo-200 hover:scale-105 transition motion-reduce:transition-none ${
							wrong === c ? "motion-safe:animate-[shake_300ms] ring-rose-400" : ""
						}`}
					>
						{c}
					</button>
				))}
			</div>
		</div>
	);
}
