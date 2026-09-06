import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ORDER_EMAIL, minOrderDate, formatDate, validateOrder, buildOrderMail } from '../../assets/js/order-mail.js';

const today = new Date(2026, 8, 6); // Sunday, September 6, 2026 (local time)
const good = { name: 'Sam Lee', email: 'sam@example.com', item: 'cinnamon-rolls', quantity: '12', date: '2026-09-12', instagram: 'samlee', notes: 'Birthday!' };

test('minOrderDate adds the lead time in local time and rolls over months', () => {
  assert.equal(minOrderDate(today, 2), '2026-09-08');
  assert.equal(minOrderDate(new Date(2026, 11, 31), 2), '2027-01-02');
});

test('formatDate renders a local date without timezone drift', () => {
  assert.equal(formatDate('2026-09-12'), 'Saturday, September 12, 2026');
});

test('validateOrder accepts a complete order', () => {
  assert.deepEqual(validateOrder(good, today), {});
});

test('validateOrder flags every missing required field', () => {
  const errors = validateOrder({ item: 'nope' }, today);
  assert.deepEqual(Object.keys(errors).sort(), ['date', 'email', 'item', 'name', 'quantity']);
});

test('validateOrder rejects a bad email, zero quantity, and a too-soon date', () => {
  const errors = validateOrder({ ...good, email: 'sam@', quantity: '0', date: '2026-09-07' }, today);
  assert.match(errors.email, /typo/);
  assert.match(errors.quantity, /1 or more/);
  assert.match(errors.date, /September 8, 2026/);
});

test('buildOrderMail composes subject, body, and mailto href', () => {
  const m = buildOrderMail(good);
  assert.equal(m.subject, 'Order request: Cinnamon Rolls × 12 for Saturday, September 12, 2026');
  assert.match(m.body, /Item: Cinnamon Rolls\nQuantity: 12/);
  assert.match(m.body, /Instagram: @samlee/);
  assert.match(m.body, /Notes:\nBirthday!/);
  assert.ok(m.href.startsWith(`mailto:${ORDER_EMAIL}?subject=`));
  assert.ok(decodeURIComponent(m.href).includes('Sam Lee'));
});

test('buildOrderMail omits Instagram when blank and writes (none) for empty notes', () => {
  const m = buildOrderMail({ ...good, instagram: '', notes: '' });
  assert.doesNotMatch(m.body, /Instagram:/);
  assert.match(m.body, /Notes:\n\(none\)/);
});
