import {
  getTitle,
  getArticlesByCompany,
  buildArticleCardsBlock,
  loadTemplateArticleCards,
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

  const companyName = getTitle();
  buildArticleCardsBlock(8, 'company', (cards) => { firstSection.prepend(cards); });

  const h2 = document.createElement('h2');
  h2.classList.add('link-arrow');
  h2.innerText = 'More News';
  firstSection.prepend(h2);

  buildArticleCardsBlock(5, 'company', (cards) => {
    cards.classList.add('lead-article');
    firstSection.prepend(cards);
  });

  const h1 = document.createElement('h1');
  h1.innerText = companyName;
  h1.classList.add('company-heading');
  firstSection.prepend(h1);
}

/**
 * Modifies the DOM as needed for the template.
 * @param {HTMLElement} main The page's main element.
 */
export async function loadLazy(main) {
  const companyName = getTitle();

  const articles = await getArticlesByCompany(companyName);

  loadTemplateArticleCards(main, 'company', articles);
}
