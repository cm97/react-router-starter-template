# Buzzyfly Kids

Bite-size lessons and ad-free learning games for kids ages 3 to 9, with a
**Family Plan** subscription that unlocks everything. Built with React Router 7 on
Cloudflare Workers.

## What's inside

- **Lessons** (`app/data/lessons.ts`): 8 lessons in math, reading and science. Each is a few cards plus a 3-question quiz.
- **Games** (`app/games/`): Memory Match, Math Pop, Word Builder and Pattern Party, each with 20 levels that unlock one at a time. Difficulty settings for each level live at the top of each game file.
- **Everything is behind the paywall.** Visitors can browse the game and lesson lists, but playing anything needs the Family Plan.
- **Kid-safe:** no ads, no chat, no accounts and no tracking. Stars are saved in the browser only.

Site name, price label and the link back to buzzyfly.com live in `app/config.ts`.

## Where it runs

The app is served at **buzzyfly.com/kids**. The main Buzzyfly Worker
(cm97/astro-blog-starter-template) forwards every `/kids/*` request here
through a service binding named `KIDS`. Because of that:

- Routes and built files live under `/kids` (`basename` in `react-router.config.ts`, `assetsDir` in `vite.config.ts`).
- The old address, kids.buzzyfly.com, redirects to the same page on buzzyfly.com/kids. A parent's Family Plan cookie is carried over once, so paying families stay unlocked.
- Deploy this Worker **before** the main site when both change, so `/kids` never points at an older build.

## Turning on payments

The Family Plan is a Stripe subscription: $9.99/month or $79/year, with a
7-day free trial. Until the secrets below are set, the buy button shows
"Free trial opening soon" and all games and lessons stay locked.

1. In Stripe, create a product called "Family Plan" with two **recurring** prices: $9.99 monthly and $79 yearly. Copy both `price_...` IDs.
2. In Stripe, open **Settings → Billing → Customer portal** and save it once. That page is where parents manage or cancel.
3. Set the secrets on the Worker:

   ```bash
   npx wrangler secret put STRIPE_SECRET_KEY      # sk_live_... (or sk_test_... to test)
   npx wrangler secret put STRIPE_PRICE_MONTHLY   # price_... for $9.99/month
   npx wrangler secret put STRIPE_PRICE_YEARLY    # price_... for $79/year
   npx wrangler secret put SESSION_SECRET         # any long random string
   ```

4. If you change the prices, update `PLANS` and `pass.price` in `app/config.ts` to match.

How it works:
1. A grown-up picks a plan, answers a times-table question, and starts a trial through Stripe Checkout.
2. `/family-pass/success` checks with Stripe that the subscription is trialing or active, then sets a signed cookie holding the subscription ID.
3. On each visit the site checks that subscription's status with Stripe, cached for up to 6 hours (on a custom domain; Cloudflare skips the cache on `*.workers.dev`, so there every page view asks Stripe). Cancelled or unpaid plans lock again.
4. Opening the same success link on another device unlocks that device too.
5. "Manage or cancel your plan" on `/family-pass` opens Stripe's customer portal.

Locked lesson content is never sent to the browser. Paid games are checked on the server before they render.

## Deploying

GitHub Actions deploys the site. Every push to `main` builds it and runs
`wrangler deploy` (`.github/workflows/deploy.yml`). Pull requests get a build
and typecheck (`ci.yml`). It needs two repository secrets (Settings → Secrets
and variables → Actions):

- `CLOUDFLARE_API_TOKEN`: a Cloudflare API token from the "Edit Cloudflare Workers" template
- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID

If you use this, turn off Cloudflare's own Git builds for the Worker
(Settings → Build) so the two don't both deploy.

## Development

```bash
npm install
cp .dev.vars.example .dev.vars   # optional, only to test payments
npm run dev                      # http://localhost:5173
npm run typecheck
npm run deploy
```
