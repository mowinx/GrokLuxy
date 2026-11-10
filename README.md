# Luxy Affiliate System

Next.js + Supabase affiliate platform for referring car owners.

## Setup

1. Create a Supabase project
2. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase keys
4. `npm install`
5. `npm run dev`

## Deploy to Vercel

1. Push this folder to a GitHub repository
2. Import the repo in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Pages

- `/` — Affiliate landing + signup
- `/dashboard` — Affiliate dashboard
- `/onboard?ref=CODE` — Car owner onboarding
- `/admin` — Successful registrations (admin)

## Notes

- Payment integration to be added (currently marks as unpaid until payment succeeds)
- Auth to be wired for real affiliate login (currently demo)
- Update payment status to 'paid' after successful payment to appear in admin
Payment integrated with Selfany. Update payment_status to paid on success message.
