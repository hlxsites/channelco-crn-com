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

const TEMPLATE_LIST = ['category', 'article'];

const DEFAULT_CATEGORY_PATH = '/news';
const DEFAULT_CATEGORY_NAME = 'News';

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
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
    const universalMod = await import(`../templates/${universalTemplate}/${universalTemplate}.js`);
    loadCSS(`${window.hlx.codeBasePath}/templates/${universalTemplate}/${universalTemplate}.css`);
    if (universalMod.default) {
      await universalMod.default(main);
    }

    const template = toClassName(getMetadata('template'));
    const templates = TEMPLATE_LIST;
    if (templates.includes(template)) {
      const mod = await import(`../templates/${template}/${template}.js`);
      loadCSS(`${window.hlx.codeBasePath}/templates/${template}/${template}.css`);
      if (mod.default) {
        await mod.default(main);
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('template loading failed', error);
  }
}

async function createContentAndAdsSections(doc) {
  const mainContainer = document.createElement('div');
  mainContainer.className = 'main-content-container';

  const contentSection = document.createElement('div');
  contentSection.className = 'content-section';

  const topAdSection = document.createElement('div');
  topAdSection.className = 'top-ad-section';
  topAdSection.id = 'top-ad-fragment-container';
  topAdSection.innerHTML = 'Ads here';

  const contentAndAdsContainer = document.createElement('div');
  contentAndAdsContainer.className = 'content-and-ads-container';

  const rightAdSection = document.createElement('div');
  rightAdSection.className = 'right-ad-section';
  rightAdSection.id = 'right-ad-fragment-container';

  const bottomAdSection = document.createElement('div');
  bottomAdSection.className = 'bottom-ad-section';
  bottomAdSection.id = 'bottom-ad-fragment-container';
  bottomAdSection.innerHTML = 'Bottom ads here';

  contentAndAdsContainer.appendChild(contentSection);
  contentAndAdsContainer.appendChild(rightAdSection);

  const main = doc.querySelector('main');

  if (main) {
    const breadcrumb = main.querySelector('.breadcrumb-container');
    if (breadcrumb) {
      main.insertBefore(topAdSection, breadcrumb); // Place the ad section before breadcrumb
      contentSection.appendChild(main.children[2]);
    } else {
      main.prepend(topAdSection); // Place the ad section as the first child
      contentSection.appendChild(main.children[1]);
    }

    mainContainer.appendChild(contentAndAdsContainer);
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
    await decorateTemplates(main);
    decorateMain(main);
    document.body.classList.add('appear');
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

/**
 * @typedef QueryIndexRecord
 * @property {string} path Absolute path of the page on the site.
 * @property {string} title Title of the page from its metadata.
 * @property {string} description Summary description of the page from its metadata.
 * @property {string} image Absolute URL of the image from the page's metadata.
 * @property {string} category Name of the page's category.
 * @property {string} template Template assigned to the page associated with the index record.
 * @property {string} author Name of the author associated with the index record.
 * @property {string} authorimage Relative URL of the author's picture.
 * @property {string} authortitle Job title of the record's author.
 * @property {string} authordescription Bio information for the record's author.
 * @property {string} publisheddate Full, human-readable date when the record was published.
 * @property {string} keywords Comma-separated list of keywords associated with the index record.
 * @property {string} company-names Comma-separated list of companies to which the index record
 *  applies.
 * @property {string} company-webpages Comma-separated list of websites for the index's companies.
 * @property {string} lastModified Unix timestamp of the last time the index record was modified.
 */

let cachedIndex;
/**
 * Queries the site's index and only includes those records that match a given filter.
 * @param {function} filter Filter through which each record will be sent. The function will
 *  receive a single argument: the current record's raw data. The function should return true
 *  to include the record in the final result, or false to exclude it from the result.
 * @returns {Promise<Array<QueryIndexRecord>>} Resolves with an array of information for all
 *  matching records.
 */
export async function queryIndex(filter) {
  let index = cachedIndex;
  if (!index) {
    // will need to be updated to use ffetch for performance.
    const res = await fetch('/query-index.json');
    if (res && res.ok) {
      try {
        index = await res.json();
        // storing the query index in memory as a speed performance optimization.
        // may need to revisit this if the query index gets very large.
        cachedIndex = index;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Unable to parse query index json', e);
      }
    }
  }
  const { data = [] } = index || {};
  return data.filter(filter);
}

/**
 * Retrieves all articles whose path matches one of a given list of path values.
 * @param {Array<string>} paths List of all article paths to retrieve from the site's collection
 *  of articles.
 * @returns {Promise<Array<QueryIndexRecord>>} Resolves with an array of information for all
 *  matching articles.
 */
export async function getArticlesByPath(paths) {
  const pathLookup = {};
  paths.forEach((path) => { pathLookup[path] = true; });
  return queryIndex((record) => !!pathLookup[record.path]);
}

/**
 * Retrieves all authors whose full name matches one of a given list of values.
 * @param {Array<string>} names Names of authors to retrieve from the site's collection
 *  of authors.
 * @returns {Promise<Array<QueryIndexRecord>>} Resolves with an array of information for
 *  all matching authors.
 */
export async function getAuthorsByName(names) {
  const nameLookup = {};
  names.forEach((name) => { nameLookup[name] = true; });
  return queryIndex((record) => String(record.path).startsWith('/authors/') && !!nameLookup[record.author]);
}

/**
 * Retrieves the full, absolute path to a given path's category.
 * @param {string} path Path to a page on the site.
 * @returns {string} Path to the page's category.
 */
export function getCategoryPath(path) {
  if (!path || path === '/') {
    return DEFAULT_CATEGORY_PATH;
  }
  let pathStr = String(path);
  while (pathStr.length > 1 && pathStr.endsWith('/')) {
    pathStr = pathStr.substring(0, pathStr.length - 1);
  }
  const lastSlash = pathStr.lastIndexOf('/');
  if (lastSlash <= 0) {
    // fall back to default category if unexpected path format
    return DEFAULT_CATEGORY_PATH;
  }
  return pathStr.substring(0, lastSlash);
}

/**
 * Retrieves the category name of a record from the index.
 * @param {QueryIndexRecord} record Record from the site's query index.
 * @returns {string} Category name assigned to the record.
 */
export function getCategoryName(record) {
  const category = String(record.category).trim();
  if (!category.length) {
    return DEFAULT_CATEGORY_NAME;
  }
  return category;
}

loadPage();
