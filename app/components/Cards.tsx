import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { GameInfo } from "~/data/games";
import type { Lesson } from "~/data/lessons";
import { getStars } from "~/lib/progress";
import { StarRow, Tag } from "./ui";

function useStars(id: string) {
	const [n, setN] = useState(0);
	useEffect(() => setN(getStars(id)), [id]);
	return n;
}

export function GameCard({ game, unlocked }: { game: GameInfo; unlocked: boolean }) {
	const stars = useStars(`game:${game.slug}`);
	const open = game.free || unlocked;
	return (
		<Link
			to={`/games/${game.slug}`}
			className="card overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition motion-reduce:transition-none"
		>
			<div className={`bg-gradient-to-br ${game.color} h-32 grid place-items-center text-7xl relative`}>
				<span className="group-hover:scale-110 transition motion-reduce:transition-none" aria-hidden>{game.emoji}</span>
				{!open && <span className="absolute top-3 right-3 text-2xl" aria-hidden>🔒</span>}
			</div>
			<div className="p-4">
				<div className="flex items-center justify-between gap-2 mb-1">
					<h3 className="text-xl font-bold text-indigo-950">{game.title}</h3>
					<Tag free={game.free} />
				</div>
				<p className="text-slate-600 mb-2">{game.blurb}</p>
				<div className="flex items-center justify-between text-sm text-slate-500">
					<span>{game.skill} · Ages {game.ages}</span>
					{stars > 0 && <StarRow n={stars} size="text-base" />}
				</div>
			</div>
		</Link>
	);
}

const SUBJECT_COLORS: Record<Lesson["subject"], string> = {
	Math: "bg-sky-100 text-sky-900",
	Reading: "bg-pink-100 text-pink-900",
	Science: "bg-emerald-100 text-emerald-900",
};

export function LessonCard({ lesson, unlocked }: { lesson: Lesson; unlocked: boolean }) {
	const stars = useStars(`lesson:${lesson.slug}`);
	const open = lesson.free || unlocked;
	return (
		<Link
			to={`/lessons/${lesson.slug}`}
			className="card p-4 flex gap-4 items-start hover:-translate-y-1 hover:shadow-xl transition motion-reduce:transition-none"
		>
			<span className={`shrink-0 grid place-items-center w-16 h-16 rounded-2xl text-4xl ${SUBJECT_COLORS[lesson.subject]}`} aria-hidden>
				{lesson.emoji}
			</span>
			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center gap-2 mb-1">
					<h3 className="text-lg font-bold text-indigo-950">{lesson.title}</h3>
					{!open && <span aria-label="Locked">🔒</span>}
				</div>
				<p className="text-slate-600 text-sm mb-2">{lesson.blurb}</p>
				<div className="flex flex-wrap items-center gap-2 text-xs">
					<span className={`rounded-full px-2 py-0.5 font-bold ${SUBJECT_COLORS[lesson.subject]}`}>{lesson.subject}</span>
					<span className="text-slate-500">Ages {lesson.ages}</span>
					<Tag free={lesson.free} />
					{stars > 0 && <StarRow n={stars} size="text-sm" />}
				</div>
			</div>
		</Link>
	);
}
