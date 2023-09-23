// eslint-disable-next-line import/no-cycle
import {
  sampleRUM,
} from './lib-franklin.js';

import { fetchFragment } from './shared.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

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

await loadRightAdFragment();
