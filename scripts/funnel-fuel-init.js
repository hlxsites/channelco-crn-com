/* eslint-disable */
var _paq = window._paq = window._paq || [];
/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
(function() {
  var u="//analytics.funnelfuel.io/";
  _paq.push(['setTrackerUrl', u+'js/tracker.php']);
  _paq.push(['setSiteId', '5']);
  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  g.async=true; g.src=u+'js/tracker.php'; s.parentNode.insertBefore(g,s);
})();
