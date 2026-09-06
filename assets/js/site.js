// Site-wide behavior: the mobile navigation disclosure. Everything else is plain HTML and CSS.
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');

if (toggle && nav) {
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (isOpen() && !nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });

  const desktop = window.matchMedia('(min-width: 48em)');
  desktop.addEventListener('change', () => { if (desktop.matches) setOpen(false); });
}
