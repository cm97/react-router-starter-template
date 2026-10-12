// Secrets set with `wrangler secret put`. They are not in wrangler.json,
// so `wrangler types` does not generate them.
interface Env {
	STRIPE_SECRET_KEY?: string;
	STRIPE_PRICE_MONTHLY?: string;
	STRIPE_PRICE_YEARLY?: string;
	SESSION_SECRET?: string;
}
