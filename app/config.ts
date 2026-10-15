// Site-wide settings. Change the name, prices or parent link here.
// The real prices are whatever the Stripe prices cost, so keep these
// labels in sync with STRIPE_PRICE_MONTHLY and STRIPE_PRICE_YEARLY.
export const SITE = {
	name: "Buzzyfly Kids",
	tagline: "Learn something. Play something. Smile a lot.",
	description:
		"Bite-size lessons and bright, ad-free learning games for kids ages 3 to 9.",
	parentSite: { name: "Buzzyfly", url: "https://buzzyfly.com" },
	pass: {
		name: "Family Plan",
		price: "$9.99/mo",
		priceNote: "7-day free trial. Cancel anytime.",
	},
} as const;

export type PlanId = "monthly" | "yearly";

export const PLANS = {
	trialDays: 7,
	monthly: { label: "Monthly", price: "$9.99", per: "month", note: "Billed monthly" },
	yearly: { label: "Yearly", price: "$79", per: "year", note: "Just $6.58/month. Save 34%" },
} as const;

// Stripe Payment Links for the Family Plan. These are public buy.stripe.com
// links, not secrets, so they live here. With both set, the plan buttons
// work without any Stripe secrets on the Worker. In each link's settings,
// turn on a 7-day free trial and set "After payment" to redirect to
// https://kids.buzzyfly.com/family-pass/success?session_id={CHECKOUT_SESSION_ID}
export const PAYMENT_LINKS: Record<PlanId, string> = {
	monthly: "",
	yearly: "",
};

// Stripe's no-code customer portal login link (billing.stripe.com/p/login/...),
// where parents on a Payment Link plan manage or cancel. Optional.
export const CUSTOMER_PORTAL_URL = "";
