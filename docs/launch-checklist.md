# vaïvae Launch Checklist

## Phase 0: Provider accounts

- [ ] Vercel project linked
- [ ] Medusa Cloud project provisioned (Launch+ tier)
- [ ] Sanity project created (Growth tier)
- [ ] Stripe account live mode active
- [ ] Klaviyo account configured
- [ ] Termly Pro+ subscribed
- [ ] SimpleBackups configured
- [ ] Sentry projects (storefront + Medusa) created
- [ ] PostHog project created
- [ ] Cloudflare DNS configured (A/AAAA records)
- [ ] Mux account + sample asset uploaded

## Phase 1: Env secrets

- [ ] All secrets in `.github/SECRETS.md` populated in Vercel env
- [ ] Medusa Cloud env populated
- [ ] CI GitHub secrets populated
- [ ] `KLAVIYO_NEWSLETTER_LIST_ID` set to the production newsletter list ID

## Phase 2: First migrations + seeds

- [ ] `pnpm --filter @vaivae/medusa db:migrate` run on Medusa Cloud
- [ ] `pnpm --filter @vaivae/medusa db:seed` run for Drop 01
- [ ] `pnpm --filter @vaivae/storefront sanity:seed` run with `SANITY_WRITE_TOKEN`

## Phase 3: Manual config

- [ ] Termly dashboard: brand colors + cookie banner copy
- [ ] GTM container: GA4 tag + conversions
- [ ] Klaviyo: newsletter list + abandoned cart flow
- [ ] Stripe Webhooks: point to `https://api.vaivae.com/hooks/payment/stripe_stripe`
- [ ] Mux: replace placeholder Playback ID in `homePage` with real Drop 01 hero video

## Phase 4: Lawyer review

- [ ] Privacy policy reviewed + finalized
- [ ] Terms of service reviewed + finalized
- [ ] Returns policy reviewed + finalized
- [ ] Shipping policy reviewed + finalized
- [ ] Accessibility statement reviewed
- [ ] Wholesale terms reviewed

## Phase 5: First restore drill (per ADR-015)

- [ ] SimpleBackups: trigger first manual backup
- [ ] Restore drill: confirm backup is restorable

## Phase 6: Smoke testing

- [ ] Place a test order with Stripe test card
- [ ] Verify Cloud Emails receipt arrives
- [ ] Verify Klaviyo profile created
- [ ] Verify Sanity sync created Sanity product docs
- [ ] Verify Sentry catches a deliberate error
- [ ] Verify PostHog tracks pageview after consent
- [ ] Run Lighthouse CI on production preview

## Phase 7: Go live

- [ ] Stripe live keys swapped in Medusa Cloud
- [ ] DNS cutover to `vaivae.com` / `api.vaivae.com`
- [ ] Termly cookie banner enforced
- [ ] `CSP_ENFORCE` flag flipped to `true`
