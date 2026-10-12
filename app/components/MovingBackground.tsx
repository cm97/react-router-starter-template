// A soft, slowly moving backdrop: drifting color glows plus a few
// friendly things floating up the screen. Pure CSS (transform and
// opacity only), so it stays cheap. It holds still for anyone who
// prefers reduced motion (see .scene-* rules in app.css).

const GLOWS = [
	{ className: "bg-sky-300 top-[-10%] left-[-10%] w-[55vmax] h-[55vmax]", delay: "0s" },
	{ className: "bg-pink-300 top-[30%] right-[-15%] w-[50vmax] h-[50vmax]", delay: "-8s" },
	{ className: "bg-amber-300 bottom-[-15%] left-[20%] w-[45vmax] h-[45vmax]", delay: "-16s" },
	{ className: "bg-emerald-200 top-[10%] left-[40%] w-[35vmax] h-[35vmax]", delay: "-4s" },
];

const FLOATERS = [
	{ emoji: "🐝", left: "6%", size: "text-3xl", duration: "26s", delay: "0s" },
	{ emoji: "⭐", left: "18%", size: "text-2xl", duration: "32s", delay: "-12s" },
	{ emoji: "🎈", left: "32%", size: "text-4xl", duration: "28s", delay: "-20s" },
	{ emoji: "☁️", left: "48%", size: "text-5xl", duration: "40s", delay: "-6s" },
	{ emoji: "🦋", left: "62%", size: "text-3xl", duration: "30s", delay: "-16s" },
	{ emoji: "✨", left: "74%", size: "text-2xl", duration: "24s", delay: "-3s" },
	{ emoji: "🎈", left: "86%", size: "text-3xl", duration: "34s", delay: "-25s" },
	{ emoji: "⭐", left: "94%", size: "text-xl", duration: "29s", delay: "-9s" },
];

export function MovingBackground() {
	return (
		<div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
			{GLOWS.map((g, i) => (
				<span
					key={i}
					className={`scene-glow absolute rounded-full blur-3xl opacity-40 ${g.className}`}
					style={{ animationDelay: g.delay }}
				/>
			))}
			{FLOATERS.map((f, i) => (
				<span
					key={i}
					className={`scene-floater absolute bottom-0 opacity-60 ${f.size}`}
					style={{ left: f.left, animationDuration: f.duration, animationDelay: f.delay }}
				>
					{f.emoji}
				</span>
			))}
		</div>
	);
}
