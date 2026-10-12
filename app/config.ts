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
