// Stars earned are kept on this device only. Nothing is sent to a server.
const KEY = "bk-stars";

type Stars = Record<string, number>;

function read(): Stars {
	try {
		return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Stars;
	} catch {
		return {};
	}
}

export function getStars(id: string): number {
	return read()[id] ?? 0;
}

export function saveStars(id: string, stars: number) {
	try {
		const all = read();
		if (stars > (all[id] ?? 0)) {
			all[id] = stars;
			localStorage.setItem(KEY, JSON.stringify(all));
		}
	} catch {
		// Private mode or storage blocked. Progress just isn't saved.
	}
}

export function shuffle<T>(items: T[]): T[] {
	const a = [...items];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

export const levelKey = (slug: string, level: number) => `game:${slug}:${level}`;

/** Stars for each level of a game, index 0 = level 1. */
export function gameStars(slug: string, levels: number): number[] {
	const all = read();
	return Array.from({ length: levels }, (_, i) => all[levelKey(slug, i + 1)] ?? 0);
}

/** Level 1 is always open; each later level opens once the one before it is beaten. */
export function isLevelOpen(slug: string, level: number): boolean {
	return level <= 1 || getStars(levelKey(slug, level - 1)) > 0;
}

export const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];
export const rand = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
