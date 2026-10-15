import { data, Form, Link, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/family-pass";
import { BASE_PATH, CUSTOMER_PORTAL_URL, PLANS, SITE, type PlanId } from "~/config";
import { GAMES, LEVELS_PER_GAME } from "~/data/games";
import { LESSONS } from "~/data/lessons";
import {
	checkoutReady,
	createCheckout,
	hasPass,
	paymentLink,
	paymentsReady,
	portalUrl,
	subscriptionId,
} from "~/lib/pass.server";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: `${SITE.pass.name} | ${SITE.name}` },
		{ name: "description", content: `Unlock every lesson, game and level for the whole family. ${SITE.pass.priceNote}` },
	];
}

const rand = () => 6 + Math.floor(Math.random() * 4);

export async function loader({ request, context }: Route.LoaderArgs) {
	const env = context.cloudflare.env;
	return {
		pass: await hasPass(request, env),
		ready: checkoutReady(env),
		gate: { a: rand(), b: rand() },
	};
}

export async function action({ request, context }: Route.ActionArgs) {
	const env = context.cloudflare.env;
	if (!checkoutReady(env)) return data({ error: "Checkout isn't open yet. Please check back soon." }, { status: 503 });
	const form = await request.formData();
	const origin = new URL(request.url).origin;

	if (form.get("intent") === "manage") {
		if (!paymentsReady(env)) {
			if (CUSTOMER_PORTAL_URL) return redirect(CUSTOMER_PORTAL_URL);
			return data({ error: "Use the link in your Stripe receipt email to manage or cancel your plan." }, { status: 404 });
		}
		const subId = await subscriptionId(request, env);
		const url = subId ? await portalUrl(env, subId, `${origin}${BASE_PATH}/family-pass`).catch(() => null) : null;
		if (url) return redirect(url);
		return data({ error: "We couldn't open your billing page. Use the link in your Stripe receipt email." }, { status: 502 });
	}

	const a = Number(form.get("a"));
	const b = Number(form.get("b"));
	const answer = Number(String(form.get("answer") ?? "").trim());
	if (!(a >= 6 && a <= 9 && b >= 6 && b <= 9) || answer !== a * b) {
		return data({ error: "That's not quite right. Grown-ups, please try again." }, { status: 400 });
	}
	const plan: PlanId = form.get("plan") === "monthly" ? "monthly" : "yearly";
	// No Stripe secrets on the Worker: send the grown-up to the Payment Link.
	if (!paymentsReady(env)) return redirect(paymentLink(plan));
	try {
		return redirect(await createCheckout(env, origin, plan));
	} catch (err) {
		console.error("Stripe checkout failed", err);
		return data({ error: "We couldn't open checkout. Please try again in a minute." }, { status: 502 });
	}
}

const totalLevels = GAMES.length * LEVELS_PER_GAME;

export default function FamilyPass({ loaderData, actionData }: Route.ComponentProps) {
	const { pass, ready, gate } = loaderData;
	const busy = useNavigation().state !== "idle";

	if (pass) {
		return (
			<div className="card max-w-lg mx-auto mt-10 p-8 text-center">
				<div className="text-6xl mb-3" aria-hidden>🎉</div>
				<h1 className="text-3xl font-bold text-indigo-950 mb-2">You're on the {SITE.pass.name}!</h1>
				<p className="text-slate-600 mb-6">Every lesson, game and level is unlocked on this device.</p>
				<div className="flex flex-wrap gap-3 justify-center mb-6">
					<Link to="/games" className="btn-primary">Play games</Link>
					<Link to="/lessons" className="btn-secondary">Start a lesson</Link>
				</div>
				<Form method="post">
					<input type="hidden" name="intent" value="manage" />
					<button type="submit" disabled={busy} className="underline text-slate-600 min-h-11">
						Manage or cancel your plan
					</button>
				</Form>
				{actionData?.error && <p className="text-rose-700 font-bold mt-2" role="alert">{actionData.error}</p>}
			</div>
		);
	}

	return (
		<div className="grid lg:grid-cols-2 gap-8 py-8 items-start">
			<section>
				<p className="font-bold text-amber-600">For parents and grown-ups</p>
				<h1 className="text-4xl sm:text-5xl font-bold text-indigo-950 mt-1 mb-4">
					Every game. Every level. Every kid.
				</h1>
				<p className="text-lg text-slate-700 mb-6">
					The {SITE.pass.name} unlocks all {LESSONS.length} lessons and {totalLevels} game levels for everyone in your home.
					New games and levels are included as they're added.
				</p>
				<ul className="space-y-3 text-lg">
					<li>✅ <b>Try it free for {PLANS.trialDays} days.</b> You won't be charged until the trial ends.</li>
					<li>✅ <b>Cancel anytime</b> online. No phone calls, no hoops.</li>
					<li>✅ <b>No ads</b>, so nobody is selling to your kids.</li>
					<li>✅ <b>No chat</b>, so strangers can't reach them.</li>
					<li>✅ <b>No accounts</b>, so there's no data about your kids.</li>
				</ul>
			</section>

			<section className="card p-6 sm:p-8" aria-labelledby="buy-h">
				<h2 id="buy-h" className="text-2xl font-bold text-indigo-950 text-center mb-4">Pick your plan</h2>

				{ready ? (
					<Form method="post" className="space-y-4">
						<fieldset className="grid gap-3">
							<legend className="sr-only">Plan</legend>
							{(["yearly", "monthly"] as const).map((id) => {
								const p = PLANS[id];
								return (
									<label
										key={id}
										className="relative flex items-center gap-4 rounded-2xl border-2 border-indigo-100 p-4 cursor-pointer has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50"
									>
										<input type="radio" name="plan" value={id} defaultChecked={id === "yearly"} className="w-5 h-5 accent-indigo-600" />
										<span className="flex-1">
											<span className="block font-bold text-indigo-950 text-lg">{p.label}</span>
											<span className="block text-sm text-slate-600">{p.note}</span>
										</span>
										<span className="text-right">
											<span className="block text-2xl font-bold text-indigo-950">{p.price}</span>
											<span className="block text-sm text-slate-500">per {p.per}</span>
										</span>
										{id === "yearly" && (
											<span className="absolute -top-3 right-4 rounded-full bg-amber-400 text-indigo-950 text-xs font-bold px-3 py-1">Best value</span>
										)}
									</label>
								);
							})}
						</fieldset>
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
							{busy ? "Opening secure checkout..." : `Start your ${PLANS.trialDays}-day free trial`}
						</button>
					</Form>
				) : (
					<div className="text-center">
						<p className="text-5xl font-bold text-indigo-950">{PLANS.monthly.price}<span className="text-xl text-slate-500">/month</span></p>
						<p className="text-slate-600 mb-4">or {PLANS.yearly.price}/year</p>
						<button type="button" disabled className="btn-primary w-full">Free trial opening soon</button>
						<p className="mt-3 text-slate-600">
							Please check back soon. Meanwhile, see every <Link to="/games" className="underline font-bold">game</Link> and <Link to="/lessons" className="underline font-bold">lesson</Link> you'll get.
						</p>
					</div>
				)}

				<p className="text-sm text-slate-500 mt-4 text-center">
					Secure payment by Stripe. Card required to start the trial. Cancel before day {PLANS.trialDays} and you won't be charged.
				</p>
			</section>
		</div>
	);
}
