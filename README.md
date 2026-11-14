This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

For chatbot jobs during local development, run Redis at `localhost:6379`, set
`QUEUE_REDIS_URL=redis://localhost:6379` in `.env.local`, and run `npm run worker`
in a second terminal alongside `npm run dev`.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## API rate limits

API requests are rate-limited by client IP in middleware. The default is 120
requests per minute; signup is limited to 5 requests per 15 minutes, and the
chatbot is limited to 20 requests per minute. Requests over the limit receive
HTTP 429 and a `Retry-After` header.

Counters use Upstash Redis when configured, so rate limits are shared across
application instances. If Redis is unavailable or not configured, each
instance falls back to its own in-memory counters.

## Product-list cache

`GET /api/products` caches its MongoDB result in Upstash Redis for 60 seconds.
Product creation, updates, stock changes, and deletion invalidate the cache.
Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from your Upstash
Redis database. If those values are missing or Redis is unavailable, the route
logs the cache issue and fetches products from MongoDB instead.

## Docker load balancing

The Docker Compose setup runs two Next.js instances behind an Nginx
least-connections load balancer, plus a worker for chatbot and product-image
cleanup jobs. Copy `.env.example` to `.env`, fill in the values required by the
app, and set `NEXT_PUBLIC_RAZORPAY_KEY` before building the image:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Open [http://localhost](http://localhost). The app containers are not exposed
directly; traffic goes through Nginx. The queue's Redis service is private to
the Docker network and persists jobs in a named volume. Configure TLS before
exposing the deployment publicly. Set the Upstash variables to share
rate-limit counters and the product cache across instances; otherwise rate
limits fall back to per-instance memory.

The chatbot API returns a job ID; the widget polls for the completed reply.
Product deletion returns after the database change and queues Cloudinary image
cleanup. Multipart product-image uploads remain synchronous because the
current admin UI submits image URLs rather than file uploads.

This Compose setup places both app instances on one Docker host. For
multi-host deployments, run the app instances on separate hosts and configure
the Nginx upstream with their reachable addresses, or use an orchestrator and
its load balancer.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
