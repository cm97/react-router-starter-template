import { data, Form, Link, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/family-pass";
import { SITE } from "~/config";
import { GAMES } from "~/data/games";
import { LESSONS } from "~/data/lessons";
import { createCheckout, hasPass, paymentsReady } from "~/lib/pass.server";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: `${SITE.pass.name} | ${SITE.name}` },
		{ name: "description", content: `Unlock every lesson and game for the whole family. ${SITE.pass.priceNote}` },
	];
}

const rand = () => 6 + Math.floor(Math.random() * 4);

export async function loader({ request, context }: Route.LoaderArgs) {
	const env = context.cloudflare.env;
	return {
		pass: await hasPass(request, env),
		ready: paymentsReady(env),
		gate: { a: rand(), b: rand() },
	};
}

export async function action({ request, context }: Route.ActionArgs) {
	const env = context.cloudflare.env;
	if (!paymentsReady(env)) return data({ error: "Checkout isn't open yet. Please check back soon." }, { status: 503 });
	const form = await request.formData();
	const a = Number(form.get("a"));
	const b = Number(form.get("b"));
	const answer = Number(String(form.get("answer") ?? "").trim());
	if (!(a >= 6 && a <= 9 && b >= 6 && b <= 9) || answer !== a * b) {
		return data({ error: "That's not quite right. Grown-ups, please try again." }, { status: 400 });
	}
	try {
		return redirect(await createCheckout(env, new URL(request.url).origin));
	} catch (err) {
		console.error("Stripe checkout failed", err);
		return data({ error: "We couldn't open checkout. Please try again in a minute." }, { status: 502 });
	}
}

export default function FamilyPass({ loaderData, actionData }: Route.ComponentProps) {
	const { pass, ready, gate } = loaderData;
	const busy = useNavigation().state !== "idle";

	if (pass) {
		return (
			<div className="card max-w-lg mx-auto mt-10 p-8 text-center">
				<div className="text-6xl mb-3" aria-hidden>🎉</div>
				<h1 className="text-3xl font-bold text-indigo-950 mb-2">You have the {SITE.pass.name}!</h1>
				<p className="text-slate-600 mb-6">Every lesson and game is unlocked on this device.</p>
				<div className="flex flex-wrap gap-3 justify-center">
					<Link to="/games" className="btn-primary">Play games</Link>
					<Link to="/lessons" className="btn-secondary">Start a lesson</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="grid lg:grid-cols-2 gap-8 py-8 items-start">
			<section>
				<p className="font-bold text-amber-600">For parents and grown-ups</p>
				<h1 className="text-4xl sm:text-5xl font-bold text-indigo-950 mt-1 mb-4">
					One pass. Every game. Every kid.
				</h1>
				<p className="text-lg text-slate-700 mb-6">
					The {SITE.pass.name} unlocks all {LESSONS.length} lessons and all {GAMES.length} games for everyone in your home.
					New games are included when they're added. You pay once and that's it.
				</p>
				<ul className="space-y-3 text-lg">
					<li>✅ <b>No ads</b>, so nobody is selling to your kids.</li>
					<li>✅ <b>No chat</b>, so strangers can't reach them.</li>
					<li>✅ <b>No accounts</b>, so there's no data about your kids.</li>
					<li>✅ <b>No subscription</b>, so no surprise charges.</li>
				</ul>
			</section>

			<section className="card p-6 sm:p-8" aria-labelledby="buy-h">
				<h2 id="buy-h" className="sr-only">Buy the {SITE.pass.name}</h2>
				<p className="text-center text-6xl font-bold text-indigo-950">{SITE.pass.price}</p>
				<p className="text-center text-slate-600 mb-6">{SITE.pass.priceNote}</p>

				{ready ? (
					<Form method="post" className="space-y-4">
						<input type="hidden" name="a" value={gate.a} />
						<input type="hidden" name="b" value={gate.b} />
						<label className="block">
							<span className="block font-bold text-indigo-950 mb-1">
								🔒 Grown-ups only: what is {gate.a} × {gate.b}?
							</span>
							<input
								name="answer"
								inputMode="numeric"
								autoComplete="off"
								required
								className="w-full min-h-12 rounded-xl border-2 border-indigo-200 px-4 text-xl"
							/>
						</label>
						{actionData?.error && (
							<p className="text-rose-700 font-bold" role="alert">{actionData.error}</p>
						)}
						<button type="submit" disabled={busy} className="btn-primary w-full">
							{busy ? "Opening secure checkout..." : `Unlock everything for ${SITE.pass.price}`}
						</button>
					</Form>
				) : (
					<div className="text-center">
						<button type="button" disabled className="btn-primary w-full">Checkout opening soon</button>
						<p className="mt-3 text-slate-600">
							Until then, enjoy the free lessons and <Link to="/games/memory-match" className="underline font-bold">Memory Match</Link>.
						</p>
					</div>
				)}

				<p className="text-sm text-slate-500 mt-4 text-center">
					Secure payment by Stripe. After you pay, you'll get a private link that unlocks the pass on any of your devices.
				</p>
			</section>
		</div>
	);
}
