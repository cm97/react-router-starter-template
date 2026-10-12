import { useEffect, useState } from "react";
import { data, Link } from "react-router";
import type { Route } from "./+types/game";
import { Locked } from "~/components/ui";
import { SITE } from "~/config";
import { getGame, LEVELS_PER_GAME } from "~/data/games";
import { hasPass } from "~/lib/pass.server";
import { gameStars } from "~/lib/progress";

export async function loader({ params, request, context }: Route.LoaderArgs) {
	const game = getGame(params.slug);
	if (!game) throw data(null, { status: 404 });
	const open = game.free || (await hasPass(request, context.cloudflare.env));
	return { game, open };
}

export function meta({ data }: Route.MetaArgs) {
	return [
		{ title: `${data?.game.title ?? "Game"} | ${SITE.name}` },
		{ name: "description", content: data?.game.blurb },
	];
}

// The level map: 20 levels, each unlocked by beating the one before it.
export default function GamePage({ loaderData }: Route.ComponentProps) {
	const { game, open } = loaderData;
	// Stars live in the browser, so read them after hydration.
	const [stars, setStars] = useState<number[] | null>(null);
	useEffect(() => setStars(gameStars(game.slug, LEVELS_PER_GAME)), [game.slug]);

	if (!open) {
		return (
			<div className="max-w-3xl mx-auto py-6">
				<Link to="/games" className="inline-flex min-h-11 items-center font-bold text-indigo-700">← All games</Link>
				<div className="mt-6"><Locked title={game.title} emoji={game.emoji} /></div>
			</div>
		);
	}

	const total = stars?.reduce((a, b) => a + b, 0) ?? 0;
	const nextUp = stars ? Math.min(LEVELS_PER_GAME, stars.findIndex((s) => s === 0) + 1 || LEVELS_PER_GAME) : 1;

	return (
		<div className="max-w-3xl mx-auto py-6">
			<Link to="/games" className="inline-flex min-h-11 items-center font-bold text-indigo-700">← All games</Link>
			<div className={`rounded-3xl bg-gradient-to-br ${game.color} text-white p-6 sm:p-8 mt-2 mb-6 shadow-lg`}>
				<div className="flex items-center gap-4">
					<span className="text-6xl" aria-hidden>{game.emoji}</span>
					<div>
						<h1 className="text-3xl sm:text-4xl font-bold">{game.title}</h1>
						<p className="opacity-90">{game.skill} · Ages {game.ages}</p>
					</div>
				</div>
				<div className="flex flex-wrap items-center justify-between gap-3 mt-5">
					<p className="font-bold text-lg">⭐ {total} / {LEVELS_PER_GAME * 3} stars</p>
					<Link to={`/games/${game.slug}/${nextUp}`} className="inline-flex items-center min-h-12 px-6 rounded-full bg-white text-indigo-900 text-lg font-bold shadow">
						▶ Play level {nextUp}
					</Link>
				</div>
			</div>

			<h2 className="text-2xl font-bold text-indigo-950 mb-3">Levels</h2>
			<ol className="grid grid-cols-4 sm:grid-cols-5 gap-3">
				{Array.from({ length: LEVELS_PER_GAME }, (_, i) => {
					const level = i + 1;
					const s = stars?.[i] ?? 0;
					const unlocked = level === 1 || (stars?.[i - 1] ?? 0) > 0;
					const tile = "aspect-square rounded-2xl grid place-items-center content-center gap-1 font-bold shadow-sm";
					return (
						<li key={level}>
							{unlocked ? (
								<Link
									to={`/games/${game.slug}/${level}`}
									aria-label={`Level ${level}, ${s} stars`}
									className={`${tile} ${s ? "bg-white ring-2 ring-amber-300" : "bg-indigo-600 text-white"} hover:scale-105 transition motion-reduce:transition-none`}
								>
									<span className="text-2xl">{level}</span>
									<span className="text-xs leading-none" aria-hidden>
										{[1, 2, 3].map((n) => (n <= s ? "⭐" : "☆")).join("")}
									</span>
								</Link>
							) : (
								<span aria-label={`Level ${level}, locked`} className={`${tile} bg-indigo-100 text-indigo-300`}>
									<span className="text-2xl">{level}</span>
									<span className="text-sm" aria-hidden>🔒</span>
								</span>
							)}
						</li>
					);
				})}
			</ol>
			<p className="text-sm text-slate-500 mt-4">Beat a level to unlock the next one. Stars are saved on this device.</p>
		</div>
	);
}
