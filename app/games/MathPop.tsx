import { useEffect, useState } from "react";
import { ProgressDots, WinScreen } from "~/components/ui";
import { saveStars, shuffle } from "~/lib/progress";

const ROUNDS = 10;
const COLORS = ["bg-rose-400", "bg-sky-400", "bg-amber-400", "bg-violet-400"];
const LANES = [6, 30, 54, 78];
const rand = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

type Round = { text: string; answer: number; choices: number[]; speeds: number[] };

function makeRound(i: number): Round {
	let a: number, b: number, answer: number, text: string;
	if (i < 4) {
		a = rand(1, 5); b = rand(1, 5); answer = a + b; text = `${a} + ${b}`;
	} else if (i < 7) {
		a = rand(3, 10); b = rand(1, a); answer = a - b; text = `${a} − ${b}`;
	} else {
		a = rand(5, 12); b = rand(2, 8); answer = a + b; text = `${a} + ${b}`;
	}
	const wrong = new Set<number>();
	while (wrong.size < 3) {
		const w = answer + rand(-3, 3);
		if (w !== answer && w >= 0) wrong.add(w);
	}
	return {
		text,
		answer,
		choices: shuffle([answer, ...wrong]),
		speeds: LANES.map(() => rand(7, 10)),
	};
}

export default function MathPop() {
	const [round, setRound] = useState(0);
	const [q, setQ] = useState(() => makeRound(0));
	const [popped, setPopped] = useState<number[]>([]);
	const [missed, setMissed] = useState(false);
	const [score, setScore] = useState(0);
	const [feedback, setFeedback] = useState<string | null>(null);

	const done = round >= ROUNDS;
	const stars = score >= 9 ? 3 : score >= 6 ? 2 : 1;

	useEffect(() => {
		if (done) saveStars("game:math-pop", stars);
	}, [done, stars]);

	function next() {
		const n = round + 1;
		setRound(n);
		setPopped([]);
		setMissed(false);
		if (n < ROUNDS) setQ(makeRound(n));
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

	if (done) {
		return (
			<WinScreen
				stars={stars}
				message={`You popped ${score} of ${ROUNDS}!`}
				onAgain={() => { setRound(0); setScore(0); setPopped([]); setMissed(false); setQ(makeRound(0)); }}
				nextHref="/games"
				nextLabel="More games"
			/>
		);
	}

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
							style={{ left: `${LANES[i]}%`, animationDuration: `${q.speeds[i]}s` }}
							className={`balloon ${COLORS[i]} absolute w-[18%] min-w-14 aspect-[4/5] rounded-[50%] text-white text-3xl font-extrabold shadow-lg ring-4 ring-white/50 hover:brightness-110`}
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
