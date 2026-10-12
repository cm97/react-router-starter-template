import { useRouteLoaderData } from "react-router";
import type { Route } from "./+types/games";
import { GameCard } from "~/components/Cards";
import { SITE } from "~/config";
import { GAMES } from "~/data/games";
import type { loader as rootLoader } from "~/root";
import { PassPitch } from "~/components/PassPitch";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: `Games | ${SITE.name}` },
		{ name: "description", content: "Ad-free learning games for kids: memory, math, spelling and patterns." },
	];
}

export default function Games() {
	const pass = useRouteLoaderData<typeof rootLoader>("root")?.pass ?? false;
	return (
		<>
			<h1 className="text-4xl font-bold text-indigo-950 mt-6">🎮 Games</h1>
			<p className="text-lg text-slate-600 mb-6">Pick a game and play. Beat your best to earn more stars.</p>
			<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				{GAMES.map((g) => <GameCard key={g.slug} game={g} unlocked={pass} />)}
			</div>
			{!pass && <PassPitch />}
		</>
	);
}
