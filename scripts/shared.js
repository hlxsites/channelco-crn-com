import {
  buildBlock,
  decorateSections,
  decorateBlocks,
  decorateButtons,
  decorateIcons,
  loadBlocks,
} from './lib-franklin.js';

const DEFAULT_CATEGORY_PATH = '/news';
const DEFAULT_CATEGORY_NAME = 'News';

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
export function decorateMain(main, blocksExist) {
  decorateLinkedPictures(main);
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);

  // no need to rebuild blocks in delayed if they already exist
  if (!blocksExist) {
    buildAutoBlocks(main);
  }

  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Fetch fragment by path
 */
export async function fetchFragment(path, blocksExist) {
  const resp = await fetch(`${path}.plain.html`);
  if (resp.ok) {
    const container = document.createElement('main');
    container.innerHTML = await resp.text();
    // eslint-disable-next-line no-use-before-define
    decorateMain(container, blocksExist);
    await loadBlocks(container);
    return container.querySelector(':scope .section');
  }
  return null;
}

/**
 * Returns the true origin of the current page in the browser.
 * If the page is running in a iframe with srcdoc, the ancestor origin is returned.
 * @returns {String} The true origin
 */
export function getOrigin() {
  const { location } = window;
  return location.href === 'about:srcdoc' ? window.parent.location.origin : location.origin;
}

/**
 * Returns the true of the current page in the browser.mac
 * If the page is running in a iframe with srcdoc,
 * the ancestor origin + the path query param is returned.
 * @returns {String} The href of the current page or the href of the block running in the library
 */
export function getHref() {
  if (window.location.href !== 'about:srcdoc') return window.location.href;

  const { location: parentLocation } = window.parent;
  const urlParams = new URLSearchParams(parentLocation.search);
  return `${parentLocation.origin}${urlParams.get('path')}`;
}

/**
 * Returns a picture element with webp and fallbacks
 * @param {string} src The image URL
 * @param {string} [alt] The image alternative text
 * @param {boolean} [eager] Set loading attribute to eager
 * @param {Array} [breakpoints] Breakpoints and corresponding params (eg. width)
 * @returns {Element} The picture element
 */
export function createOptimizedPicture(src, alt = '', eager = false, breakpoints = [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }]) {
  const url = new URL(src, getHref());
  const picture = document.createElement('picture');
  const { pathname } = url;
  const ext = pathname.substring(pathname.lastIndexOf('.') + 1);

  // webp
  breakpoints.forEach((br) => {
    const source = document.createElement('source');
    if (br.media) source.setAttribute('media', br.media);
    source.setAttribute('type', 'image/webp');
    source.setAttribute('srcset', `${pathname}?width=${br.width}&format=webply&optimize=medium`);
    picture.appendChild(source);
  });

  // fallback
  breakpoints.forEach((br, i) => {
    if (i < breakpoints.length - 1) {
      const source = document.createElement('source');
      if (br.media) source.setAttribute('media', br.media);
      source.setAttribute('srcset', `${pathname}?width=${br.width}&format=${ext}&optimize=medium`);
      picture.appendChild(source);
    } else {
      const img = document.createElement('img');
      img.setAttribute('loading', eager ? 'eager' : 'lazy');
      img.setAttribute('alt', alt);
      picture.appendChild(img);
      img.setAttribute('src', `${pathname}?width=${br.width}&format=${ext}&optimize=medium`);
    }
  });

  return picture;
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
 * Retrieves all records whose path matches one of a given list of path values.
 * @param {Array<string>} paths List of all record paths to retrieve from the site's index.
 * @returns {Promise<Array<QueryIndexRecord>>} Resolves with an array of information for all
 *  matching records.
 */
export async function getRecordsByPath(paths) {
  const pathLookup = {};
  paths.forEach((path) => { pathLookup[path] = true; });
  return queryIndex((record) => !!pathLookup[record.path]);
}

/**
 * Processes the contents of a block and retrieves the records specified in the
 * block. The method assumes that the block's content consists of a <ul> whose
 * list items are links to items in the site's query index.
 * @param {HTMLElement} block Block whose content will be used.
 * @returns {Promise<Array<QueryIndexRecord>>} Resolves with records that match all
 *  specified URLs in a block.
 */
export function getRecordsFromBlock(block) {
  const uls = block.querySelectorAll('ul');
  let paths = [];

  // merge all li's from all ul's into a flat list of record paths
  [...uls].forEach((ul) => {
    ul.remove();
    const records = ul.querySelectorAll('li');
    const recordPaths = [...records].map((article) => {
      try {
        const url = new URL(article.textContent);
        const recordPath = url.pathname;
        return recordPath;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('unable to process block li due to invalid URL content', e);
      }
      return false;
    })
      .filter((path) => !!path);
    paths = paths.concat(paths, recordPaths);
  });

  // retrieve article information for all specified article paths
  return getRecordsByPath(paths);
}
