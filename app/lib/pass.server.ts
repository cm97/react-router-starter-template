// Family Plan: a Stripe subscription (monthly or yearly, with a free
// trial), remembered with a signed cookie holding the subscription ID.
// The subscription's status is re-checked with Stripe at most every few
// hours, so cancelled or unpaid plans lock again. No accounts and no
// stored data about kids.

import { PLANS, type PlanId } from "~/config";

const COOKIE = "family_plan";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;
const STATUS_TTL = 60 * 60 * 6;
const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]+$/;
const SUB_ID = /^sub_[A-Za-z0-9]+$/;
// past_due keeps access while Stripe retries the card.
const ACTIVE = new Set(["trialing", "active", "past_due"]);

export function paymentsReady(env: Env): boolean {
	return Boolean(
		env.STRIPE_SECRET_KEY && env.STRIPE_PRICE_MONTHLY && env.STRIPE_PRICE_YEARLY && env.SESSION_SECRET,
	);
}

function priceFor(env: Env, plan: PlanId): string {
	return plan === "yearly" ? env.STRIPE_PRICE_YEARLY! : env.STRIPE_PRICE_MONTHLY!;
}

async function sign(secret: string, data: string): Promise<string> {
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
	return btoa(String.fromCharCode(...new Uint8Array(mac)))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}

async function stripe(env: Env, path: string, body?: URLSearchParams) {
	const res = await fetch(`https://api.stripe.com/v1/${path}`, {
		method: body ? "POST" : "GET",
		headers: {
			Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
			...(body && { "Content-Type": "application/x-www-form-urlencoded" }),
		},
		body,
	});
	const json = (await res.json()) as Record<string, any>;
	if (!res.ok) throw new Error(json.error?.message ?? `Stripe ${res.status}`);
	return json;
}

/** The signed-in subscription ID from the cookie, if the signature is valid. */
export async function subscriptionId(request: Request, env: Env): Promise<string | null> {
	if (!env.SESSION_SECRET) return null;
	const cookie = request.headers.get("Cookie") ?? "";
	const match = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
	if (!match) return null;
	const [version, subId, sig] = match[1].split(".");
	if (version !== "v2" || !subId || !sig || !SUB_ID.test(subId)) return null;
	return timingSafeEqual(sig, await sign(env.SESSION_SECRET, `v2.${subId}`)) ? subId : null;
}

type SubInfo = { active: boolean; customer: string | null };

// Cached per subscription in the Workers cache so most page views
// don't call Stripe.
async function subscriptionInfo(env: Env, subId: string): Promise<SubInfo> {
	const cacheKey = new Request(`https://family-plan.internal/sub/${subId}`);
	const cache = (caches as unknown as { default: Cache }).default;
	const hit = await cache.match(cacheKey);
	if (hit) return (await hit.json()) as SubInfo;

	let info: SubInfo = { active: false, customer: null };
	try {
		const sub = await stripe(env, `subscriptions/${subId}`);
		const prices = new Set([env.STRIPE_PRICE_MONTHLY, env.STRIPE_PRICE_YEARLY]);
		const ourPlan = (sub.items?.data ?? []).some((i: any) => prices.has(i.price?.id));
		info = { active: ourPlan && ACTIVE.has(sub.status), customer: sub.customer ?? null };
	} catch (err) {
		// Don't cache errors; try Stripe again next time.
		console.error("Stripe subscription check failed", err);
		return info;
	}
	await cache.put(
		cacheKey,
		new Response(JSON.stringify(info), { headers: { "Cache-Control": `max-age=${STATUS_TTL}` } }),
	);
	return info;
}

export async function hasPass(request: Request, env: Env): Promise<boolean> {
	if (!paymentsReady(env)) return false;
	const subId = await subscriptionId(request, env);
	return subId ? (await subscriptionInfo(env, subId)).active : false;
}

export async function passCookie(env: Env, subId: string): Promise<string> {
	const sig = await sign(env.SESSION_SECRET!, `v2.${subId}`);
	return `${COOKIE}=v2.${subId}.${sig}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`;
}

export async function createCheckout(env: Env, origin: string, plan: PlanId): Promise<string> {
	const session = await stripe(
		env,
		"checkout/sessions",
		new URLSearchParams({
			mode: "subscription",
			"line_items[0][price]": priceFor(env, plan),
			"line_items[0][quantity]": "1",
			"subscription_data[trial_period_days]": String(PLANS.trialDays),
			allow_promotion_codes: "true",
			success_url: `${origin}/family-pass/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${origin}/family-pass`,
		}),
	);
	return session.url as string;
}

/** Returns the subscription ID if this Checkout session started a live Family Plan. */
export async function verifyCheckout(env: Env, sessionId: string | null): Promise<string | null> {
	if (!sessionId || !SESSION_ID.test(sessionId)) return null;
	try {
		const session = await stripe(env, `checkout/sessions/${sessionId}`);
		const subId = typeof session.subscription === "string" ? session.subscription : null;
		if (session.mode !== "subscription" || session.status !== "complete" || !subId) return null;
		return (await subscriptionInfo(env, subId)).active ? subId : null;
	} catch {
		return null;
	}
}

/** A Stripe customer-portal link where parents manage or cancel their plan. */
export async function portalUrl(env: Env, subId: string, returnUrl: string): Promise<string | null> {
	const { customer } = await subscriptionInfo(env, subId);
	if (!customer) return null;
	const portal = await stripe(
		env,
		"billing_portal/sessions",
		new URLSearchParams({ customer, return_url: returnUrl }),
	);
	return portal.url as string;
}
