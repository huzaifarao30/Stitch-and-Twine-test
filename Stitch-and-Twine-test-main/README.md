# Stitch and Twine

A modern handmade crochet e-commerce platform built with Next.js App Router, TypeScript, and Supabase.

Live site: https://stitchandtwinecrochet.com

## Overview

Stitch and Twine is a full-stack monorepo application (frontend + backend in one Next.js project) focused on handcrafted crochet products.

The platform includes:

- Public storefront with categories, product pages, cart, wishlist, and order flows
- Customer authentication with email/password and OTP-based verification/recovery
- Admin dashboard for products, categories, sliders, coupons, orders, reports, reviews, and settings
- Supabase-backed data, auth, storage, and realtime-triggered UI refresh behavior

## Core Features

- Animated, responsive storefront UI
- Custom order and contact experience
- Persistent user cart and wishlist
- Order tracking and status management
- Admin-only content management sections
- OTP workflows for signup verification and password reset
- Image upload pipeline with client-side compression

## Tech Stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript 5
- Styling: Tailwind CSS 4
- UI/Animation: Framer Motion, Radix UI (Dialog), Lucide React
- Backend layer: Next.js route handlers under src/app/api
- Database/Auth/Storage/Realtime: Supabase
- Analytics: @vercel/analytics, @vercel/speed-insights
- Deployment: Netlify (with @netlify/plugin-nextjs)

## Project Structure

```text
src/
	app/
		api/                  # Backend route handlers
		admin/                # Admin dashboard pages
		product/              # Product detail routes
		shop/                 # Storefront listing
		cart/ wishlist/ etc.
	components/
		layout/               # Navbar, Footer, client layout
		ui/                   # Reusable UI components
	context/                # Auth, Cart, Wishlist, Order providers
	services/               # Data services for entities
	utils/supabase/         # Supabase client/server/admin helpers
supabase-schema.sql       # Database schema + RLS policies
```

## Environment Variables

Create a .env.local file in project root.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
BREVO_API_KEY=your_brevo_api_key
```

Notes:

- Never expose SUPABASE_SERVICE_ROLE_KEY in client-side code.
- Keep all secrets in environment configuration on your hosting platform.

## Local Development

Prerequisites:

- Node.js 18+ (LTS recommended)
- npm

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Open http://localhost:3000

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Database Setup (Supabase)

1. Create a Supabase project.
2. Open SQL Editor and run supabase-schema.sql.
3. Ensure required storage bucket(s) and policies are configured for image uploads.
4. Add project keys into .env.local.

The schema includes tables for profiles, categories, products, orders, order_items, wishlists, reviews, coupons, banners, cart_items, settings, email_otps, and contact_messages, with Row Level Security enabled.

## API Routes

This project uses route handlers in src/app/api.

- GET /api/admin/role
- GET /api/admin/customers
- POST /api/auth/otp/send
- POST /api/auth/otp/verify
- POST /api/auth/otp/reset-password

Important:

- /api (root) does not have an index handler and may return 404.
- API endpoints are route-specific and method-specific.

## Deployment

- Frontend: same Next.js app
- Backend: same Next.js app via route handlers
- Suggested live entries:
	- Frontend: https://stitchandtwinecrochet.com
	- Admin: https://stitchandtwinecrochet.com/admin
	- API base: https://stitchandtwinecrochet.com/api

## Security Notes

- Admin utilities rely on SUPABASE_SERVICE_ROLE_KEY and must remain server-only.
- Keep service role usage restricted to authenticated and authorized backend paths.
- Review Supabase RLS policies before every production release.

## Repository

GitHub: https://github.com/huzaifarao30/Stitch-and-Twine
