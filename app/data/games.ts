export type GameInfo = {
	slug: string;
	title: string;
	emoji: string;
	skill: string;
	ages: string;
	free: boolean;
	blurb: string;
	color: string;
};

export const GAMES: GameInfo[] = [
	{
		slug: "memory-match",
		title: "Memory Match",
		emoji: "🧠",
		skill: "Memory & focus",
		ages: "3–9",
		free: true,
		blurb: "Flip the cards and find every animal pair. Three levels.",
		color: "from-sky-400 to-indigo-500",
	},
	{
		slug: "math-pop",
		title: "Math Pop",
		emoji: "🎈",
		skill: "Adding & taking away",
		ages: "5–9",
		free: false,
		blurb: "Pop the balloon with the right answer before it floats away.",
		color: "from-pink-400 to-rose-500",
	},
	{
		slug: "word-builder",
		title: "Word Builder",
		emoji: "🔠",
		skill: "Spelling",
		ages: "5–8",
		free: false,
		blurb: "Tap the letters in order to spell the picture word.",
		color: "from-amber-400 to-orange-500",
	},
	{
		slug: "pattern-party",
		title: "Pattern Party",
		emoji: "🎉",
		skill: "Patterns & logic",
		ages: "4–8",
		free: false,
		blurb: "Red, blue, red, blue... what comes next? It gets trickier!",
		color: "from-emerald-400 to-teal-500",
	},
];

export const getGame = (slug: string | undefined) =>
	GAMES.find((g) => g.slug === slug);
