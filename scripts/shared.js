import {
  buildBlock,
  decorateBlock,
  loadBlock,
  decorateSections,
  decorateBlocks,
  decorateButtons,
  decorateIcons,
  loadBlocks,
} from './lib-franklin.js';

const DEFAULT_CATEGORY_PATH = '/news';
const DEFAULT_CATEGORY_NAME = 'News';
const EMAIL_REGEX = /\S+[a-z0-9]@[a-z0-9.]+/img;

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
 * Builds an embed to Flipbook and Issuu when either of their links are detected in main
 * @param {Element} main The container element
 */
function buildEmbed(main) {
  const regex = /(https?:\/\/(.+?\.)?(flippingbook|issuu)\.com(\/[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=]*)?)/;
  main.querySelectorAll('a').forEach((a) => {
    if (regex.test(a.href)) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          const html = `
            <div class="embed-container">
              <div>
                  <iframe loading="lazy" allow="encrypted-media" allowfullscreen="allowfullscreen" src="${a.href}"></iframe>
              </div>
            </div>
          `;
          a.innerHTML = html;
          observer.disconnect();
        }
      });
      observer.observe(a);
      a.textContent = '';
    }
  });
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
    buildBreadcrumb(main);
    buildEmbed(main);
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
 * Retrieves the record whose path matches a given value.
 * @param {string} path Path to retrieve from the site's index.
 * @returns {Promise<QueryIndexRecord>} Resolves with the information for the matching
 *  record. Will be falsy if a matching record was not found.
 */
export async function getRecordByPath(path) {
  const matching = await getRecordsByPath([path]);
  if (!matching.length) {
    return undefined;
  }
  return matching[0];
}

/**
 * Retrieves query index information for an author, by the author's name.
 * @param {string} authorName The name of the author to retrieve.
 * @returns {Promise<QueryIndexRecord>} Resolves author information.
 */
