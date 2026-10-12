import { data, Link } from "react-router";
import type { Route } from "./+types/family-pass-success";
import { SITE } from "~/config";
import { passCookie, paymentsReady, verifyCheckout } from "~/lib/pass.server";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: `Welcome to the ${SITE.pass.name} | ${SITE.name}` },
		{ name: "robots", content: "noindex" },
	];
}

// The Stripe success URL lands here. Opening this same link again (for
// example on a tablet) re-checks the payment and unlocks that device too.
export async function loader({ request, context }: Route.LoaderArgs) {
	const env = context.cloudflare.env;
	const url = new URL(request.url);
	const ok = paymentsReady(env) && (await verifyCheckout(env, url.searchParams.get("session_id")));
	if (!ok) return { ok: false as const, link: null };
	return data(
		{ ok: true as const, link: url.toString() },
		{ headers: { "Set-Cookie": await passCookie(env), "Cache-Control": "no-store" } },
	);
}

export default function Success({ loaderData }: Route.ComponentProps) {
	if (!loaderData.ok) {
		return (
			<div className="card max-w-lg mx-auto mt-10 p-8 text-center">
				<h1 className="text-3xl font-bold text-indigo-950 mb-2">We couldn't confirm that payment</h1>
				<p className="text-slate-600 mb-6">
					If you just paid, wait a moment and refresh this page. If it still doesn't work, reply to your Stripe receipt email and we'll sort it out.
				</p>
				<Link to="/family-pass" className="btn-primary">Back to the {SITE.pass.name}</Link>
			</div>
		);
	}

	return (
		<div className="card max-w-xl mx-auto mt-10 p-8 text-center">
			<div className="text-7xl mb-3" aria-hidden>🎉</div>
			<h1 className="text-3xl sm:text-4xl font-bold text-indigo-950 mb-2">Thank you! Everything is unlocked.</h1>
			<p className="text-lg text-slate-700 mb-6">Every lesson and every game is ready to play on this device.</p>
			<div className="rounded-2xl bg-amber-50 ring-2 ring-amber-200 p-4 text-left mb-6">
				<p className="font-bold text-indigo-950 mb-1">📌 Save this page's link</p>
				<p className="text-slate-700 text-sm mb-2">
					Open it on your other phones, tablets or computers to unlock them too. Keep it private, like a key.
				</p>
				<code className="block text-xs break-all bg-white rounded-lg p-2">{loaderData.link}</code>
			</div>
			<div className="flex flex-wrap gap-3 justify-center">
				<Link to="/games" className="btn-primary">Play games</Link>
				<Link to="/lessons" className="btn-secondary">Start a lesson</Link>
			</div>
		</div>
	);
}
