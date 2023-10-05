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

const DEFAULT_CATEGORY_PATH = '/news';
const DEFAULT_CATEGORY_NAME = 'News';
const EMAIL_REGEX = /\S+[a-z0-9]@[a-z0-9.]+/img;

/**
 * Builds breadcrumb menu and returns it if there should be one.
 * @param {Element} main The container element
 * @returns {HTMLElement} The breadcrumb element, or undefined if
 *  no breadcrumb to display.
 */
export function buildBreadcrumb() {
  const path = window.location.pathname;
  const title = document.querySelector('h1');

  if (path === '/' || (title && title.innerText === '404')) {
    return undefined;
  }

  return buildBlock('breadcrumb', { elems: [] });
}

function buildList(name, elements) {
  const ul = document.createElement('ul');
  const h1 = document.createElement('h1');
  h1.innerText = name;
  ul.appendChild(h1);

  if (elements && elements.length > 0) {
    elements.split(',').forEach((element) => {
      const li = document.createElement('li');
      li.innerText = element.trim();
      ul.appendChild(li);
    });
  } else {
    return h1;
  }

  return ul;
}

/**
 * Creates a news-slider block using a given title and the current page's
 * keywords metadata. The block will be added to the correct location
 * in the page's DOM.
 * @param {HTMLElement} main The document's main element.
 * @param {string} title Title of the page, to include in the news slider.
 * @returns {Promise} Resolves after the news slider block has been fully
 *  loaded.
 */
export async function buildNewsSlider(main, title) {
  const top = main.querySelector('.top-section');
  if (!top) {
    return;
  }
  const name = title;
  const elements = getMetadata('keywords');

  const listOrH1 = buildList(name, elements);

  const div = document.createElement('div');
  const newsSliderBlock = buildBlock('news-slider', { elems: [listOrH1] });
  newsSliderBlock.classList.add('tabbed');

  div.append(newsSliderBlock);
  top.append(div);
  decorateBlock(newsSliderBlock);
  await loadBlock(newsSliderBlock);
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
  paths.forEach((path) => {
    pathLookup[path] = true;
  });
  return queryIndex((record) => !!pathLookup[record.path]);
}

/**
 * Retrieves all articles in a given category.
 * @param {string} categoryName Category whose articles should be retrieved.
 * @returns {Promise<Array<QueryIndexRecord>>} Resolves with an array of matching
 *  articles.
 */
export async function getArticlesByCategory(categoryName) {
  return queryIndex(
    (record) => record.category === categoryName && isArticle(record),
  );
}

/**
 * Retrieves all articles by a given author.
 * @param {string} authorName Author whose articles should be retrieved.
 * @returns {Promise<Array<QueryIndexRecord>>} Resolves with an array of matching
 *  articles.
 */
export async function getArticlesByAuthor(authorName) {
  return queryIndex(
    (record) => record.author === authorName && isArticle(record),
  );
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
  const records = await queryIndex(
    (record) => record.path.startsWith('/authors/') && record.author === authorName,
  );
  if (!records.length) {
    return undefined;
  }
  return records[0];
}

/**
 * Processes the contents of a block and retrieves the record paths specified
 * in its contents. The method assumes that the block's consists of a <ul> whose
 * list items are links to items in the site's query index.
 * @param {HTMLElement} block Block whose content will be used.
 * @returns {Array<string>} The paths of all records in the block.
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
  return getRecordsByPath(getPathsFromBlock(block));
}

/**
 * Creates an HTML element that contains an article author's name, a link to the
 * author's profile page, and the publish date of the article.
 * @param {QueryIndexRecord} [article] Article whose author information will be
 *  included. If not provided, a skeleton structure will be created.
 * @returns {HTMLElement} Element containing summary information about the author of
 *  an article.
 */
export function buildArticleAuthor(article) {
  const author = document.createElement('h5');
  author.classList.add('article-author');

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
  }

  const date = document.createElement('h5');
  date.classList.add('article-date');

  if (article) {
    date.innerText = article.publisheddate;
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
 * @returns {Promise} Resolves when the operation is complete.
 */
export async function buildSocialShare(insertAfter) {
  const insertBefore = insertAfter.nextSibling;
  const socialShare = buildBlock('social-share', { elems: [] });
  insertAfter.parentElement.insertBefore(socialShare, insertBefore);
  decorateBlock(socialShare);
  return loadBlock(socialShare);
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
  await queryIndex((record) => {
    if (!record.keywords || !isArticle(record)) {
      return false;
    }
    // calculate relevance by determining how many of the given keywords each
    // article has
    const relevance = calculateScore(keywordLookup, record);
    if (relevance > 0) {
      relevanceScores.push({
        record,
        relevance,
      });
    }
    return false;
  });
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
  // this method will almost certainly need to be optimized as the number of articles
  // grows. As is, it will:
  // 1. Potentially read a very large number of articles into memory.
  // 2. Query the full index.
  // 3. Sort a very large number of articles.
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
 * Builds an article-cards block from a list of articles, and adds the
 * block to the DOM.
 * @param {number} cardCount The number of cards to include in the block.
 * @param {string} templateName The name of the template building the cards.
 * @param {function} addBlockToDom Will be invoked when the block needs to be
 *  added to the DOM. Will receive a single argument: the block's HTMLElement.
 * @returns {Promise} Resolves when the block is complete.
 */
export async function buildArticleCardsBlock(cardCount, templateName, addBlockToDom) {
  const articleCards = buildBlock('article-cards', { elems: [] });
  articleCards.dataset.cardCount = cardCount;
  articleCards.dataset.template = templateName;
  addBlockToDom(articleCards);
  decorateBlock(articleCards);
  await loadBlock(articleCards);
}

/**
 * Loads a list of article records into a template's card placeholders.
 * @param {HTMLElement} main The document's main element.
 * @param {string} templateName Name of the template whose cards are being loaded.
 * @param {Array<QueryIndexRecord>} articles Article records to load into the template's card
 *  placeholders.
 */
export function loadTemplateArticleCards(main, templateName, articles) {
  const placeholderCards = main.querySelectorAll(`.article-cards[data-template="${templateName}"] .article-card.skeleton`);
  [...placeholderCards].forEach((card, index) => {
    if (articles.length > index) {
      card.dataset.json = JSON.stringify(articles[index]);
    } else {
      // placeholder not needed - not enough articles
      card.remove();
    }
  });
}
