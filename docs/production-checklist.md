# BubbleBud Production Checklist

BubbleBud is wired for real ecommerce services. Complete this checklist before sending paid traffic.

## Required Services

1. Create a Supabase project and run `supabase/schema.sql`.
2. Configure Supabase Auth providers:
   - Email/password with email verification enabled.
   - Google OAuth.
   - Apple OAuth.
3. Create a Stripe account and enable desired payment methods in the Stripe Dashboard:
   - Cards.
   - Apple Pay.
   - Google Pay.
   - PayPal if available for the account/region.
4. Add the Stripe webhook endpoint:
   - `https://bubblebud.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`.
5. Create and verify a Resend sending domain for `bubblebud.app`.
6. Deploy to a server runtime such as Vercel. GitHub Pages cannot run the API routes.

## Required Environment Variables

Copy `.env.example` to `.env.local` for local testing and add the same variables to production hosting.

Never expose:
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`

## Admin Access

Set `BUBBLEBUD_ADMIN_EMAILS` to the owner email addresses. Only matching authenticated users can access admin API responses.