export async function getAuthorByName(authorName) {
  const records = await queryIndex((record) => record.path.startsWith('/authors/') && record.author === authorName);
  if (!records.length) {
    return undefined;
  }
  return records[0];
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

/**
 * Creates an HTML element that contains an article author's name, a link to the
 * author's profile page, and the publish date of the article.
 * @param {QueryIndexRecord} article Article whose author information will be
 *  included.
 * @returns {HTMLElement} Element containing summary information about the author of
 *  an article.
 */
export function buildArticleAuthor(article) {
  const author = document.createElement('h5');
  author.classList.add('article-author');
  // attempting to predict the URL to the author. may need to change to query
  // author information from index
  const authorId = String(article.author).toLowerCase()
    .replaceAll(/[^0-9a-z ]/g, '')
    .replaceAll(/[^0-9a-z]/g, '-');
  author.innerHTML = `
    <a href="/authors/${authorId}" class="link-arrow" aria-label="By ${article.author}"><span class="uncolored-link">By</span> ${article.author}</a>
  `;

  const date = document.createElement('h5');
  date.classList.add('article-date');
  date.innerText = article.publisheddate;

  const container = document.createElement('div');
  container.classList.add('article-author-container');
  container.append(author, date);
  return container;
}

function createAuthorLink(author) {
  const authorLink = document.createElement('a');
  authorLink.title = author.author;
  authorLink.setAttribute('alt', author.author);
  authorLink.href = author.path;
  return authorLink;
}

/**
 * Parses a given string and replaces any email addresses found in the value
 * with HTML mailto links.
 * @param {string} text Text to be processed.
 * @returns {string} Original text, potentially modified to include raw
 *  HTML.
 */
export function createMailToLinks(text) {
  let modifiedText = text;
  const uniqueEmails = {};
  const emailAddresses = modifiedText.match(EMAIL_REGEX)
    .filter((email) => {
      if (uniqueEmails[email]) {
        return false;
      }
      uniqueEmails[email] = true;
      return true;
    })
    // escape special characters for regex
    .map((email) => ({ email, regex: email.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') }));
  // replace email address in bio with mailto link
  emailAddresses.forEach((emailInfo) => {
    modifiedText = modifiedText.replaceAll(new RegExp(emailInfo.regex, 'g'), `<a href="mailto:${emailInfo.email}">${emailInfo.email}</a>`);
  });
  return modifiedText;
}

/**
 * Creates blade blocks containing information about article authors, and adds
 * them as children of an existing HTML element.
 * @param {HTMLElement} target Element to which the blade blocks will
 *  be added.
 * @param {Array<QueryIndexRecord>} authors Information for the authors
 *  that should be included in the blades.
 * @param {number} [bioLength] If provided, the maximum length that the
 *  author's bio should be. If the bio exceeds this length, it will be
 *  truncated with a "Read more" link to the author's profile.
 * @returns {Promise} Resolves when the blades have been built and added.
 */
export async function buildAuthorBlades(target, authors, bioLength = 0) {
  const authorRows = [];
  authors.forEach((author) => {
    const pictureLink = createAuthorLink(author);
    pictureLink.append(createOptimizedPicture(author.authorimage));

    const nameLink = createAuthorLink(author);
    const authorName = document.createElement('h4');
    authorName.innerText = author.author;
    nameLink.append(authorName);

    let bioStr = String(author.authordescription);
    if (bioLength && bioStr.length > bioLength) {
      bioStr = `${bioStr.substring(0, bioLength)}... <a href="${author.path}" title="Read more" aria-label="Read more">Read more</a>`;
    } else {
      bioStr = createMailToLinks(bioStr);
    }

    const bio = document.createElement('p');
    bio.innerHTML = bioStr;

    authorRows.push([{ elems: [pictureLink] }, { elems: [nameLink, bio] }]);
  });
  const blades = buildBlock('blade', authorRows);
  blades.classList.add('author');
  target.append(blades);
  decorateBlock(blades);
  return loadBlock(blades);
}

/**
 * Builds a learn-more block based on a given list of keywords, then adds it
 * as a child of a given element.
 * @param {HTMLElement} target Element to which the block will be added.
 * @param {string} keywords Comma-separated list of keywords to include in the
 *  learn more list.
 * @returns {Promise} Resolves when the operation is complete.
 */
export async function buildLearnMore(target, keywords) {
  const ul = document.createElement('ul');
  const items = String(keywords)
    .split(',')
    .map((keyword) => keyword.trim());
  items.forEach((keyword) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <a href="/tag/${encodeURIComponent(keyword)}/" title="${keyword}" aria-label="${keyword}">
        ${keyword}
      </a>
    `;
    ul.append(li);
  });
  const learnMore = buildBlock('learn-more', { elems: [ul] });
  target.append(learnMore);
  decorateBlock(learnMore);
  return loadBlock(learnMore);
}

/**
 * Dynamically creates a related content block based on a given list of
 * article paths, then appends the new block to a given element.
 * @param {HTMLElement} target Element to which related content block will be added.
 * @param {Array<string>} articlePaths List of full article paths to use as
 *  related items.
 * @returns {Promise} Resolves when the operation is complete.
 */
export async function buildRelatedContent(target, articlePaths) {
  const ul = document.createElement('ul');
  articlePaths.forEach((article) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <a href="${article}">
        ${article}
      </a>
    `;
    ul.append(item);
  });
  const relatedContent = buildBlock('related-content', { elems: [ul] });
  target.append(relatedContent);
  decorateBlock(relatedContent);
  return loadBlock(relatedContent);
}

/**
 * Dynamically creates a social share block, then appends the new block after
 * a given element.
 * @param {HTMLElement} insertAfter Element after which the block will be inserted.
 * @returns {Promise} Resolves when the operation is complete.
 */
export async function buildSocialShare(insertAfter) {
  const insertBefore = insertAfter.nextSibling;
  const socialShare = buildBlock('social-share', { elems: [] });
  insertAfter.parentElement.insertBefore(socialShare, insertBefore);
  decorateBlock(socialShare);
  return loadBlock(socialShare);
}
