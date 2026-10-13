import { Link } from "react-router";
import { PLANS, SITE } from "~/config";
import { GAMES, LEVELS_PER_GAME } from "~/data/games";
import { LESSONS } from "~/data/lessons";

export function PassPitch() {
	return (
		<section className="py-8" aria-labelledby="pass-h">
			<div className="rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-8 md:p-12 grid md:grid-cols-[1.4fr_1fr] gap-8 items-center shadow-2xl">
				<div>
					<p className="font-bold text-amber-300 mb-2">🔑 {SITE.pass.name}</p>
					<h2 id="pass-h" className="text-3xl md:text-4xl font-bold mb-4">Try it free. Keep it if they love it.</h2>
					<ul className="space-y-2 text-lg">
						<li>✅ All {LESSONS.length} lessons with quizzes</li>
						<li>✅ All {GAMES.length} games and {GAMES.length * LEVELS_PER_GAME} levels, plus new ones as they're added</li>
						<li>✅ Every kid in your home</li>
						<li>✅ No ads. No chat. Cancel anytime.</li>
					</ul>
				</div>
				<div className="bg-white text-indigo-950 rounded-3xl p-6 text-center">
					<p className="text-5xl font-bold">{PLANS.monthly.price}<span className="text-xl text-slate-500">/mo</span></p>
					<p className="text-slate-600 mb-4">or {PLANS.yearly.price}/year. {SITE.pass.priceNote}</p>
					<Link to="/family-pass" className="btn-primary w-full text-xl">Try FREE for {PLANS.trialDays} days</Link>
					<p className="text-sm text-slate-500 mt-3">Then {PLANS.monthly.price}/mo. Cancel anytime. Secure checkout by Stripe.</p>
				</div>
			</div>
		</section>
	);
}
