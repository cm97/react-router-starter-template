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
