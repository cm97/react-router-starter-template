import {
	isRouteErrorResponse,
	Link,
	Links,
	Meta,
	NavLink,
	Outlet,
	Scripts,
	ScrollRestoration,
	useRouteLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import { SITE } from "./config";
import { MovingBackground } from "./components/MovingBackground";
import { hasPass } from "./lib/pass.server";
import "./app.css";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@400..700&display=swap",
	},
	{
		rel: "icon",
		href: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐝</text></svg>",
	},
];

export async function loader({ request, context }: Route.LoaderArgs) {
	return { pass: await hasPass(request, context.cloudflare.env) };
}

function Header() {
	const data = useRouteLoaderData<typeof loader>("root");
	const nav = ({ isActive }: { isActive: boolean }) =>
		`px-3 py-2 rounded-full font-bold ${isActive ? "bg-indigo-100 text-indigo-800" : "text-indigo-900 hover:bg-white"}`;
	return (
		<header className="max-w-6xl mx-auto w-full px-4 py-3 flex flex-wrap items-center gap-2 justify-between">
			<Link to="/" className="flex items-center gap-2 text-2xl font-bold text-indigo-900 min-h-12">
				<span className="motion-safe:animate-[bob_3s_ease-in-out_infinite]" aria-hidden>🐝</span>
				{SITE.name}
			</Link>
			<nav className="flex items-center gap-1 text-lg" aria-label="Main">
				<NavLink to="/lessons" className={nav}>Lessons</NavLink>
				<NavLink to="/games" className={nav}>Games</NavLink>
				{data?.pass ? (
					<span className="ml-1 px-3 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-base">✓ {SITE.pass.name}</span>
				) : (
					<Link to="/family-pass" className="ml-1 btn-primary !min-h-11 !px-4 !text-base">Free trial</Link>
				)}
			</nav>
		</header>
	);
}

function Footer() {
	return (
		<footer className="mt-16 border-t border-amber-200 bg-white/60">
			<div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-600 flex flex-col sm:flex-row gap-3 justify-between">
				<p>
					{SITE.name} is made by{" "}
					<a href={SITE.parentSite.url} className="font-bold text-indigo-700 underline">
						{SITE.parentSite.name}
					</a>
					. No ads. No chat. No tracking.
				</p>
				<nav className="flex gap-4" aria-label="Footer">
					<Link to="/lessons" className="underline">Lessons</Link>
					<Link to="/games" className="underline">Games</Link>
					<Link to="/family-pass" className="underline">For parents</Link>
				</nav>
			</div>
		</footer>
	);
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="min-h-screen flex flex-col">
				<MovingBackground />
				<a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:m-2 focus:p-3 focus:bg-white focus:rounded-xl">
					Skip to content
				</a>
				<Header />
				<main id="main" className="flex-1 w-full max-w-6xl mx-auto px-4">
					{children}
				</main>
				<Footer />
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "Something went wrong. Let's head back.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "Page not found" : "Oops!";
		details =
			error.status === 404
				? "This page flew away like a bee. 🐝"
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<div className="text-center py-16">
			<h1 className="text-4xl font-extrabold text-indigo-900 mb-3">{message}</h1>
			<p className="text-xl mb-8">{details}</p>
			<Link to="/" className="btn-primary">Go home</Link>
			{stack && (
				<pre className="text-left w-full p-4 mt-8 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</div>
	);
}
