# Sathya Klassy Fashion: online store

Customer website, owner dashboard and order tracking for Sathya Klassy Fashion.
It runs **free** on Netlify: the website is plain HTML/CSS/JS, the backend is a
Netlify Function, and products, orders and photos are saved in Netlify Blobs.
There is no database, paid plan or payment gateway to set up.

## What's inside

| Part | Where | What it does |
| --- | --- | --- |
| Website | `public/` | Home with 3D product carousel and falling petals, shop with categories and search, product pages, cart, UPI checkout with QR, order tracking, policies |
| Admin | `public/admin/` | Phone-friendly dashboard: sales, estimated profit, best sellers, low stock; orders (check payment, pack, ship, cancel, WhatsApp updates); products (add, edit, photos, stock, cost price); settings; Excel (CSV) export |
| Backend | `lib/handler.mjs`, `netlify/functions/api.mjs` | `/api/*`: products, orders, tracking, admin login, uploads, stats |
| Storage | `lib/store.mjs` | Netlify Blobs online; `.data/` folder when running locally |

How an order works: customer pays by UPI (QR or UPI app button) → enters the
transaction ID (UTR) → order shows in admin as **Check payment** → Sathya checks
her bank app and taps **Payment received** → Packed → Shipped (courier +
tracking number) → Delivered. Each step has a **Send WhatsApp update** button
with the message already written. Stock goes down when an order is placed and
comes back if it is cancelled.

On first run the shop fills itself with 11 **sample** products based on the
Instagram posts. Replace their names, prices, cost prices and photos in
Admin → Products, or delete them.

## Run it on your computer

```bash
npm install
npm run dev
```

Open http://localhost:8888 for the shop and http://localhost:8888/admin/ for
the admin (local password `sathya123`). Data is saved in `.data/`.

## Shareable demo preview

`node preview/build-preview.mjs <out-dir>` makes a static copy that runs with no
backend: `preview/demo-api.js` answers the API in the browser with the sample
products (admin password `demo`). Use it to show the design; the real shop is
the Netlify deploy below.

## Put it online (free)

1. Netlify → **Add new site → Import an existing project → GitHub** → pick this
   repository and the branch.
2. **Base directory:** `sathya-klassy-store`. Leave the build command and
   publish directory as they are (they come from `netlify.toml`).
3. **Site configuration → Environment variables:** add `ADMIN_PASSWORD` with a
   strong password only Sathya and we know. Redeploy.
4. Open `https://<site>.netlify.app/admin/`, log in, and in **Settings** add
   the UPI ID and WhatsApp number. Until the UPI ID is set, checkout shows an
   "Order on WhatsApp" button instead of the QR.
5. Optional later: a custom domain (about ₹800/year) in Netlify → Domain
   management.

Netlify's free plan is enough for a small shop. Photos are resized on the phone
before upload, so they stay small.

## Next phases

- Automated payments (Razorpay) once there is budget; the UPI + UTR flow stays as a backup
- WhatsApp Business API for automatic messages (now: one-tap prefilled messages)
- Shiprocket integration for shipping labels and live tracking
- Customer reviews with photos, coupon codes, reseller price list
