import { getRecordsByPath } from '../../scripts/shared.js';

/**
 * Finds all placeholder article cards on the page, extracts the path of each, queries the
 * index for all paths, then sets the data-json attribute on each placeholder card with
 * the article's JSON.
 * @param {HTMLElement} main Main element of the document.
 */
async function loadArticleCards(main) {
  // find all article cards with a data-path attribute and build a lookup for each unique path
  const articleLookup = {};
  [...main.querySelectorAll('.article-card.skeleton[data-path]')]
    .forEach((articleCard) => {
      const path = articleCard.dataset.path;
      if (!articleLookup[path]) {
        articleLookup[path] = [];
      }
      articleLookup[path].push(articleCard);
    });

  // set json data on any article cards from articles that were found
  const records = await getRecordsByPath(Object.keys(articleLookup));
  records.forEach((record) => {
    const path = record.path;
    if (articleLookup[path]) {
      articleLookup[path].forEach((articleCard) => { articleCard.dataset.json = JSON.stringify(record); });
    }
  });
}

/**
 * Modifies the DOM during the lazy phase, as required by the template
 * @param {HTMLElement} main Main element of the document.
 */
export default function loadLazy(main) {
  loadArticleCards(main);
}
