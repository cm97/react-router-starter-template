import { useEffect, useState } from "react";
import type { Lesson } from "~/data/lessons";
import { ProgressDots, WinScreen } from "./ui";
import { saveStars } from "~/lib/progress";

export function LessonPlayer({ lesson, nextHref }: { lesson: Lesson; nextHref?: string }) {
	const [step, setStep] = useState(0);
	const [picked, setPicked] = useState<string | null>(null);
	const [mistakes, setMistakes] = useState(0);

	const cards = lesson.cards.length;
	const total = cards + lesson.quiz.length;
	const done = step >= total;
	const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;

	useEffect(() => {
		if (done) saveStars(`lesson:${lesson.slug}`, stars);
	}, [done, lesson.slug, stars]);

	if (done) {
		return (
			<WinScreen
				stars={stars}
				message="Lesson complete!"
				onAgain={() => { setStep(0); setMistakes(0); setPicked(null); }}
				nextHref={nextHref ?? "/lessons"}
				nextLabel={nextHref ? "Next lesson" : "All lessons"}
			/>
		);
	}

	if (step < cards) {
		const card = lesson.cards[step];
		return (
			<div className="text-center">
				<ProgressDots total={total} done={step} />
				<div key={step} className="my-8 motion-safe:animate-[pop_350ms_ease-out]">
					<div className="text-6xl sm:text-7xl leading-tight mb-6 break-words" aria-hidden>{card.big}</div>
					<p className="text-2xl font-semibold text-indigo-950 max-w-xl mx-auto">{card.text}</p>
				</div>
				<div className="flex justify-center gap-3">
					{step > 0 && (
						<button type="button" onClick={() => setStep(step - 1)} className="btn-secondary">
							Back
						</button>
					)}
					<button type="button" onClick={() => setStep(step + 1)} className="btn-primary">
						{step === cards - 1 ? "Quiz time! 🎯" : "Next"}
					</button>
				</div>
			</div>
		);
	}

	const q = lesson.quiz[step - cards];
	const correct = picked === q.answer;

	function choose(c: string) {
		if (correct) return;
		setPicked(c);
		if (c === q.answer) {
			setTimeout(() => { setPicked(null); setStep((s) => s + 1); }, 900);
		} else {
			setMistakes((m) => m + 1);
		}
	}

	return (
		<div className="text-center">
			<ProgressDots total={total} done={step} />
			<p className="text-sm font-bold uppercase tracking-wide text-amber-600 mt-6">Quiz</p>
			<h2 className="text-3xl font-extrabold text-indigo-950 mt-1">{q.q}</h2>
			{q.show && <div className="text-6xl my-6">{q.show}</div>}
			<div className="flex flex-wrap justify-center gap-3 mt-6" aria-live="polite">
				{q.choices.map((c) => (
					<button
						key={c}
						type="button"
						onClick={() => choose(c)}
						className={`min-w-28 min-h-16 px-5 rounded-2xl text-2xl font-extrabold shadow-md ring-2 transition motion-reduce:transition-none ${
							picked === c
								? correct
									? "bg-emerald-100 ring-emerald-500 text-emerald-800"
									: "bg-rose-50 ring-rose-400 text-rose-700 motion-safe:animate-[shake_300ms]"
								: "bg-white ring-indigo-200 text-indigo-900 hover:bg-indigo-50"
						}`}
					>
						{c}
					</button>
				))}
			</div>
			<p className="h-8 mt-4 text-xl font-bold">
				{picked && (correct ? <span className="text-emerald-700">Yes! 🎉</span> : <span className="text-rose-600">Not quite. Try again!</span>)}
			</p>
		</div>
	);
}
