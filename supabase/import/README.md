# BubbleBud Supabase CSV Imports

Import these files into Supabase after running `supabase/schema.sql`.

## Import order

1. `products.csv` into the `public.products` table.
2. `discounts.csv` into the `public.discounts` table, if you want starter coupon codes.

Do not import fake orders or reviews for production. Orders are created by Stripe/PayPal webhooks after confirmed payment, and reviews are allowed only after paid delivered orders.

Supabase Auth creates users/profiles through the `handle_new_user` trigger when customers sign up.
