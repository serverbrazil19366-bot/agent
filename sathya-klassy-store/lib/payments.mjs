// Reads a bank "money credited" SMS and pulls out the amount and the UPI
// reference (UTR). Pure function, no network, no storage, so it can be tested
// on its own and reused by the demo preview.
//
// Safety rules:
// - Anything that looks like an OTP / password / PIN message is refused, so a
//   wrongly configured SMS forwarder can never make us store one.
// - Debit messages are ignored. Only "credited / received / deposited" count.
// - The "available balance" amount is never taken as the payment amount.

const SENSITIVE = /\b(otp|one[\s-]?time[\s-]?pass(word|code)?|password|passcode|m?pin|cvv)\b/i;
const CREDIT = /\b(credited|received|deposited|credit(ed)? to|cr\.?)\b/i;
const DEBIT = /\b(debited|spent|withdrawn|paid to|sent to)\b/i;
const AMOUNT = /(?:rs\.?|inr|₹)\s*:?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/gi;
const UTR_LABELLED = /(?:upi\s*ref(?:erence)?\.?\s*(?:no\.?|number|id)?|ref\.?\s*no\.?|refno|utr\s*(?:no\.?)?|rrn|upi[:\/])\s*[:\/\-#]?\s*([0-9]{12})\b/i;
const TWELVE_DIGITS = /(?<![0-9])([0-9]{12})(?![0-9])/;

export function parseBankSms(raw) {
  const text = String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, 1000);
  if (!text) return { ok: false, reason: 'empty' };
  if (SENSITIVE.test(text)) return { ok: false, reason: 'sensitive' };
  const credit = CREDIT.test(text);
  if (!credit || (DEBIT.test(text) && !/\bcredited\b/i.test(text))) return { ok: false, reason: 'not-a-credit' };

  let amountPaise = null;
  for (const m of text.matchAll(AMOUNT)) {
    const before = text.slice(Math.max(0, m.index - 14), m.index).toLowerCase();
    if (/bal|balance|limit/.test(before)) continue; // skip "Avl Bal Rs 1,234"
    const v = Number(m[1].replace(/,/g, ''));
    if (Number.isFinite(v) && v > 0) { amountPaise = Math.round(v * 100); break; }
  }
  if (!amountPaise) return { ok: false, reason: 'no-amount' };

  const utr = (UTR_LABELLED.exec(text) || TWELVE_DIGITS.exec(text) || [])[1] || null;
  return { ok: true, amountPaise, utr };
}

export const rupees = (paise) => (paise / 100).toFixed(2);
