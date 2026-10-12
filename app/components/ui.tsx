import { Link } from "react-router";
import { SITE } from "~/config";

export function StarRow({ n, size = "text-4xl" }: { n: number; size?: string }) {
	return (
		<span className={size} role="img" aria-label={`${n} out of 3 stars`}>
			{[1, 2, 3].map((i) => (
				<span key={i} className={i <= n ? "" : "opacity-20 grayscale"}>
					⭐
				</span>
			))}
		</span>
	);
}

export function WinScreen({
	stars,
	message,
	onAgain,
	nextHref,
	nextLabel,
}: {
	stars: number;
	message: string;
	onAgain: () => void;
	nextHref?: string;
	nextLabel?: string;
}) {
	return (
		<div className="text-center py-8 motion-safe:animate-[pop_400ms_ease-out]">
			<div className="text-7xl mb-2" aria-hidden>
				🎉
			</div>
			<h2 className="text-3xl font-extrabold text-indigo-900">{message}</h2>
			<div className="my-4">
				<StarRow n={stars} size="text-5xl" />
			</div>
			<div className="flex flex-wrap gap-3 justify-center">
				<button type="button" onClick={onAgain} className="btn-primary">
					Play again
				</button>
				{nextHref && (
					<Link to={nextHref} className="btn-secondary">
						{nextLabel ?? "Next"}
					</Link>
				)}
			</div>
		</div>
	);
}

export function ProgressDots({ total, done }: { total: number; done: number }) {
	return (
		<div className="flex gap-1.5 justify-center" aria-label={`Round ${Math.min(done + 1, total)} of ${total}`}>
			{Array.from({ length: total }, (_, i) => (
				<span
					key={i}
					className={`h-3 w-3 rounded-full ${i < done ? "bg-amber-400" : "bg-indigo-100"}`}
				/>
			))}
		</div>
	);
}

export function Locked({ title, emoji }: { title: string; emoji: string }) {
	return (
		<div className="card text-center p-8 max-w-lg mx-auto">
			<div className="text-6xl mb-3" aria-hidden>
				{emoji}🔒
			</div>
			<h1 className="text-2xl font-extrabold text-indigo-900 mb-2">{title} is part of the {SITE.pass.name}</h1>
			<p className="text-slate-600 mb-6">
				Ask a grown-up to unlock every lesson and every game, for every kid in the house.
			</p>
			<Link to="/family-pass" className="btn-primary">
				Start your free trial
			</Link>
			<p className="mt-3 text-sm text-slate-500">{SITE.pass.priceNote}</p>
		</div>
	);
}

export function Tag({ free }: { free: boolean }) {
	return free ? (
		<span className="rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1">FREE</span>
	) : (
		<span className="rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1">🔑 Family Plan</span>
	);
}
