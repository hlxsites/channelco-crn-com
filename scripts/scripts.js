import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  toClassName,
  getMetadata,
} from './lib-franklin.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

const TEMPLATE_LIST = ['category', 'article'];

/**
 * Fetch fragment by path
 */
export async function fetchFragment(path) {
  const resp = await fetch(`${path}.plain.html`);
  if (resp.ok) {
    const container = document.createElement('main');
    container.innerHTML = await resp.text();
    // eslint-disable-next-line no-use-before-define
    decorateMain(container);
    await loadBlocks(container);
    return container.querySelector(':scope .section');
  }
  return null;
}

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * Builds breadcrumb menu and prepends to main in a new section
 * @param {Element} main The container element
 */
function buildBreadcrumb(main) {
  const path = window.location.pathname;
  const title = document.querySelector('h1');
  if (path === '/' || (title && title.innerText === '404')) {
    return;
  }

  const div = document.createElement('div');
  div.append(buildBlock('breadcrumb', { elems: [] }));
  main.prepend(div);
}

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
 * Builds a page divider by adding divider or Divider in fixed-fonts eg. Courier New
 * @param {Element} main The container element
 */
function buildPageDivider(main) {
  const allPageDivider = main.querySelectorAll('code');

  allPageDivider.forEach((el) => {
    const alt = el.innerText.trim();
    const lower = alt.toLowerCase();
    if (lower === 'divider') {
      el.innerText = '';
      el.classList.add('divider');
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
    buildBreadcrumb(main);
    buildPageDivider(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Run template specific decoration code.
 * @param {Element} main The container element
 */
async function decorateTemplates(main) {
  try {
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

export function linkPicture(picture) {
  const nextSib = picture.parentNode.nextElementSibling;
  if (nextSib) {
    const a = nextSib.querySelector('a');
    if (a && a.textContent.startsWith('https://')) {
      a.innerHTML = '';
      a.className = '';
      a.appendChild(picture);
    }
  }
}

export function decorateLinkedPictures(main) {
  /* thanks to word online */
  main.querySelectorAll('picture').forEach((picture) => {
    if (!picture.closest('div.block')) {
      linkPicture(picture);
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateLinkedPictures(main);
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
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
  loadDelayed();
}

/**
 * @typedef QueryIndexRecord
 * @property {string} path
 * @property {string} title
 * @property {string} description
 * @property {string} image
 * @property {string} tag
 * @property {string} template
 * @property {string} author
 * @property {string} authorimage
 * @property {string} authortitle
 * @property {string} authordescription
 * @property {string} publisheddate
 * @property {string} keywords
 * @property {string} lastModified
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

loadPage();
