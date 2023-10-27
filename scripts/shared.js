import {
  buildBlock,
  decorateBlock,
  loadBlock,
  decorateSections,
  decorateBlocks,
  decorateButtons,
  decorateIcons,
  loadBlocks,
  getMetadata,
} from './lib-franklin.js';
import ffetch from './ffetch.js';

const DEFAULT_CATEGORY_PATH = '/news';
const DEFAULT_CATEGORY_NAME = 'News';
const EMAIL_REGEX = /\S+[a-z0-9]@[a-z0-9.]+/img;
const CHUNK_SIZE = 500;
const CHUNK_LIMIT = 3;
let pageIndex = 1;

function createBreadcrumbItem(href, label) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.classList.add('breadcrumb-item');
  a.href = href;
  a.innerHTML = label;
  li.append(a);
  return li;
}

/**
 * Builds breadcrumb menu and returns it.
 * @returns {HTMLElement} Newly created bread crumb.
 */
export function buildBreadcrumb() {
  const path = window.location.pathname;
  const title = document.querySelector('h1');

  if (path === '/' || (title && title.innerText === '404')) {
    return undefined;
  }

  // If path ends with '/', pop the last item out. Then pop the current page
  const pathArr = path.split('/');
  if (pathArr[pathArr.length - 1] === '') pathArr.pop();
  const lastPath = pathArr[pathArr.length - 1];
  pathArr.pop();

  // Formulate the list for breadcrumb
  const list = document.createElement('ul');
  list.classList.add('breadcrumb-list');
  let segments = '/';
  pathArr.forEach((pathPart) => {
    if (pathPart !== '') segments += `${pathPart}/`;
    list.append(createBreadcrumbItem(segments, pathPart === '' ? 'HOME' : ` ▸ ${pathPart.replaceAll('-', ' ')}`));
  });

  // Last item in breadcrumb should be current page title. If not found, default to path
  const li = document.createElement('li');
  li.append(' ▸ ');
  li.append(title ? title.innerText : lastPath.replaceAll('-', ' '));
  list.append(li);

  const breadcrumb = document.createElement('div');
  breadcrumb.classList.add('breadcrumb');
  breadcrumb.append(list);
  return breadcrumb;
}

function buildList(elements) {
  const ul = document.createElement('ul');
  elements.split(',').forEach((element) => {
    const li = document.createElement('li');
    li.innerText = element.trim();
    ul.appendChild(li);
  });
  return ul;
}

/**
 * Appends an HTML element to the top section of the site.
 * @param {HTMLElement} main The page's main element.
 * @param {HTMLElement} element Element to append to the top.
 */
export function addToTopSection(main, element) {
  const topSection = main.querySelector('.top-section');
  if (!topSection) {
    return;
  }
  topSection.append(element);
}

/**
 * Appends an HTML element to the right section of the site.
 * @param {HTMLElement} main The page's main element.
 * @param {HTMLElement} element Element to append to the top.
 */
export function addToRightSection(main, element) {
  const rightSection = main.querySelector('.right-section');
  if (!rightSection) {
    return;
  }
  rightSection.append(element);
}

/**
 * Retrieves all the default sections, which will contain content created
 * by a document author.
 * @param {HTMLElement} main The page's main element.
 * @returns {Array<HTMLElement>} The page's default sections.
 */
export function getDefaultSections(main) {
  return [...main.querySelectorAll('.section:not(.auto-section)')];
}

/**
 * Retrieves the first default section on the page, if there is
 * one.
 * @param {HTMLElement} main The page's main element.
 * @returns {HTMLElement|undefined} The first default section, or undefined if none.
 */
export function getFirstDefaultSection(main) {
  return main.querySelector('.section:not(.auto-section)');
}

/**
 * Retrieves the last default section on the page, if there is
 * one.
 * @param {HTMLElement} main The page's main element.
 * @returns {HTMLElement|undefined} The last default section, or undefined if none.
 */
export function getLastDefaultSection(main) {
  const sections = getDefaultSections(main);
  if (sections.length) {
    return sections[sections.length - 1];
  }
  return undefined;
}

