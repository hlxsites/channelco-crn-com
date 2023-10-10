// eslint-disable-next-line import/no-cycle
import { sampleRUM, loadScript } from './lib-franklin.js';

import { fetchFragment } from './shared.js';

function addMartechStack() {
  // Defer the loading of the Global Ads script for 3 seconds

  loadScript('https://lib.tashop.co/crn/adengine.js', {
    async: '',
    'data-tmsclient': 'CRN',
    'data-layout': 'ros',
    'data-debug': 'false',
  });

  window.TAS = window.TAS || { cmd: [] };

  // Add Adobe Analytics
  loadScript(
    'https://assets.adobedtm.com/9cfdfb0dd4d0/2d8aa33fcffa/launch-826786cb6e10.min.js',
    { async: '' },
  );

  // Add Google Tag Manager
  loadScript('/scripts/gtm-init.js', { defer: true });

  // Add Funnel Fuel
  loadScript('/scripts/funnel-fuel-init.js', { defer: true });
}

// Load Right Ad fragment
async function loadRightAdFragment() {
  const adFragmentContainer = document.getElementById(
    'right-ad-fragment-container',
  );
  if (!adFragmentContainer) return;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      if (adFragmentContainer.querySelector('iframe')) {
        const ads = adFragmentContainer.querySelectorAll('.right-ad');
        ads.forEach((ad) => {
          ad.classList.remove('fixed-height');
        });
        observer.disconnect();
      }
    });
  });

  observer.observe(adFragmentContainer, {
    attributes: false,
    childList: true,
    subtree: true,
  });

  try {
    const fragmentHTML = await fetchFragment(
      '/fragments/global-layout-right-fragment',
      true,
    );
    // When ad finishes loading...
    const loadingDiv = document.querySelector('.loading-animation');
    loadingDiv.style.display = 'none';
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

function makeSticky() {
  const adWrappers = document.querySelectorAll('.ad-wrapper');
  const lastAd = adWrappers[adWrappers.length - 1];

  const bannerWrappers = document.querySelectorAll('.banner-wrapper');
  const lastBanner = bannerWrappers[bannerWrappers.length - 1];

  // Calculate the initial position of the elements
  const lastAdOffsetTop = lastAd.offsetTop;

  function handleScroll() {
    const { scrollY } = window;
    const screenWidth = window.innerWidth;

    const mobileScreenWidthThreshold = 768;

    // Check if the user has scrolled past the last ad,
    // the screen width is greater than the threshold,
    // and the scroll position is within the bounds of maxScrollPosition
    if (
      scrollY >= lastAdOffsetTop
      && screenWidth > mobileScreenWidthThreshold
    ) {
      // Make the last ad and banner sticky
      lastAd.style.position = 'fixed';
      lastAd.style.top = '0';
      lastAd.style.width = '330px';

      lastBanner.style.position = 'fixed';
      lastBanner.style.top = '300px';
      lastBanner.style.width = '330px';
    } else {
      // Reset the style when scrolling up, on mobile, or past the maxScrollPosition
      lastAd.style.position = 'static';
      lastAd.style.top = 'auto';
      lastAd.style.width = 'auto';

      lastBanner.style.position = 'static';
      lastBanner.style.top = 'auto';
      lastBanner.style.width = 'auto';
    }
  }

  // Attach the scroll event listener
  window.addEventListener('scroll', handleScroll);
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

async function loadShareThis() {
  const shareThis = document.querySelector('.sharethis-inline-share-buttons');
  if (shareThis) {
    await loadScript(
      'https://platform-api.sharethis.com/js/sharethis.js#property=6436d2b545aa460012e10320&product=sop',
      { async: '' },
    );
    await loadScript(
      'https://buttons-config.sharethis.com/js/6436d2b545aa460012e10320.js',
      { async: '' },
    );
  }
}

await loadRightAdFragment();
makeSticky();
loadDelayedAds(document.querySelector('main'));
loadShareThis();
loadScript('/scripts/google-translate-init.js', { defer: true });

// Core Web Vitals RUM collection
sampleRUM('cwv');
