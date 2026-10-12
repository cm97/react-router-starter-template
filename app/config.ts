// Site-wide settings. Change the name, price label or parent link here.
// The real price is whatever STRIPE_PRICE_ID costs in Stripe, so keep
// passPrice in sync with it.
export const SITE = {
	name: "Buzzyfly Kids",
	tagline: "Learn something. Play something. Smile a lot.",
	description:
		"Bite-size lessons and bright, ad-free learning games for kids ages 3 to 9.",
	parentSite: { name: "Buzzyfly", url: "https://buzzyfly.com" },
	pass: {
		name: "Family Pass",
		price: "$19",
		priceNote: "One-time payment. No subscription.",
	},
} as const;
