import {
  sampleRUM,
  loadHeader,
  loadFooter,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  toClassName,
  getMetadata,
} from './lib-franklin.js';

import { decorateMain } from './shared.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

const TEMPLATE_LIST = ['category', 'article', 'author'];

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) {
      sessionStorage.setItem('fonts-loaded', 'true');
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Run template specific decoration code.
 * @param {Element} main The container element
 */
async function decorateTemplates(main) {
  try {
    // Load the universal template for every page
    const universalTemplate = 'universal';
    const universalMod = await import(
      `../templates/${universalTemplate}/${universalTemplate}.js`
    );
    loadCSS(
      `${window.hlx.codeBasePath}/templates/${universalTemplate}/${universalTemplate}.css`,
    );
    if (universalMod.default) {
      await universalMod.default(main);
    }

    const template = toClassName(getMetadata('template'));
    const templates = TEMPLATE_LIST;
    if (templates.includes(template)) {
      const mod = await import(`../templates/${template}/${template}.js`);
      loadCSS(
        `${window.hlx.codeBasePath}/templates/${template}/${template}.css`,
      );
      if (mod.default) {
        await mod.default(main);
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('template loading failed', error);
  }
}

function scrollToTop(event) {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function createToTopSection() {
  const toTopContainer = document.createElement('div');
  toTopContainer.className = 'back-to-top';

  const toTopCol = document.createElement('div');
  toTopCol.className = 'to-top-text';

  const toTopContent = document.createElement('div');
  const toTopLink = document.createElement('a');
  toTopLink.href = '#top';
  toTopLink.target = '_self';
  toTopLink.ariaLabel = 'To Top';

  const toTopHeader = document.createElement('h3');
  toTopHeader.className = 'back-top-top-section-header';
  toTopHeader.innerText = 'To Top';

  toTopLink.appendChild(toTopHeader);
  toTopContent.appendChild(toTopLink);
  toTopCol.appendChild(toTopContent);
  toTopContainer.appendChild(toTopCol);

  // Event listener to scroll to top smoothly
  toTopLink.addEventListener('click', scrollToTop);

  return toTopContainer;
}

async function createContentAndAdsSections(doc) {
  const mainContainer = document.createElement('div');
  mainContainer.className = 'main-content-container';

  const contentSection = document.createElement('div');
  contentSection.className = 'content-section';

  const topAdSection = document.createElement('div');
  topAdSection.className = 'top-ad-section';
  topAdSection.id = 'top-ad-fragment-container';

  const contentAndAdsContainer = document.createElement('div');
  contentAndAdsContainer.className = 'content-and-ads-container';

  const rightAdSection = document.createElement('div');
  rightAdSection.className = 'right-ad-section';
  rightAdSection.id = 'right-ad-fragment-container';

  const bottomAdSection = document.createElement('div');
  bottomAdSection.className = 'bottom-ad-section';
  bottomAdSection.id = 'bottom-ad-fragment-container';

  // Create the close icon
  const closeIcon = document.createElement('img');
  closeIcon.className = 'close-icon';
  closeIcon.src = '/styles/icons/close-ribbon.png';
  closeIcon.alt = 'Close'; // Accessibility

  // Add event listener to close the bottom ad section when the close icon is clicked
  closeIcon.addEventListener('click', () => {
    bottomAdSection.style.display = 'none';
  });

  bottomAdSection.appendChild(closeIcon);
  contentAndAdsContainer.appendChild(contentSection);
  contentAndAdsContainer.appendChild(rightAdSection);

  const main = doc.querySelector('main');

  if (main) {
    const breadcrumb = main.querySelector('.breadcrumb-container');
    const newsWrapper = main.querySelector('.news-slider-wrapper');

    if (breadcrumb) {
      main.insertBefore(topAdSection, breadcrumb);
    } else {
      main.prepend(topAdSection);
    }


    console.log('children', main.children);
    // Move remaining sections in main to contentSection using array iteration
    Array.from(main.children)
      .filter(
        (child) => child !== topAdSection
          && child !== breadcrumb
      )
      .forEach((section) => {
        contentSection.appendChild(section)
      });

    mainContainer.appendChild(contentAndAdsContainer);
    contentAndAdsContainer.prepend(newsWrapper);
    // Append the "TO TOP" section to the mainContainer (Outside of the flex container)
    const toTopSection = createToTopSection();
    mainContainer.appendChild(toTopSection);

    main.appendChild(mainContainer);
  }

  doc.body.appendChild(bottomAdSection);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await decorateTemplates(main);
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  await createContentAndAdsSections(document);
  loadDelayed();
}

loadPage();
