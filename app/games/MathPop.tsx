import { useState } from "react";
import { ProgressDots } from "~/components/ui";
import { pick, rand, shuffle } from "~/lib/progress";
import type { GameProps } from ".";
import { LevelDone } from "./LevelDone";

const ROUNDS = 8;
const COLORS = ["bg-rose-400", "bg-sky-400", "bg-amber-400", "bg-violet-400"];
const LANES: Record<number, number[]> = { 3: [10, 41, 72], 4: [6, 30, 54, 78] };

type Round = { text: string; answer: number; choices: number[]; speeds: number[] };

// Each band of levels teaches the next skill, from tiny sums to times tables.
function question(level: number): [string, number] {
	if (level <= 3) {
		const a = rand(1, 2 + level), b = rand(1, 2 + level);
		return [`${a} + ${b}`, a + b];
	}
	if (level <= 6) {
		const a = rand(3, 10), b = rand(1, a);
		return [`${a} − ${b}`, a - b];
	}
	if (level <= 9) {
		const a = rand(4, 12), b = rand(2, 20 - a);
		return [`${a} + ${b}`, a + b];
	}
	if (level <= 12) {
		const a = rand(8, 20), b = rand(1, Math.min(9, a));
		return Math.random() < 0.5 ? [`${a} − ${b}`, a - b] : [`${a - b} + ${b}`, a];
	}
	if (level <= 15) {
		const t = rand(1, 8) * 10, o = rand(1, 9);
		return [`${t} + ${o}`, t + o];
	}
	if (level <= 17) {
		// Two-digit numbers with no carrying or borrowing: each column stays 0–9.
		const t1 = rand(1, 8), t2 = rand(1, 9 - t1), o1 = rand(0, 9), o2 = rand(0, 9 - o1);
		const a = t1 * 10 + o1, b = t2 * 10 + o2;
		return Math.random() < 0.5 ? [`${a + b} − ${b}`, a] : [`${a} + ${b}`, a + b];
	}
	const tables = level === 18 ? [2, 5, 10] : level === 19 ? [2, 3, 4, 5, 10] : [2, 3, 4, 5, 6, 7, 8, 9];
	const a = pick(tables), b = rand(1, 10);
	return [`${a} × ${b}`, a * b];
}

function makeRound(level: number): Round {
	const [text, answer] = question(level);
	const count = level <= 5 ? 3 : 4;
	const spread = answer > 20 ? 10 : 3;
	const wrong = new Set<number>();
	while (wrong.size < count - 1) {
		const w = answer + rand(-spread, spread);
		if (w !== answer && w >= 0) wrong.add(w);
	}
	// Balloons float faster as levels go up: about 10s at level 1, 6s at level 20.
	const base = 10.5 - level * 0.22;
	return {
		text,
		answer,
		choices: shuffle([answer, ...wrong]),
		speeds: Array.from({ length: count }, () => base + Math.random() * 1.5),
	};
}

export default function MathPop({ slug, level }: GameProps) {
	const [round, setRound] = useState(0);
	const [q, setQ] = useState(() => makeRound(level));
	const [popped, setPopped] = useState<number[]>([]);
	const [missed, setMissed] = useState(false);
	const [score, setScore] = useState(0);
	const [feedback, setFeedback] = useState<string | null>(null);

	const stars = score >= ROUNDS - 1 ? 3 : score >= ROUNDS - 3 ? 2 : 1;

	function next() {
		const n = round + 1;
		setRound(n);
		setPopped([]);
		setMissed(false);
		if (n < ROUNDS) setQ(makeRound(level));
	}

	function restart() {
		setRound(0);
		setScore(0);
		setPopped([]);
		setMissed(false);
		setQ(makeRound(level));
	}

	function tap(value: number, idx: number) {
		if (feedback) return;
		if (value === q.answer) {
			if (!missed) setScore((s) => s + 1);
			setFeedback("🎉 Pop! You got it!");
			setTimeout(() => { setFeedback(null); next(); }, 700);
		} else {
			setMissed(true);
			setPopped((p) => [...p, idx]);
		}
	}

	function floatedAway(value: number) {
		if (value !== q.answer || feedback) return;
		setFeedback(`It floated away! ${q.text} = ${q.answer}`);
		setTimeout(() => { setFeedback(null); next(); }, 1600);
	}

	if (round >= ROUNDS) {
		return (
			<LevelDone slug={slug} level={level} stars={stars} message={`You popped ${score} of ${ROUNDS}!`} onAgain={restart} />
		);
	}

	const lanes = LANES[q.choices.length];
	return (
		<div>
			<ProgressDots total={ROUNDS} done={round} />
			<p className="text-center text-5xl font-extrabold text-indigo-900 my-4" aria-live="polite">
				{q.text} = ?
			</p>
			<div className="relative h-80 sm:h-96 overflow-hidden rounded-3xl bg-gradient-to-b from-sky-200 to-sky-50">
				<span className="absolute top-6 left-6 text-4xl opacity-70" aria-hidden>☁️</span>
				<span className="absolute top-16 right-8 text-3xl opacity-60" aria-hidden>☁️</span>
				{q.choices.map((c, i) =>
					popped.includes(i) ? null : (
						<button
							key={`${round}-${i}`}
							type="button"
							onClick={() => tap(c, i)}
							onAnimationEnd={() => floatedAway(c)}
							style={{ left: `${lanes[i]}%`, animationDuration: `${q.speeds[i]}s` }}
							className={`balloon ${COLORS[i]} absolute w-[18%] min-w-14 aspect-[4/5] rounded-[50%] text-white ${c > 99 ? "text-2xl" : "text-3xl"} font-extrabold shadow-lg ring-4 ring-white/50 hover:brightness-110`}
						>
							{c}
						</button>
					),
				)}
				{feedback && (
					<div className="absolute inset-0 grid place-items-center bg-white/70 text-2xl font-extrabold text-indigo-900 text-center px-4">
						{feedback}
					</div>
				)}
			</div>
			<p className="text-center text-sm text-slate-500 mt-3">Tap the balloon with the right answer.</p>
		</div>
	);
}
