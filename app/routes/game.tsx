import { useEffect, useState } from "react";
import { data, Link } from "react-router";
import type { Route } from "./+types/game";
import { Locked } from "~/components/ui";
import { SITE } from "~/config";
import { getGame } from "~/data/games";
import { GAME_COMPONENTS } from "~/games";
import { hasPass } from "~/lib/pass.server";

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

export default function GamePage({ loaderData }: Route.ComponentProps) {
	const { game, open } = loaderData;
	const Game = GAME_COMPONENTS[game.slug];
	// Games shuffle with Math.random, so they only render in the browser.
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	return (
		<div className="max-w-3xl mx-auto py-6">
			<Link to="/games" className="inline-flex min-h-11 items-center font-bold text-indigo-700">← All games</Link>
			{open ? (
				<div className="card p-4 sm:p-8 mt-2">
					<h1 className="text-center text-3xl font-bold text-indigo-950 mb-1">
						{game.emoji} {game.title}
					</h1>
					<p className="text-center text-slate-500 mb-6">{game.blurb}</p>
					{mounted ? <Game key={game.slug} /> : <div className="h-80" aria-busy="true" />}
				</div>
			) : (
				<div className="mt-6"><Locked title={game.title} emoji={game.emoji} /></div>
			)}
		</div>
	);
}
