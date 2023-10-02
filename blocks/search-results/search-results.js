import {
  buildBlock,
  decorateBlock,
  loadBlock,
} from '../../scripts/lib-franklin.js';
import {
  queryIndex,
  isArticle,
  buildArticleCardsBlock,
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
 * Modifies the DOM with additional elements required to display
 * search results.
 * @param {HTMLElement} block Default DOM structure for the block.
 */
export default async function decorate(block) {
  const params = new URLSearchParams(window.location.search);
  const searchTerm = String(params.get('query') || '').trim();
  let limit = parseInt(params.get('limit'), 10);
  if (!limit || limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }
  block.innerHTML = `
    <form action="/search">
      <input type="search" name="query" placeholder="Search" aria-label="Search" size="1" />
      <button type="submit">Search</button>
    </form>
  `;
  const h1 = document.createElement('h1');
  h1.innerText = 'Showing results for ';
  h1.append(createSearchTermElement(searchTerm));
  block.append(h1);

  const resultCountLabel = document.createElement('h2');
  resultCountLabel.innerText = 'Loading results...';
  block.append(resultCountLabel);

  let results = [];
  if (searchTerm) {
    results = await queryIndex((record) => isArticle(record)
      && (String(record.title).toLowerCase().includes(searchTerm)
      || String(record.description).toLowerCase().includes(searchTerm)));
  }

  resultCountLabel.innerText = `${results.length} results for `;
  const termLabel = createSearchTermElement(searchTerm);
  termLabel.classList.add('quoted');
  resultCountLabel.append(termLabel);

  await buildArticleCardsBlock(results.slice(0, limit), (cards) => block.append(cards));
  const nav = buildBlock('category-navigation', { elems: [] });
  block.append(nav);
  decorateBlock(nav);
  await loadBlock(nav);
}
