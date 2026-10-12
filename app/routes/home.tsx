import { Link, useRouteLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { GameCard, LessonCard } from "~/components/Cards";
import { SITE } from "~/config";
import { GAMES } from "~/data/games";
import { LESSONS } from "~/data/lessons";
import type { loader as rootLoader } from "~/root";
import { PassPitch } from "~/components/PassPitch";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: `${SITE.name} | Learning games and lessons for kids` },
		{ name: "description", content: SITE.description },
	];
}

const PROMISES = [
	["🚫📺", "No ads", "Not one. Ever."],
	["🔐", "No chat", "Kids can't talk to strangers here."],
	["🙈", "No tracking", "No accounts. No data about your kids."],
	["💳", "Pay once", `${SITE.pass.price} for the whole family. No subscription.`],
];

const FAQ = [
	["What ages is this for?", "Ages 3 to 9. Every lesson and game shows its age range so you can pick the right one."],
	["What do we get for free?", "Two full lessons and the Memory Match game. Try them before you buy anything."],
	["What does the Family Pass unlock?", "Every lesson and every game on the site, for every kid in your home. New games are included as they're added."],
	["Is it a subscription?", `No. It's a one-time ${SITE.pass.price} payment through Stripe. You will never be charged again.`],
	["Do my kids need an account?", "No. There are no accounts and no sign-ups. Stars are saved on your device only."],
	["Does it work on a phone or tablet?", "Yes. Everything is built for little fingers on phones, tablets and computers."],
];

export default function Home() {
	const root = useRouteLoaderData<typeof rootLoader>("root");
	const pass = root?.pass ?? false;
	return (
		<>
			<section className="grid md:grid-cols-2 gap-8 items-center py-8 md:py-16">
				<div>
					<p className="inline-block rounded-full bg-white px-4 py-1 font-bold text-amber-700 shadow-sm mb-4">
						Ages 3–9 · Ad-free · Kid-safe
					</p>
					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-indigo-950 leading-tight">
						Screen time that makes them <span className="text-amber-500">smarter.</span>
					</h1>
					<p className="text-xl text-slate-700 mt-4 max-w-lg">
						Short lessons and bright, joyful games for counting, reading, spelling and science.
						Kids think they're playing. You know they're learning.
					</p>
					<div className="flex flex-wrap gap-3 mt-6">
						<Link to="/games/memory-match" className="btn-primary">▶ Play free now</Link>
						<Link to="/lessons" className="btn-secondary">See the lessons</Link>
					</div>
					<p className="text-sm text-slate-500 mt-3">No sign-up. Free games start instantly.</p>
				</div>
				<div className="relative grid grid-cols-2 gap-4" aria-hidden>
					{GAMES.map((g, i) => (
						<div
							key={g.slug}
							className={`bg-gradient-to-br ${g.color} rounded-3xl aspect-square grid place-items-center text-7xl shadow-xl motion-safe:animate-[bob_4s_ease-in-out_infinite] ${i % 2 ? "translate-y-6" : ""}`}
							style={{ animationDelay: `${i * 0.6}s` }}
						>
							{g.emoji}
						</div>
					))}
				</div>
			</section>

			<section className="py-8" aria-labelledby="games-h">
				<div className="flex items-end justify-between mb-4">
					<h2 id="games-h" className="text-3xl font-bold text-indigo-950">🎮 Games</h2>
					<Link to="/games" className="font-bold text-indigo-700 underline">All games</Link>
				</div>
				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{GAMES.map((g) => <GameCard key={g.slug} game={g} unlocked={pass} />)}
				</div>
			</section>

			<section className="py-8" aria-labelledby="lessons-h">
				<div className="flex items-end justify-between mb-4">
					<h2 id="lessons-h" className="text-3xl font-bold text-indigo-950">📚 Lessons</h2>
					<Link to="/lessons" className="font-bold text-indigo-700 underline">All lessons</Link>
				</div>
				<div className="grid md:grid-cols-2 gap-4">
					{LESSONS.slice(0, 4).map((l) => <LessonCard key={l.slug} lesson={l} unlocked={pass} />)}
				</div>
			</section>

			<section className="py-12" aria-labelledby="parents-h">
				<h2 id="parents-h" className="text-3xl font-bold text-indigo-950 text-center mb-2">Made for kids. Built for parents.</h2>
				<p className="text-center text-slate-600 mb-8 text-lg">Everything you'd want from a kids' site, and nothing you wouldn't.</p>
				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{PROMISES.map(([icon, title, text]) => (
						<div key={title} className="card p-5 text-center">
							<div className="text-4xl mb-2" aria-hidden>{icon}</div>
							<h3 className="text-xl font-bold text-indigo-950">{title}</h3>
							<p className="text-slate-600">{text}</p>
						</div>
					))}
				</div>
			</section>

			{!pass && <PassPitch />}

			<section className="py-12 max-w-3xl mx-auto" aria-labelledby="faq-h">
				<h2 id="faq-h" className="text-3xl font-bold text-indigo-950 text-center mb-6">Questions parents ask</h2>
				<div className="space-y-3">
					{FAQ.map(([q, a]) => (
						<details key={q} className="card p-5 group">
							<summary className="cursor-pointer text-lg font-bold text-indigo-950 list-none flex justify-between gap-4 min-h-11 items-center">
								{q}
								<span className="text-indigo-400 group-open:rotate-45 transition motion-reduce:transition-none" aria-hidden>＋</span>
							</summary>
							<p className="mt-2 text-slate-700">{a}</p>
						</details>
					))}
				</div>
			</section>
		</>
	);
}
