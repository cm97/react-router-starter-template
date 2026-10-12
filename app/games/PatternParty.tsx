import { useState } from "react";
import { ProgressDots } from "~/components/ui";
import { pick, shuffle } from "~/lib/progress";
import type { GameProps } from ".";
import { LevelDone } from "./LevelDone";

const SETS = [
	["🔴", "🔵", "🟡", "🟢", "🟣"],
	["🍎", "🍌", "🍇", "🍊", "🍓"],
	["🐶", "🐱", "🐭", "🐰", "🐸"],
	["⭐", "🌙", "☀️", "☁️", "⚡"],
	["🚗", "🚀", "🚲", "⛵", "🚂"],
];
// Repeating units for each pair of levels, from simple to tricky.
const BANDS = [
	["AB"],
	["AB", "AAB"],
	["AAB", "ABB"],
	["ABC"],
	["ABC", "AABB"],
	["ABCD", "AABB"],
	["ABAC", "ABCD"],
	["AABC", "ABCB"],
	["ABCDE", "AABBC"],
	["ABCDE", "ABACD", "AABCC"],
];
const ROUNDS = 6;

type Round = { shown: string[]; answer: string; choices: string[] };

function makeRounds(level: number): Round[] {
	const band = BANDS[Math.min(BANDS.length - 1, Math.floor((level - 1) / 2))];
	const choiceCount = level <= 8 ? 3 : 4;
	return Array.from({ length: ROUNDS }, () => {
		const rule = pick(band);
		const set = shuffle(pick(SETS));
		const item = (ch: string) => set[ch.charCodeAt(0) - 65];
		const seq = Array.from({ length: Math.max(6, rule.length * 2 + 1) + 1 }, (_, i) => item(rule[i % rule.length]));
		const answer = seq.pop()!;
		const others = shuffle(set.filter((s) => s !== answer)).slice(0, choiceCount - 1);
		return { shown: seq, answer, choices: shuffle([answer, ...others]) };
	});
}

export default function PatternParty({ slug, level }: GameProps) {
	const [rounds, setRounds] = useState(() => makeRounds(level));
	const [round, setRound] = useState(0);
	const [mistakes, setMistakes] = useState(0);
	const [wrong, setWrong] = useState<string | null>(null);
	const [right, setRight] = useState(false);

	const stars = mistakes <= 1 ? 3 : mistakes <= 3 ? 2 : 1;

	if (round >= ROUNDS) {
		return (
			<LevelDone
				slug={slug}
				level={level}
				stars={stars}
				message="Pattern pro!"
				onAgain={() => { setRounds(makeRounds(level)); setRound(0); setMistakes(0); }}
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
			<ProgressDots total={ROUNDS} done={round} />
			<p className="text-xl font-bold text-indigo-900 mt-6 mb-4">What comes next?</p>
			<div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-4xl sm:text-5xl mb-10" aria-label={`Pattern: ${shown.join(" ")}, then what?`}>
				{shown.map((s, i) => (
					<span key={`${round}-${i}`} className="motion-safe:animate-[pop_300ms_ease-out_both]" style={{ animationDelay: `${i * 60}ms` }}>
						{s}
					</span>
				))}
				<span
					className={`grid place-items-center w-16 h-16 rounded-2xl border-4 ${right ? "border-emerald-400 bg-emerald-100" : "border-dashed border-amber-400 bg-amber-50"}`}
				>
					{right ? answer : "?"}
				</span>
			</div>
			<div className="flex flex-wrap justify-center gap-3 sm:gap-4">
				{choices.map((c) => (
					<button
						key={`${round}-${c}`}
						type="button"
						onClick={() => choose(c)}
						aria-label={c}
						className={`w-18 h-18 sm:w-24 sm:h-24 rounded-3xl text-5xl bg-white shadow-md ring-2 ring-indigo-200 hover:scale-105 transition motion-reduce:transition-none ${
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
