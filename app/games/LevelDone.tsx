import { useEffect } from "react";
import { Link } from "react-router";
import { StarRow } from "~/components/ui";
import { LEVELS_PER_GAME } from "~/data/games";
import { levelKey, saveStars } from "~/lib/progress";

export function LevelDone({
	slug,
	level,
	stars,
	message,
	onAgain,
}: {
	slug: string;
	level: number;
	stars: number;
	message: string;
	onAgain: () => void;
}) {
	useEffect(() => saveStars(levelKey(slug, level), stars), [slug, level, stars]);
	const last = level >= LEVELS_PER_GAME;
	return (
		<div className="text-center py-8 motion-safe:animate-[pop_400ms_ease-out]">
			<div className="text-7xl mb-2" aria-hidden>
				{last ? "🏆" : "🎉"}
			</div>
			<p className="font-bold text-amber-600">Level {level} complete</p>
			<h2 className="text-3xl font-extrabold text-indigo-900">{last ? "You beat every level!" : message}</h2>
			<div className="my-4">
				<StarRow n={stars} size="text-5xl" />
			</div>
			<div className="flex flex-wrap gap-3 justify-center">
				{!last && (
					<Link to={`/games/${slug}/${level + 1}`} className="btn-primary">
						Next level ▶
					</Link>
				)}
				<button type="button" onClick={onAgain} className="btn-secondary">
					{stars < 3 ? "Try for 3 stars" : "Play again"}
				</button>
				<Link to={`/games/${slug}`} className="btn-secondary">
					Level map
				</Link>
			</div>
		</div>
	);
}
