import {
  buildBlock,
  decorateBlock,
  loadBlock,
} from '../../scripts/lib-franklin.js';
import {
  queryIndex,
  buildArticleCardsBlock,
  loadTemplateArticleCards,
  getFirstDefaultSection,
} from '../../scripts/shared.js';

const MAX_LIMIT = 50;

/**
 * Creates an HTMLElement that safely includes a non-trusted
 * string value provided by a user.
 * @param {string} term Untrusted string value.
 * @returns {HTMLElement} Element that can be safely added to
 *  the DOM.
 */
function createSearchTermElement(term) {
  const span = document.createElement('span');
  span.classList.add('search-results-term');
  if (term) {
    span.textContent = term;
  }
  return span;
}

/**
 * Retrieves the search term as provided by a user.
 * @returns {string} Search term value.
 */
function getSearchTerm() {
  const params = new URLSearchParams(window.location.search);
  return String(params.get('query') || '').trim();
}

/**
 * Determines whether a given string is related to a list of words.
 * @param {string} toSearch Value to check.
 * @param {Array<string>} words Words to match.
 * @returns {boolean} True if the value relates to the words.
 */
function containsWords(toSearch, words) {
  const value = String(toSearch);
  for (let i = 0; i < words.length; i += 1) {
    if (value.includes(words[i])) {
      return true;
    }
  }
  return false;
}

/**
 * Determines whether a record from the index is related to a list of words.
 * @param {import('../../scripts/shared.js').QueryIndexRecord} record Index
 *  record to check.
 * @param {Array<string>} words Words to match.
 * @returns {boolean} True if the record relates to the words.
 */
function recordContainsWords(record, words) {
  if (containsWords(record.title, words)) {
    return true;
  }
  return containsWords(record.description, words);
}

/**
 * Modifies the DOM as needed for search results
 * @param {HTMLElement} main The page's main element.
 */
// eslint-disable-next-line import/prefer-default-export
export function loadEager(main) {
  const params = new URLSearchParams(window.location.search);
  const searchTerm = getSearchTerm();
  let limit = parseInt(params.get('limit'), 10);
  if (!limit || limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  const section = getFirstDefaultSection(main);
  if (!section) {
    return;
  }

  const search = document.createElement('input');
  search.name = 'query';
  search.type = 'search';
  search.placeholder = 'Search';
  search.ariaLabel = 'Search';
  search.size = 1;
  search.value = searchTerm;

  const searchButton = document.createElement('button');
  searchButton.type = 'submit';
  searchButton.innerText = 'Search';

  const form = document.createElement('form');
  form.setAttribute('action', '/search');
  form.append(search);
  form.append(searchButton);
  section.append(form);

  const h1 = document.createElement('h1');
  h1.innerText = 'Showing results for ';
  h1.append(createSearchTermElement(searchTerm));
  section.append(h1);

  const resultCountLabel = document.createElement('h2');
  resultCountLabel.classList.add('result-count-label');
  resultCountLabel.innerText = 'Loading results...';
  section.append(resultCountLabel);

  buildArticleCardsBlock(limit, 'search-results', (cards) => section.append(cards));
}

/**
 * Modifies the DOM as needed for search results, and queries
 * for the results.
 * @param {HTMLElement} main The page's main element.
 * @returns {Promise} Resolves when the template has finished
 *  loading.
 */
// eslint-disable-next-line import/prefer-default-export
export async function loadLazy(main) {
  const searchTerm = getSearchTerm();
  const section = getFirstDefaultSection(main);
  if (!section) {
    return;
  }
  const resultCountLabel = main.querySelector('.search-results .result-count-label');
  if (!resultCountLabel) {
    return;
  }

  const results = [];
  if (searchTerm) {
    const searchCompare = searchTerm.toLowerCase();
    const words = searchCompare.split(' ').filter((value) => !!value);
    const entries = queryIndex((record) => recordContainsWords(record, words),
      500,
    )
      .sheet('article');

    // eslint-disable-next-line no-restricted-syntax
    for await (const entry of entries) {
      results.push(entry);
    }
  }

  resultCountLabel.innerText = `${results.length === 500 ? '500+' : results.length} results for `;
  const termLabel = createSearchTermElement(searchTerm);
  termLabel.classList.add('quoted');
  resultCountLabel.append(termLabel);

  loadTemplateArticleCards(main, 'search-results', results.slice(0, 50));

  const nav = buildBlock('category-navigation', { elems: [] });
  section.append(nav);
  decorateBlock(nav);
  await loadBlock(nav);
}