export function buildNewsSlider(main) {
  const elements = getMetadata('keywords');
  if (!elements || !elements.length) {
    return;
  }

  const list = buildList(elements);
  const div = document.createElement('div');
  const newsSliderBlock = buildBlock('news-slider', { elems: [list] });
  newsSliderBlock.classList.add('tabbed');

  div.append(newsSliderBlock);
  addToTopSection(main, newsSliderBlock);
  decorateBlock(newsSliderBlock);
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
  return location.href === 'about:srcdoc'
    ? window.parent.location.origin
    : location.origin;
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
export function createOptimizedPicture(
  src,
  alt = '',
  eager = false,
  breakpoints = [
    { media: '(min-width: 600px)', width: '2000' },
    { width: '750' },
  ],
) {
  const url = new URL(src, getHref());
  const picture = document.createElement('picture');
  const { pathname } = url;
  const ext = pathname.substring(pathname.lastIndexOf('.') + 1);

  // webp
  breakpoints.forEach((br) => {
    const source = document.createElement('source');
    if (br.media) source.setAttribute('media', br.media);
    source.setAttribute('type', 'image/webp');
    source.setAttribute(
      'srcset',
      `${pathname}?width=${br.width}&format=webply&optimize=medium`,
    );
    picture.appendChild(source);
  });

  // fallback
  breakpoints.forEach((br, i) => {
    if (i < breakpoints.length - 1) {
      const source = document.createElement('source');
      if (br.media) source.setAttribute('media', br.media);
      source.setAttribute(
        'srcset',
        `${pathname}?width=${br.width}&format=${ext}&optimize=medium`,
      );
      picture.appendChild(source);
    } else {
      const img = document.createElement('img');
      img.setAttribute('loading', eager ? 'eager' : 'lazy');
      img.setAttribute('alt', alt);
      picture.appendChild(img);
      img.setAttribute(
        'src',
        `${pathname}?width=${br.width}&format=${ext}&optimize=medium`,
      );
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
  return pathStr.substring(0, lastSlash + 1);
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
 * @property {string} companynames Comma-separated list of companies to which the index record
 *  applies.
 * @property {string} companywebpages Comma-separated list of websites for the index's companies.
 * @property {string} lastModified Unix timestamp of the last time the index record was modified.
 */

/**
 * @typedef PageMetadata
 * @property {string} [path] Full path of the page.
 * @property {string} [author] Name of the author associated with the page.
 * @property {string} [category] Name of the category associated with the page.
 * @property {string} [companynames] Comma-separated list of companies to which
 *  the page applies.
 * @property {string} [companywebpages] Comma-separated list of websites for the
 *  page's companies.
 * @property {string} [description] Summary description of the page.
 * @property {string} [keywords] Comma-separated list of keywords associated with the page.
 * @property {string} [publisheddate] Full, human-readable date when the page was published.
 * @property {string} [title] Title of the page.
 * @property {string} [image] Image for the page.
 */

/**
 * Determines whether a given record from the site's query index is an article.
 * @param {QueryIndexRecord} record Record to test.
 * @returns {boolean} True if the record is an article, false otherwise.
 */
export function isArticle(record) {
  // the record is an article if its path starts with /news/, and its template is
  // either empty or "article"
  return (
    (!record.template || String(record.template).toLowerCase() === 'article')
    && String(record.path).startsWith('/news/')
  );
}

/**
 * Queries the site's index and only includes those records that match a given filter.
 * @param {function} filter Filter through which each record will be sent. The function will
 *  receive a single argument: the current record's raw data. The function should return true
 *  to include the record in the final result, or false to exclude it from the result.
 * @param {number} [limit] The maximum number of records to retrieve. Default: 10.
 * @returns {import('./ffetch.js').default} Resolves an ffetch object configured with parameters
 *  ready for querying.
 */
export function queryIndex(filter, limit = 10) {
  return ffetch('/query-index.json')
    .chunks(CHUNK_SIZE)
    // "safety net" to ensure we aren't inadvertently traversing the entire index. individual
    // calls can override this, or we can adjust the limit as needed
    .chunkLimit(CHUNK_LIMIT)
    .filter(filter)
    .limit(limit);
}

/**
 * Retrieves the title of the current page.
 * @returns {string} Page title.
 */
export function getTitle() {
  return getMetadata('og:title');
}

/**
 * Retrieves the list of company names of the current page.
 * @returns {string} Comma-separated list of names.
 */
export function getCompanyNames() {
  return getMetadata('companynames');
}

/**
 * Retrieves the list of keywords of the current page.
 * @returns {string} Comma-separated list of words.
 */
export function getKeywords() {
  return getMetadata('keywords');
}

/**
 * forward looking *.metadata.json experiment
 * fetches metadata.json of page
 * @param {path} path to *.metadata.json
 * @returns {PageMetadata} containing sanitized meta data
 */
export async function getMetadataJson(path) {
  let resp;
  try {
    resp = await fetch(path);
    if (resp && resp.ok) {
      const text = await resp.text();
      const headStr = text.split('<head>')[1].split('</head>')[0];
      const head = document.createElement('head');
      head.innerHTML = headStr;
      const metaTags = head.querySelectorAll(':scope > meta');
      const meta = {};
      metaTags.forEach((metaTag) => {
        const name = metaTag.getAttribute('name') || metaTag.getAttribute('property');
        const value = metaTag.getAttribute('content');
        if (meta[name]) {
          meta[name] += `, ${value}`;
        } else {
          meta[name] = value;
        }
      });

      if (meta['og:image']) {
        meta.image = meta['og:image'];
      }
      if (meta['og:url']) {
        meta.path = new URL(meta['og:url']).pathname;
      }
      if (meta['og:title']) {
        meta.title = meta['og:title'];
      }

      return meta;
    }
  } catch {
    // fail
  }

  return null;
}

/**
 * Retrieves all records whose path matches one of a given list of path values.
 * @param {Array<string>} paths List of all record paths to retrieve from the site's index.
 * @returns {Promise<Array<PageMetadata>>} Resolves with an array of information for all
 *  matching records.
 */
export async function getRecordsByPath(paths) {
  const pathLookup = {};
  paths.forEach((path) => {
    pathLookup[path] = true;
  });
  const promises = Object.keys(pathLookup).map((path) => {
    const pathUrl = `${window.location.protocol}//${window.location.host}${path}`;
    return getMetadataJson(pathUrl);
  });
  const results = await Promise.all(promises);
  return results.filter((value) => !!value);
}

/**
 * Converts a given value to lower case, then strictly compares it with another value.
 * @param {string} value Value to convert to lower case.
 * @param {string} matchValue Value to match against (as-is).
 * @returns {boolean} True if the values match, false otherwise.
 */
function lowerCaseCompare(value, matchValue) {
  return String(value).toLowerCase() === matchValue;
}

/**
 * Converts a given list of comma-separated values to lower case, then determines whether a
 * given value is in the list.
 * @param {string} list Comma-separated list to convert to lower case and check.
 * @param {string} value Value to look for (as-is).
 * @returns {boolean} True if the given value is in the comma-separated
 *  list, false otherwise.
 */
function commaSeparatedListContains(list, value) {
  if (!list || !value) {
    return false;
  }
  const listStr = String(list);

  return listStr.split(',')
    .map((item) => item.trim().toLowerCase())
    .includes(value);
}

/**
 * Queries the site's index and returns articles whose specified metadata value
 * matches a given filter value.
 * @param {string} metadataName Name of the article metadata to match.
 * @param {string} value Value to match with.
 * @param {number} [limit=10] Maximum number of articles to include.
 * @param {function} [compareFn] Used to compare the two values. The first parameter will be
 *  the record's metadata value, and the second will be a lower-case version of the match
 *  value. Default function will convert the record's metadata value to lower case and strictly
 *  compare it with the match value.
 * @returns {Promise<QueryIndexRecord>} Article's record information.
 */
async function queryMatchingArticles(
  metadataName,
  value,
  limit = 10,
  compareFn = lowerCaseCompare,
) {
  const matchValue = String(value).toLowerCase();
  const entries = queryIndex(
    (record) => compareFn(record[metadataName], matchValue),
    limit,
  ).sheet('article');

  const articles = [];
  // eslint-disable-next-line no-restricted-syntax
  for await (const entry of entries) {
    articles.push(entry);
  }
  return articles;
}

/**
 * Queries the site's index and returns articles whose specified metadata value
 * matches a given filter value.
 * @param {string} metadataName Name of the article metadata to match.
 * @param {string} value Value to match with.
 * @param {number} pageNum Current Page Number.
 * @param {function} [compareFn] Used to compare the two values. The first parameter will be
 *  the record's metadata value, and the second will be a lower-case version of the match
 *  value. Default function will convert the record's metadata value to lower case and strictly
 *  compare it with the match value.
 * @returns {Promise<QueryIndexRecord>} Article's record information.
 */
async function queryMatchingArticlesByCategory(
  metadataName,
  value,
  pageNum,
  compareFn = lowerCaseCompare,
) {
  const offset = (pageNum - 1) * 15;
  const matchValue = String(value).toLowerCase();
  let filter;
  if (metadataName === 'keywords') {
    filter = (record) => compareFn(record[metadataName], matchValue)
      && (record.category === getTitle());
  } else {
    filter = (record) => compareFn(record[metadataName], matchValue);
  }
  const entries = ffetch('/query-index.json')
    .chunks(CHUNK_SIZE)
    .sheet('article')
    .filter(filter)
    .slice(offset, offset + 16);
  const articles = [];
  // eslint-disable-next-line no-restricted-syntax
  for await (const entry of entries) {
    articles.push(entry);
  }
  return articles;
}
/**
 * Retrieves all articles in a given category.
 * @param {string} categoryName Category whose articles should be retrieved.
 * @returns {Promise<Array<QueryIndexRecord>>} Resolves with an array of matching
 *  articles.
 */
export async function getArticlesByCategory(categoryName, pageNum, compareFn = lowerCaseCompare, metadataName = 'category') {
  return queryMatchingArticlesByCategory(metadataName, categoryName, pageNum, compareFn);
}

/**
 * Retrieves all articles by a given author.
 * @param {string} authorName Author whose articles should be retrieved.
 * @returns {Promise<Array<QueryIndexRecord>>} Resolves with an array of matching
 *  articles.
 */
export async function getArticlesByAuthor(authorName) {
  return queryMatchingArticles('author', authorName, 15);
}

/**
 * Retrieves all articles related to a given company.
 * @param {string} companyName Company whose articles should be retrieved.
 * @returns {Promise<Array<QueryIndexRecord>>} Resolves with an array of matching
 *  articles.
 */
export async function getArticlesByCompany(companyName) {
  return queryMatchingArticles('companynames', companyName, 14, commaSeparatedListContains);
}

/**
 * Retrieves all articles related to a given keyword.
 * @param {string} keyword Keyword whose articles should be retrieved.
 * @returns {Promise<Array<QueryIndexRecord>>} Resolves with an array of matching
 *  articles.
 */
export async function getArticlesByKeyword(keyword) {
  return queryMatchingArticles('keywords', keyword, 10, commaSeparatedListContains);
}

/**
 * Retrieves the record whose path matches a given value.
 * @param {string} path Path to retrieve from the site's index.
 * @returns {Promise<PageMetadata>} Resolves with the information for the matching
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
  const authorValue = String(authorName).toLowerCase();
  return ffetch('/query-index.json')
    .sheet('authors')
    .filter((record) => (String(record.author).toLowerCase()) === authorValue)
    .first();
}

/**
 * Processes the contents of a block and retrieves the paths specified in the
 * block. The method assumes that the block's content consists of a <ul> whose
 * list items are links to items in the site's query index.
 * @param {HTMLElement} block Block whose content will be used.
 * @returns {Array<string>} Resolves with paths that are
 *  specified in the block.
 */
export function getPathsFromBlock(block) {
  const uls = block.querySelectorAll('ul');
  let paths = [];

  // merge all li's from all ul's into a flat list of record paths
  [...uls].forEach((ul) => {
    ul.remove();
    const records = ul.querySelectorAll('li');
    const recordPaths = [...records]
      .map((article) => {
        try {
          const url = new URL(article.textContent);
          const recordPath = url.pathname;
          return recordPath;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log(
            'unable to process block li due to invalid URL content',
            e,
          );
        }
        return false;
      })
      .filter((path) => !!path);
    paths = paths.concat(paths, recordPaths);
  });
  return paths;
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
  // retrieve article information for all specified article paths
  const paths = getPathsFromBlock(block);
  return getPathsFromBlock(paths);
}

/**
 * Checks whether a given value appears to be a timestamp, and if so converts it
 * into a formatted date string. Otherwise the method will return the original
 * value as-is.
 * @param {string} dateValue Potential date value to format.
 * @returns {string} Formatted date, or the original value.
 */
export function formatDate(dateValue) {
  if (/^[0-9]+$/g.test(dateValue)) {
    const publishDate = new Date(parseInt(dateValue, 10) * 1000);
    const dateStr = publishDate.toLocaleDateString('en-us', {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    });
    const timeStr = publishDate.toLocaleTimeString('en-us', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
    return `${dateStr}, ${timeStr}`;
  }
  return dateValue;
}

/**
 * Creates an HTML element that contains an article author's name, a link to the
 * author's profile page, and the publish date of the article. If an article
 * is not provided, the method will create placeholders.
 * @param {QueryIndexRecord} [article] Article whose author information will be
 *  included.
 * @returns {HTMLElement} Element containing summary information about the author of
 *  an article.
 */
export function buildArticleAuthor(article) {
  const author = document.createElement('h5');
  author.classList.add('article-author');

  const date = document.createElement('h5');
  date.classList.add('article-date');

  if (article) {
    // attempting to predict the URL to the author. may need to change to query
    // author information from index
    const authorId = String(article.author)
      .toLowerCase()
      .replaceAll(/[^0-9a-z ]/g, '')
      .replaceAll(/[^0-9a-z]/g, '-');
    author.innerHTML = `
      <a href="/authors/${authorId}" class="link-arrow" aria-label="By ${article.author}"><span class="uncolored-link">By</span> ${article.author}</a>
    `;

    date.innerText = formatDate(article.publisheddate);
  } else {
    author.classList.add('placeholder');
    date.classList.add('placeholder');

    author.innerText = 'Author Name';
    date.innerText = 'Article published date';
  }

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
  const emailAddresses = modifiedText
    .match(EMAIL_REGEX)
    .filter((email) => {
      if (uniqueEmails[email]) {
        return false;
      }
      uniqueEmails[email] = true;
      return true;
    })
    // escape special characters for regex
    .map((email) => ({
      email,
      regex: email.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
    }));
  // replace email address in bio with mailto link
  emailAddresses.forEach((emailInfo) => {
    modifiedText = modifiedText.replaceAll(
      new RegExp(emailInfo.regex, 'g'),
      `<a href="mailto:${emailInfo.email}">${emailInfo.email}</a>`,
    );
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
      bioStr = `${bioStr.substring(0, bioLength)}... <a href="${
        author.path
      }" title="Read more" aria-label="Read more">Read more</a>`;
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
 * Parses a comma-separate list of keywords into an array of keyword values.
 * @param {string} keywords Keywords to parse.
 * @returns {Array<string>} List of keywords.
 */
function parseKeywords(keywords) {
  return String(keywords)
    .split(',')
    .map((keyword) => keyword.trim())
    .filter((keyword) => !!keyword);
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
  const items = parseKeywords(keywords);
  items.forEach((keyword) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <a href="/search?query=${encodeURIComponent(keyword)}" title="${keyword}" aria-label="${keyword}">
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
 * @param {Array<QueryIndexRecord>} articles List of articles to use as
 *  related items.
 * @returns {Promise} Resolves when the operation is complete.
 */
export async function buildRelatedContent(target, articles) {
  const ul = document.createElement('ul');
  articles.forEach((article) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <a href="${article.path}" title="${article.title}" aria-label="${article.title}">
        ${article.title}
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
 */
export function buildSocialShare(insertAfter) {
  const insertBefore = insertAfter.nextSibling;
  if (!insertBefore) {
    return;
  }
  if (!insertAfter.parentElement) {
    return;
  }
  const socialShare = buildBlock('social-share', { elems: [] });
  insertAfter.parentElement.insertBefore(socialShare, insertBefore);
  decorateBlock(socialShare);
}

function buildKeywordLookup(keywords) {
  const map = {};
  parseKeywords(keywords).forEach((keyword) => {
    map[keyword] = true;
  });
  return map;
}

/**
 * Calculates a score based on how many keywords in a list match a
 * given keyword lookup.
 * @param {object} keywordLookup Simple object whose keys are keywords. Used
 *  as the keywords to match against.
 * @param {QueryIndexRecord} record Record whose score should be calculated.
 * @returns {number} Score based on how many keywords match.
 */
function calculateScore(keywordLookup, record) {
  // calculate relevance by determining how many of the given keywords each
  // article has
  let matchCount = 0;
  const currRecordKeywords = parseKeywords(record.keywords);
  currRecordKeywords.forEach((keyword) => {
    if (keywordLookup[keyword]) {
      matchCount += 1;
    }
  });
  return matchCount;
}

/**
 * @typedef QueryIndexRecordRelevance
 * @property {QueryIndexRecord} record Record from the query index to which
 *  the relevance score applies.
 * @property {number} relevance Relevance score for the record.
 */

/**
 * Queries the site's index and builds relevance scores for each record based
 * on a master set of keywords to match against.
 * @param {object} keywordLookup Simple object whose keys are the keywords to
 *  match.
 * @returns {Promise<Array<QueryIndexRecordRelevance>>} Resolves with relevance
 *  scores for applicable records.
 */
async function buildRelevanceScores(keywordLookup) {
  const relevanceScores = [];
  // only read a single chunk, limiting the relevant articles to that dataset
  const entries = queryIndex(() => true, CHUNK_SIZE)
    .sheet('article');

  // eslint-disable-next-line no-restricted-syntax
  for await (const entry of entries) {
    // calculate relevance by determining how many of the given keywords each
    // article has
    const relevance = calculateScore(keywordLookup, entry);
    if (relevance > 0) {
      relevanceScores.push({
        record: entry,
        relevance,
      });
    }
  }
  return relevanceScores;
}

/**
 * Compares two relevance-related records and returns a value depending
 * on their relation.
 * @param {QueryIndexRecordRelevance} a Record from the index to compare.
 * @param {QueryIndexRecordRelevance} b Record from the index to compare.
 * @returns {number} Returns -1 if b has a higher score than a, 1 if a
 *  has a higher score than b, or 0 if the two are the same.
 */
function compareRelevance(a, b) {
  if (a.relevance > b.relevance) {
    return -1;
  }
  if (a.relevance < b.relevance) {
    return 1;
  }
  return 0;
}

/**
 * Compares two records and returns a value depending on a comparison of
 * their publish dates.
 * @param {QueryIndexRecord} a Record from the index to compare.
 * @param {QueryIndexRecord} b Record from the index to compare.
 * @returns {number} Returns -1 if b has a more recent date than a, 1 if a
 *  has a more recent date than b, or 0 if the two are the same.
 */
export function comparePublishDate(a, b) {
  if (!a.publisheddate && !b.publisheddate) {
    // records are the same when neither has a publish date
    return 0;
  }
  if (!a.publisheddate && b.publisheddate) {
    // b has a more recent date if it has a date but a doesn't
    return -1;
  }
  if (a.publisheddate && !b.publisheddate) {
    // a has a more recent date if it has a date but b doesn't
    return 1;
  }

  try {
    const date1 = Date.parse(a.publisheddate);
    const date2 = Date.parse(b.publisheddate);
    if (date1 < date2) {
      // both have dates, b is more recent than a
      return 1;
    }
    if (date1 > date2) {
      // both have dates, a is more recent than b
      return -1;
    }
  } catch {
    // don't compare dates if parsing fails
  }
  // there was either an error, or both dates are the same
  return 0;
}

/**
 * Sorts an array of relevance records _in place_, so that the most relevant
 * records are first. When relevance scores are the same, records with
 * newer publish dates will come first.
 * @param {Array<QueryIndexRecordRelevance>} relevanceScores Scores to be
 *  sorted.
 */
function sortByMostRelevant(relevanceScores) {
  relevanceScores.sort((a, b) => {
    const relevance = compareRelevance(a, b);
    if (relevance !== 0) {
      // relevance score should take priority
      return relevance;
    }

    return comparePublishDate(a.record, b.record);
  });
}

/**
 * Retrieves articles related to an article. Articles with more matching
 * keywords will have a higher relation score, and articles with a newer
 * publish date will have a higher score when the relation score is the same.
 * @param {QueryIndexRecord} article Article whose related articles should be
 *  retrieved.
 * @param {number} [relatedCount] Optional number of items to return. Default: 5.
 * @returns {Promise<Array<QueryIndexRecord>>} Resolves with the most related articles.
 */
export async function getRelatedArticles(article, relatedCount = 5) {
  const lookup = buildKeywordLookup(article.keywords);
  const related = await buildRelevanceScores(lookup);
  sortByMostRelevant(related);
  return (
    related
      // make sure the article itself isn't included
      .filter((relevanceRecord) => relevanceRecord.record.path !== article.path)
      // return the requested number of articles
      .slice(0, relatedCount)
      // only return the record itself
      .map((relevanceRecord) => relevanceRecord.record)
  );
}

/**
 * Builds an article-cards block with a given number of placeholders,
 * adds the block to the DOM, and decorates it.
 * @param {number} count The number of cards to add to the block.
 * @param {function} addBlockToDom Will be invoked when the block needs to be
 *  added to the DOM. Will receive a single argument: the block's HTMLElement.
 * @returns {HTMLElement} The newly created block.
 */
export function buildArticleCardsBlock(count, templateName, addBlockToDom) {
  const cards = buildBlock('article-cards', { elems: [] });
  cards.dataset.cardCount = count;
  cards.dataset.template = templateName;
  addBlockToDom(cards);
  decorateBlock(cards);
  return cards;
}

/**
 * Loads a list of article records into a template's card placeholders.
 * @param {HTMLElement} main The document's main element.
 * @param {string} templateName Name of the template whose cards are being loaded.
 * @param {Array<QueryIndexRecord>} articles Article records to load into the template's card
 *  placeholders.
 */
export function loadTemplateArticleCards(main, templateName, articles) {
  const placeholderCards = main.querySelectorAll((`.article-cards[data-template="${templateName}"] .article-card.skeleton`));
  [...placeholderCards].forEach((card, index) => {
    if (articles.length > index) {
      card.dataset.json = JSON.stringify(articles[index]);
    } else {
      // placeholder not needed - not enough articles
      card.remove();
    }
  });
}

/**
 * Builds an ad block with the given ID and type.
 * @param {string} unitId ID of the ad to include in the block.
 * @param {string} type The type of ad to create.
 * @param {boolean} [fixedHeight] If true, the ad will have a fixed height
 *  associated with it.
 * @returns {HTMLElement} Newly built ad block. Will be falsy if the ad type
 *  is unknown.
 */
export function buildAdBlock(unitId, type, fixedHeight = false) {
  // Determine the text and class based on the type
  let adText;
  let adClass;
  let height = '';
  if (type === 'Advertisement') {
    adText = 'Advertisement';
    adClass = 'right-ad';
    if (fixedHeight) {
      height = ' fixed-height';
    }
  } else if (type === 'Sponsored post') {
    adText = 'Sponsored post';
    adClass = 'right-sponsored';
  } else {
    // eslint-disable-next-line no-console
    console.error('Unknown type in the block');
    return undefined;
  }

  // Build the ad using the extracted unit-id and determined text and class
  const rightAdHTML = `
    <!-- AD IMU  STARTS  -->

    <div class="${adClass}${height}">
      <span class="ad-title">${adText}</span> <br />
      <div id="${unitId}" class="tmsads"></div>
    </div>

    <br clear="all">
  `;

  const range = document.createRange();
  return range.createContextualFragment(rightAdHTML);
}

/**
 * Determines whether a given value is in a list of comma-separated values.
 * @param {string} dataMap Data map from data-source
 * @param {string} value Value to look for
 * @returns {string} Mapped string if found, value if not
 */
export function dataMapLookup(dataMap, value) {
  const foundValue = dataMap.find((item) => item.key === value);
  return foundValue ? foundValue.value : value;
}

/**
 * Converts filter source code to location of data and mapping
 * @param {string} dataSource report code for data source (eg. ppg, ceo)
 * @returns {Array<string>} Returns data and data map location
 */
export function getFilterInfoLocation(dataSource) {
  const dataSheet = `/data-source/${dataSource}/${dataSource}-data.json`;
  const dataMapSheet = `/data-source/${dataSource}/data-mapping.json`;
  return [dataSheet, dataMapSheet];
}

/**
 * Checks if a string is a URL
 * @param {string} str String to check
 * @returns {Array<string>} Returns true if URL
 */
export function isURL(str) {
  const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/;
  return urlPattern.test(str);
} 
 
function showHideNextBtn(nextBtn, length, count) {
  if (length < 16 && count > 1) {
    nextBtn.parentElement.classList.add('disabled');
  } else {
    nextBtn.parentElement.classList.remove('disabled');
  }
}

function handleLinkClick(count, prevBtn, nextBtn) {
  const main = document.querySelector('main');
  const mainArticle = main.querySelector('.category-main-articles');
  const activeTab = main.querySelector('.active-tab');
  const keyword = activeTab ? activeTab.textContent.trim().replace(/\//g, '-') : null;
  if (count === 1) {
    prevBtn.parentElement.classList.add('disabled');
    main.querySelector('.category-main-articles').dataset.cardCount = 5;
    main.querySelector('.category-sub-articles').dataset.cardCount = 8;
    mainArticle.style.display = 'block';
  } else {
    prevBtn.parentElement.classList.remove('disabled');
    mainArticle.dataset.cardCount = 0;
    mainArticle.style.display = 'none';
    main.querySelector('.category-sub-articles').dataset.cardCount = 15;
  }
  if (keyword) {
    getArticlesByCategory(keyword, count, commaSeparatedListContains, 'keywords').then((articles) => {
      loadTemplateArticleCards(main, 'category', articles);
      showHideNextBtn(nextBtn, articles.length, count);
    });
  } else {
    getArticlesByCategory(getTitle(), count).then((articles) => {
      loadTemplateArticleCards(main, 'category', articles);
      showHideNextBtn(nextBtn, articles.length, count);
    });
  }
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  });
}

/**
 * Build previous next buttons
 */

export function prevNextBtn() {
  const divContainer = document.createElement('div');
  divContainer.classList.add('prev-next-container');
  const prevDiv = document.createElement('div');
  prevDiv.classList.add('previous');
  prevDiv.setAttribute('id', 'previous-button');
  const prevBtn = document.createElement('a');
  prevBtn.textContent = 'Back';
  prevBtn.setAttribute('id', 'previous');
  prevBtn.classList.add('btn-on-white');
  prevBtn.classList.add('white');
  prevDiv.append(prevBtn);
  if (pageIndex === 1) {
    prevDiv.classList.add('disabled');
  }
  const nextDiv = document.createElement('div');
  nextDiv.classList.add('load-more');
  nextDiv.setAttribute('id', 'next-button');
  const nextBtn = document.createElement('a');
  nextBtn.textContent = 'Next';
  nextBtn.setAttribute('id', 'next');
  nextBtn.classList.add('btn-on-white');
  nextBtn.classList.add('white');
  nextDiv.append(nextBtn);
  prevBtn.addEventListener('click', () => {
    pageIndex -= 1;
    handleLinkClick(pageIndex, prevBtn, nextBtn);
  });
  nextBtn.addEventListener('click', () => {
    pageIndex += 1;
    nextDiv.classList.add('disabled');
    handleLinkClick(pageIndex, prevBtn, nextBtn);
  });
  divContainer.append(prevDiv);
  divContainer.append(nextDiv);
  return divContainer;
}
