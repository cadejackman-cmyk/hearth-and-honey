// Pure helpers for the order form. No DOM here, so Node can unit-test them (tools/tests).
export const ORDER_EMAIL = 'orders@hearthhoneybakery.com';
export const LEAD_DAYS = 2; // Minimum notice in days. The FAQ on /order/ states the same number.
export const ITEMS = {
  'cinnamon-rolls': 'Cinnamon Rolls',
  'something-else': 'Something else',
};

const pad = (n) => String(n).padStart(2, '0');

/** Local-date ISO string (YYYY-MM-DD) for `today` plus `leadDays`. */
export function minOrderDate(today = new Date(), leadDays = LEAD_DAYS) {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + leadDays);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 'YYYY-MM-DD' -> 'Saturday, September 12, 2026', parsed as a local date so it never shifts a day. */
export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

/** Returns { field: message } for every problem. An empty object means the order is valid. */
export function validateOrder(f, today = new Date()) {
  const errors = {};
  if (!f.name || !f.name.trim()) errors.name = 'Please tell us your name.';
  if (!f.email || !f.email.trim()) errors.email = 'Please add your email so Megan can reply.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) errors.email = 'That email doesn’t look right. Check for a typo?';
  if (!ITEMS[f.item]) errors.item = 'Please pick something from the list.';
  const qty = Number(f.quantity);
  if (!f.quantity || !Number.isInteger(qty) || qty < 1) errors.quantity = 'Please enter a whole number, 1 or more.';
  if (!f.date) errors.date = 'Please pick the day you’d like your order.';
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date)) errors.date = 'Please enter the date as YYYY-MM-DD.';
  else if (f.date < minOrderDate(today)) errors.date = `Please give us at least ${LEAD_DAYS} days’ notice. The earliest day is ${formatDate(minOrderDate(today))}.`;
  return errors;
}

/** Builds the email from validated fields. */
export function buildOrderMail(f) {
  const item = ITEMS[f.item];
  const quantity = Number(f.quantity);
  const when = formatDate(f.date);
  const handle = (f.instagram || '').trim().replace(/^@/, '');
  const subject = `Order request: ${item} × ${quantity} for ${when}`;
  const lines = [
    'Hi Megan,',
    '',
    'I’d like to place an order.',
    '',
    `Item: ${item}`,
    `Quantity: ${quantity}`,
    `Date wanted: ${when}`,
    '',
    `Name: ${f.name.trim()}`,
    `Email: ${f.email.trim()}`,
    handle ? `Instagram: @${handle}` : null,
    '',
    'Notes:',
    (f.notes || '').trim() || '(none)',
    '',
    'Thanks!',
  ].filter((line) => line !== null);
  const body = lines.join('\n');
  const href = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return { subject, body, href };
}
