# Buzzyfly Kids

Bite-size lessons and ad-free learning games for kids ages 3 to 9, with a
one-time **Family Pass** that unlocks everything. Built with React Router 7 on
Cloudflare Workers.

## What's inside

- **Lessons** (`app/data/lessons.ts`): 8 lessons in math, reading and science. Each is a few cards plus a 3-question quiz.
- **Games** (`app/games/`): Memory Match, Math Pop, Word Builder and Pattern Party.
- **Everything is behind the paywall.** Visitors can browse the game and lesson lists, but playing anything needs the Family Pass.
- **Kid-safe:** no ads, no chat, no accounts and no tracking. Stars are saved in the browser only.

Site name, price label and the link back to buzzyfly.com live in `app/config.ts`.

## Turning on payments

Until these three secrets are set, the buy button shows "Checkout opening soon" and all games and lessons stay locked.

1. In Stripe, create a product called "Family Pass" with a **one-time** price (e.g. $19). Copy its `price_...` ID.
2. Set the secrets on the Worker:

   ```bash
   npx wrangler secret put STRIPE_SECRET_KEY   # sk_live_... (or sk_test_... to test)
   npx wrangler secret put STRIPE_PRICE_ID     # price_...
   npx wrangler secret put SESSION_SECRET      # any long random string
   ```

3. Keep `pass.price` in `app/config.ts` matching the Stripe price.

How it works:
1. A grown-up answers a times-table question and pays through Stripe Checkout.
2. Stripe sends them back to `/family-pass/success`. That page checks with Stripe that the session was paid and bought the Family Pass price.
3. It then sets a signed, year-long cookie.
4. Opening the same success link on another device unlocks that device too.

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
