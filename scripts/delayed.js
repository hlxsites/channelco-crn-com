// eslint-disable-next-line import/no-cycle
import {
  sampleRUM, loadScript,
} from './lib-franklin.js';

import { fetchFragment } from './shared.js';

function addMartechStack() {
  // Defer the loading of the Global Ads script for 3 seconds

  loadScript('https://lib.tashop.co/crn/adengine.js', {
    async: '',
    'data-tmsclient': 'CRN',
    'data-layout': 'ros',
    'data-debug': 'false',
  });

  const globalAdScript = 'window.TAS = window.TAS || { cmd: [] }';
  loadScript('', {}, globalAdScript);
  loadScript('https://securepubads.g.doubleclick.net/tag/js/gpt.js', { async: '' });

  // Add Adobe Analytics
  loadScript('https://assets.adobedtm.com/9cfdfb0dd4d0/2d8aa33fcffa/launch-826786cb6e10.min.js');

  // Add Google Tag Manager
  loadScript('/scripts/gtm-init.js', { defer: true });

  // FunnelFuel Tracking Code
  const funnelFuelCode = `
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
`;
  const scriptTag = document.createElement('script');
  scriptTag.type = 'text/javascript';
  scriptTag.text = funnelFuelCode;
  document.head.appendChild(scriptTag);
}

// Load Right Ad fragment
async function loadRightAdFragment() {
  const adFragmentContainer = document.getElementById('right-ad-fragment-container');
  if (!adFragmentContainer) return;

  try {
    const fragmentHTML = await fetchFragment('/fragments/global-layout-right-fragment', true);
    adFragmentContainer.innerHTML = '';
    adFragmentContainer.appendChild(fragmentHTML);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching the fragment:', error);
    adFragmentContainer.innerHTML = '<p>Error loading content</p>';
  }
}

function loadTopAd(main) {
  // no top ad for sponsored pages
  if (window.location.pathname.includes('/content/')) return;
  const topAdHTML = `
  <div class="top-ad">
    <span class="ad-title">Advertisement</span> <br />
    <!-- /21804213519/CRN/Ros_Top_Leader-->
    <div id="unit-1659129517463" class="tmsads"></div>
  </div>
  `;
  const range = document.createRange();
  const topAdEl = range.createContextualFragment(topAdHTML);
  const topAdContainer = main.querySelector('.top-ad-section');
  if (topAdContainer) {
    topAdContainer.appendChild(topAdEl);
  }
}

function loadBottomAd() {
  // no top ad for sponsored pages
  if (window.location.pathname.includes('/content/')) return;
  const bottomAdHTML = `
  <div class="bottom-ad">
    <span class="ad-title">Advertisement</span> <br />
    <!-- /21804213519/CRN/Ros_Footer_Sticky-->
    <div id="unit-1659460662977" class="tmsads"></div>
  </div>
  `;
  const range = document.createRange();
  const bottomAdEl = range.createContextualFragment(bottomAdHTML);
  const bottomAdContainer = document.querySelector('.bottom-ad-section');
  if (bottomAdContainer) {
    bottomAdContainer.appendChild(bottomAdEl);
  }
}

function loadDelayedAds(main) {
  try {
    addMartechStack();
    loadTopAd(main);
    loadBottomAd();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Delayed Auto Blocking failed', error);
  }
}

await loadRightAdFragment();
loadDelayedAds(document.querySelector('main'));

// Core Web Vitals RUM collection
sampleRUM('cwv');
