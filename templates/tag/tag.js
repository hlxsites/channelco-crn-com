import {
  buildBlock,
  decorateBlock,
  loadBlock,
} from '../../scripts/lib-franklin.js';
import {
  buildArticleCardsBlock,
  commaSeparatedListContains,
  queryIndex,
  isArticle,
  comparePublishDate,
  loadTemplateArticleCards,
  getKeywords,
} from '../../scripts/shared.js';

/**
 * Modifies the DOM as needed for the template.
 * @param {HTMLElement} main The page's main element.
 */
export function loadEager(main) {
  const firstSection = main.querySelector('.section');
  if (!firstSection) {
    return;
  }

  buildArticleCardsBlock(10, 'tag', (cards) => { firstSection.prepend(cards); });

  const title = document.createElement('h1');
  title.innerText = getKeywords();
  title.classList.add('tag-title');
  firstSection.prepend(title);
}

/**
 * Modifies the DOM as needed for the template.
 * @param {HTMLElement} main The page's main element.
 */
export async function loadLazy(main) {
  const tagName = getKeywords();

  const records = await queryIndex((record) => isArticle(record)
    && commaSeparatedListContains(record.keywords, tagName));
  records.sort(comparePublishDate);

  loadTemplateArticleCards(main, 'tag', records);

  const contentSection = main.querySelector('.content-section');
  if (!contentSection) {
    return;
  }

  const nav = buildBlock('category-navigation', { elems: [] });
  contentSection.append(nav);
  decorateBlock(nav);
  await loadBlock(nav);
}
