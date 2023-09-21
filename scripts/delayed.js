// eslint-disable-next-line import/no-cycle
import {
  sampleRUM,
  loadBlocks,
} from './lib-franklin.js';

import { decorateMain } from './shared.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

async function loadAdFragment() {
  const adFragmentContainer = document.getElementById('right-ad-fragment-container');
  if (adFragmentContainer) {
    const path = '/fragments/global-layout-right-fragment'; // Updated the fragment path
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const fragmentHTML = await resp.text();
      adFragmentContainer.innerHTML = fragmentHTML;
      decorateMain(adFragmentContainer);
      await loadBlocks(adFragmentContainer);
    } else {
      adFragmentContainer.innerHTML = '<p>Error loading content</p>';
    }
  }
}

await loadAdFragment();
