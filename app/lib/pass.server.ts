// Family Pass: one-time Stripe Checkout payment, remembered with a signed
// cookie. No accounts and no stored data about kids.

const COOKIE = "family_pass";
const ONE_YEAR = 60 * 60 * 24 * 365;
const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]+$/;

export function paymentsReady(env: Env): boolean {
	return Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_PRICE_ID && env.SESSION_SECRET);
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

export async function hasPass(request: Request, env: Env): Promise<boolean> {
	if (!env.SESSION_SECRET) return false;
	const cookie = request.headers.get("Cookie") ?? "";
	const match = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
	if (!match) return false;
	const [version, expires, sig] = match[1].split(".");
	if (version !== "v1" || !expires || !sig) return false;
	if (Number(expires) < Date.now() / 1000) return false;
	return timingSafeEqual(sig, await sign(env.SESSION_SECRET, `v1.${expires}`));
}

export async function passCookie(env: Env): Promise<string> {
	const expires = Math.floor(Date.now() / 1000) + ONE_YEAR;
	const sig = await sign(env.SESSION_SECRET!, `v1.${expires}`);
	return `${COOKIE}=v1.${expires}.${sig}; Path=/; Max-Age=${ONE_YEAR}; HttpOnly; Secure; SameSite=Lax`;
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

export async function createCheckout(env: Env, origin: string): Promise<string> {
	const session = await stripe(
		env,
		"checkout/sessions",
		new URLSearchParams({
			mode: "payment",
			"line_items[0][price]": env.STRIPE_PRICE_ID!,
			"line_items[0][quantity]": "1",
			allow_promotion_codes: "true",
			success_url: `${origin}/family-pass/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${origin}/family-pass`,
		}),
	);
	return session.url as string;
}

// A session only unlocks the pass if it was paid AND it bought the Family
// Pass price, so other purchases on the same Stripe account don't count.
export async function verifyCheckout(env: Env, sessionId: string | null): Promise<boolean> {
	if (!sessionId || !SESSION_ID.test(sessionId)) return false;
	try {
		const session = await stripe(
			env,
			`checkout/sessions/${sessionId}?expand[]=line_items`,
		);
		const paid =
			session.payment_status === "paid" ||
			session.payment_status === "no_payment_required";
		const boughtPass = (session.line_items?.data ?? []).some(
			(item: any) => item.price?.id === env.STRIPE_PRICE_ID,
		);
		return paid && boughtPass;
	} catch {
		return false;
	}
}
