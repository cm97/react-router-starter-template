import { createRequestHandler } from "react-router";
import { BASE_PATH, PUBLIC_ORIGIN } from "~/config";
import { handoffCookie, rawPassCookie } from "~/lib/pass.server";

declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
	}
}

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

const OLD_HOST = "kids.buzzyfly.com";
const HANDOFF = "pass_handoff";

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		// The kids app moved from kids.buzzyfly.com to buzzyfly.com/kids.
		// Keep old links (and in-flight Stripe returns) working, and carry
		// a Family Plan cookie over so paying families stay unlocked.
		if (url.hostname === OLD_HOST) {
			const target = new URL(`${BASE_PATH}${url.pathname === "/" ? "" : url.pathname}${url.search}`, PUBLIC_ORIGIN);
			const pass = rawPassCookie(request);
			if (pass) target.searchParams.set(HANDOFF, pass);
			return new Response(null, {
				status: pass ? 302 : 301,
				headers: { Location: target.toString(), "Cache-Control": "no-store" },
			});
		}

		// Requests arriving through buzzyfly.com's service binding may skip the
		// static-asset layer, so serve built files explicitly.
		if (url.pathname.startsWith(`${BASE_PATH}/assets/`)) return env.ASSETS.fetch(request);

		const handoff = url.searchParams.get(HANDOFF);
		if (handoff !== null) {
			url.searchParams.delete(HANDOFF);
			const headers = new Headers({ Location: url.pathname + url.search, "Cache-Control": "no-store" });
			const cookie = await handoffCookie(env, handoff);
			if (cookie) headers.set("Set-Cookie", cookie);
			return new Response(null, { status: 302, headers });
		}

		return requestHandler(request, {
			cloudflare: { env, ctx },
		});
	},
} satisfies ExportedHandler<Env>;
