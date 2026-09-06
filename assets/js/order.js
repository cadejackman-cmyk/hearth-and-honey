// Order form: validates, composes the email, opens the visitor's mail app, and offers a copy fallback.
import { ITEMS, ORDER_EMAIL, minOrderDate, validateOrder, buildOrderMail } from './order-mail.js';

const form = document.getElementById('order-form');

if (form) {
  const FIELDS = ['name', 'email', 'item', 'quantity', 'date', 'instagram', 'notes'];
  const control = (key) => form.elements.namedItem(key);
  const errorFor = (key) => document.getElementById(`${key}-error`);
  const summary = document.getElementById('order-errors');
  const status = document.getElementById('order-status');
  const panel = document.getElementById('order-copy');
  const copyText = document.getElementById('order-copy-text');
  const copyButton = document.getElementById('order-copy-button');

  // /order/?item=cinnamon-rolls preselects the item.
  const wanted = new URLSearchParams(window.location.search).get('item');
  if (wanted && ITEMS[wanted]) control('item').value = wanted;

  control('date').min = minOrderDate();

  const read = () => Object.fromEntries(FIELDS.map((key) => [key, control(key).value]));

  function render(errors) {
    for (const key of FIELDS) {
      const message = errors[key] || '';
      errorFor(key).textContent = message;
      control(key).setAttribute('aria-invalid', message ? 'true' : 'false');
    }
    const keys = Object.keys(errors);
    if (keys.length === 0) {
      summary.hidden = true;
      summary.innerHTML = '';
      return;
    }
    summary.innerHTML =
      `<h2 class="error-summary__title">Please fix ${keys.length === 1 ? 'this' : `these ${keys.length} things`} before we open your email:</h2>` +
      `<ul>${keys.map((key) => `<li><a href="#${key}">${errors[key]}</a></li>`).join('')}</ul>`;
    summary.hidden = false;
    summary.focus();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = read();
    const errors = validateOrder(data);
    render(errors);
    if (Object.keys(errors).length > 0) return;

    const mail = buildOrderMail(data);
    copyText.value = `To: ${ORDER_EMAIL}\nSubject: ${mail.subject}\n\n${mail.body}`;
    panel.hidden = false;
    status.textContent = 'Your email app should be opening with the order filled in. If nothing happened, copy the details below and send them yourself.';
    window.location.href = mail.href;
  });

  // Clear a field's error as soon as it is corrected.
  form.addEventListener('input', (event) => {
    const key = event.target.name;
    if (!FIELDS.includes(key) || control(key).getAttribute('aria-invalid') !== 'true') return;
    if (!validateOrder(read())[key]) {
      control(key).setAttribute('aria-invalid', 'false');
      errorFor(key).textContent = '';
    }
  });

  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copyText.value);
      copyButton.textContent = 'Copied!';
    } catch {
      copyText.select();
      copyButton.textContent = 'Press Ctrl+C or Cmd+C to copy';
    }
    setTimeout(() => { copyButton.textContent = 'Copy order details'; }, 2500);
  });
}
