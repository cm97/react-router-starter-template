import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("lessons", "routes/lessons.tsx"),
	route("lessons/:slug", "routes/lesson.tsx"),
	route("games", "routes/games.tsx"),
	route("games/:slug", "routes/game.tsx"),
	route("games/:slug/:level", "routes/game-level.tsx"),
	route("family-pass", "routes/family-pass.tsx"),
	route("family-pass/success", "routes/family-pass-success.tsx"),
	route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
