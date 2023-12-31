import {
  buildBlock,
  decorateBlock,
  loadBlock,
} from '../../scripts/lib-franklin.js';
import {
  buildArticleCardsBlock,
  getArticlesByKeyword,
  loadTemplateArticleCards,
  getKeywords,
  getLastDefaultSection,
  getFirstDefaultSection,
} from '../../scripts/shared.js';

/**
 * Modifies the DOM as needed for the template.
 * @param {HTMLElement} main The page's main element.
 */
export function loadEager(main) {
  const firstSection = getFirstDefaultSection(main);
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

  const records = await getArticlesByKeyword(tagName);

  loadTemplateArticleCards(main, 'tag', records);

  const lastSection = getLastDefaultSection(main);
  if (!lastSection) {
    return;
  }

  const nav = buildBlock('category-navigation', { elems: [] });
  lastSection.append(nav);
  decorateBlock(nav);
  await loadBlock(nav);
}
