# Sathya Klassy Fashion: online store

Customer website, owner dashboard and order tracking for Sathya Klassy Fashion.
It runs **free** on Netlify: the website is plain HTML/CSS/JS, the backend is a
Netlify Function, and products, orders and photos are saved in Netlify Blobs.
There is no database, paid plan or payment gateway.

## What's inside

| Part | Where | What it does |
| --- | --- | --- |
| Website | `public/` | Home with 3D product carousel and flower effects, shop, product pages, cart, UPI checkout, order tracking, policies |
| Admin | `public/admin/` | Phone-friendly dashboard: sales, profit, best sellers, low stock; orders; products; settings; bank payments; CSV export |
| Backend | `lib/handler.mjs`, `netlify/functions/api.mjs` | `/api/*` routes |
| Payment check | `lib/payments.mjs` | Reads a bank "credited" SMS: amount + UPI reference |
| Admin app | `public/admin/manifest.webmanifest`, `public/admin/sw.js`, `lib/push.mjs` | Installable SK Admin app with phone notifications (Web Push) |
| Storage | `lib/store.mjs` | Netlify Blobs online; `.data/` when running locally |

## How payment works (free, no gateway)

1. Customer fills the address and taps **Continue to pay**. The order is created
   as **Waiting for payment** with a unique amount, for example ₹307.14 for a
   ₹307 order. The paise identify the order. Stock is held for 10 minutes.
2. Customer pays that exact amount by UPI (QR, or the UPI-app button on phones).
3. Sathya's bank sends her a "credited" SMS. A free SMS-forwarder app on her
   Android phone posts **only that SMS** to `/api/payments/sms` with a secret key.
4. The server reads the amount and UPI reference, finds the waiting order with
   that exact amount, and only then marks it **Paid · to pack**. The customer's
   page switches to **Order placed** by itself.
5. No payment in 10 minutes → the order is **Not paid**, stock is released, and
   the customer is told no order was placed. A payment that arrives late (within
   24 hours) still confirms it.
6. If the bank SMS never arrives, the customer can submit their UPI reference.
   The order then waits under **Check payment** for Sathya to confirm by hand.
   It is never shown as placed before that.

## Security

- **No bank login, password, OTP or UPI PIN is ever asked for or stored.** The
  customer pays inside their own UPI app; the shop only receives the "credited" SMS.
- The SMS parser **refuses OTP / password / PIN messages** and ignores debit
  messages. The raw SMS text is never stored: only amount, UPI reference and time.
- The SMS address only accepts requests carrying `PAYMENT_WEBHOOK_KEY`
  (24+ random characters, kept in Netlify environment variables, never in code).
  Wrong keys are rate-limited. The same UPI reference cannot be used twice.
- A customer can't fake a payment: confirmation comes only from the bank SMS or
  from Sathya. Order status pages need a secret per-order key; tracking needs the
  order ID **and** the phone number.
- Admin: password of 10+ characters, max 6 login tries per 15 minutes, tokens
  expire after 3 days. Rate limits on orders, tracking and payment checks.
- Prices are always recalculated on the server; customers can't change them.
- Strict browser security headers (`netlify.toml`): Content-Security-Policy with
  scripts only from this site, HSTS (HTTPS only), no framing, no camera/mic/location.
- Uploaded photos are checked to be real images. CSV export blocks spreadsheet
  formula injection. IP addresses are only stored as one-way hashes for rate limits.
- Main remaining risks: someone learning the admin password, or the phone with
  the SMS forwarder being lost. Use a strong password and a phone lock, and change
  `PAYMENT_WEBHOOK_KEY` on Netlify if the phone is lost.

## Run it on your computer

```bash
npm install
npm run dev
```

Shop: http://localhost:8888 · Admin: http://localhost:8888/admin/ (local
password `sathya-local-dev`). Data is saved in `.data/`.

## Shareable demo preview

`node preview/build-preview.mjs <out-dir>` makes a static copy that runs with no
backend: `preview/demo-api.js` answers the API in the browser (admin password
`demo`; the bank SMS is simulated 10 seconds after the pay screen opens).

## Put it online (free)

1. Netlify → **Add new site → Import an existing project → GitHub** → pick this
   repository and the branch. **Base directory:** `sathya-klassy-store`.
2. **Site configuration → Environment variables:**
   - `ADMIN_PASSWORD`: at least 10 characters, only Sathya and we know it.
   - `PAYMENT_WEBHOOK_KEY`: 24+ random characters, e.g. from `openssl rand -hex 24`.
   Redeploy after saving.
3. Open `https://<site>.netlify.app/admin/` → **Settings**: add the UPI ID and
   WhatsApp number.
4. On the Android phone that receives the bank SMS: install a free SMS-forwarder
   app, add a rule for the bank's sender name + the word "credited", and send it
   as JSON (`{"message": "<sms text>"}`) to `https://<site>.netlify.app/api/payments/sms`
   with header `x-sk-key: <PAYMENT_WEBHOOK_KEY>`.
5. Sathya's phone: open `https://<site>.netlify.app/admin/` in Chrome (Android)
   or Safari (iPhone) → log in → **Settings → SK Admin app on your phone** →
   **Install** (iPhone: Share → Add to Home Screen) → open the app →
   **Turn on alerts**. Every paid order now shows a phone notification. Free,
   no Play Store, no third-party app. Notifications carry only order ID, amount,
   first name, city and items.
6. Test: pay ₹1 to the UPI ID and check **Settings → Last bank SMS**. Use the
   "Test with a bank SMS" box to check your bank's SMS format first.

## Next phases

- Payment gateway (Razorpay / PhonePe PG / Cashfree) for fully automatic payments when orders grow
- Shiprocket for shipping labels and live tracking
- Customer reviews with photos, coupon codes, reseller price list
