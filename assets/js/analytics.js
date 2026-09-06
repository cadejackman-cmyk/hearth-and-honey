// Google Analytics 4 (gtag.js). The tag ID is the only thing to change if the property changes.
// Google's script is fetched after the page has finished loading so it never competes with
// the page itself; page views are still recorded. To remove analytics, delete the <script>
// tag that loads this file from each page's <head> and update the privacy notice on /policies/.
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-DCZV25M028');

function loadGtag() {
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-DCZV25M028';
  document.head.appendChild(s);
}
if (document.readyState === 'complete') {
  loadGtag();
} else {
  window.addEventListener('load', function () {
    if ('requestIdleCallback' in window) requestIdleCallback(loadGtag, { timeout: 2000 });
    else setTimeout(loadGtag, 250);
  });
}
