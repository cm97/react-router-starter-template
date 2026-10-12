import { useEffect, useState } from "react";
import { data, Link } from "react-router";
import type { Route } from "./+types/game-level";
import { Locked } from "~/components/ui";
import { SITE } from "~/config";
import { getGame, LEVELS_PER_GAME } from "~/data/games";
import { GAME_COMPONENTS } from "~/games";
import { hasPass } from "~/lib/pass.server";
import { isLevelOpen } from "~/lib/progress";

export async function loader({ params, request, context }: Route.LoaderArgs) {
	const game = getGame(params.slug);
	const level = Number(params.level);
	if (!game || !Number.isInteger(level) || level < 1 || level > LEVELS_PER_GAME) {
		throw data(null, { status: 404 });
	}
	const open = game.free || (await hasPass(request, context.cloudflare.env));
	return { game, level, open };
}

export function meta({ data }: Route.MetaArgs) {
	return [
		{ title: `${data?.game.title ?? "Game"} level ${data?.level ?? ""} | ${SITE.name}` },
		{ name: "description", content: data?.game.blurb },
	];
}

export default function GameLevel({ loaderData }: Route.ComponentProps) {
	const { game, level, open } = loaderData;
	const Game = GAME_COMPONENTS[game.slug];
	// Games shuffle with Math.random and read progress from the browser,
	// so they only render after hydration.
	const [state, setState] = useState<"loading" | "play" | "locked">("loading");
	useEffect(() => setState(isLevelOpen(game.slug, level) ? "play" : "locked"), [game.slug, level]);

	return (
		<div className="max-w-3xl mx-auto py-6">
			<Link to={`/games/${game.slug}`} className="inline-flex min-h-11 items-center font-bold text-indigo-700">
				← Level map
			</Link>
			{!open ? (
				<div className="mt-6"><Locked title={game.title} emoji={game.emoji} /></div>
			) : (
				<div className="card p-4 sm:p-8 mt-2">
					<h1 className="text-center text-3xl font-bold text-indigo-950 mb-1">
						{game.emoji} {game.title}
					</h1>
					<p className="text-center font-bold text-amber-600 mb-6">Level {level} of {LEVELS_PER_GAME}</p>
					{state === "play" && <Game key={`${game.slug}-${level}`} slug={game.slug} level={level} />}
					{state === "loading" && <div className="h-80" aria-busy="true" />}
					{state === "locked" && (
						<div className="text-center py-10">
							<div className="text-6xl mb-3" aria-hidden>🔒</div>
							<p className="text-xl font-bold text-indigo-950 mb-4">Beat level {level - 1} to unlock this one!</p>
							<Link to={`/games/${game.slug}/${level - 1}`} className="btn-primary">Play level {level - 1}</Link>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
