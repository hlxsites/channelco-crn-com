// eslint-disable-next-line import/no-cycle
import {
  sampleRUM,
} from './lib-franklin.js';

import { fetchFragment } from './shared.js';

function loadScript(url, attrs, body) {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  if (url) script.src = url;
  if (attrs) {
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const attr in attrs) {
      script.setAttribute(attr, attrs[attr]);
    }
  }
  if (body) {
    script.type = 'text/javascript';
    script.text = body;
  }

  head.append(script);
  return script;
}
function addMartechStack() {
  // Add Global Ads
  // loadScript('https://lib.tashop.co/crn/adengine.js', {
  //   async: '',
  //   'data-tmsclient': 'CRN',
  //   'data-layout': 'ros',
  //   'data-debug': 'false',
  // });
  const globalAdScript = 'window.TAS = window.TAS || { cmd: [] }';
  loadScript('', {}, globalAdScript);
  loadScript('https://securepubads.g.doubleclick.net/tag/js/gpt.js', { async: '' });

  // Add Adobe Analytics
  loadScript('https://assets.adobedtm.com/9cfdfb0dd4d0/37e7a63c5b44/launch-54eb03504761.min.js');

  // Add Google Tag Manager
  const gtmIframe = document.createElement('iframe');
  gtmIframe.classList.add('gtm-iframe');
  gtmIframe.src = 'https://www.googletagmanager.com/ns.html?id=GTM-NZJV95M';
  const gtmEl = document.createElement('noscript');
  gtmEl.append(gtmIframe);
  document.body.prepend(gtmEl);

  const gtmCode = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-NZJV95M');`;

  loadScript('', {}, gtmCode);
}

async function loadRightAdFragment() {
  const adFragmentContainer = document.getElementById('right-ad-fragment-container');
  if (!adFragmentContainer) return;

  try {
    const fragmentHTML = await fetchFragment('/fragments/global-layout-right-fragment', true);
    adFragmentContainer.innerHTML = '';
    adFragmentContainer.appendChild(fragmentHTML);
  } catch (error) {
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

async function loadDelayedAds(main) {
  try {
    addMartechStack();
    loadTopAd(main);
    loadBottomAd();
    await loadRightAdFragment();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Delayed Auto Blocking failed', error);
  }
}

// Core Web Vitals RUM collection
sampleRUM('cwv');
await loadDelayedAds(document.querySelector('main'));
