import {
  getRecordByPath,
  comparePublishDate,
  queryIndex,
  isArticle,
  commaSeparatedListContains,
  buildArticleCardsBlock,
  loadTemplateArticleCards,
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
  h1.innerText = 'Company';
  h1.classList.add('company-heading', 'placeholder');
  firstSection.prepend(h1);
}

/**
 * Modifies the DOM as needed for the template.
 * @param {HTMLElement} main The page's main element.
 */
export async function loadLazy(main) {
  const company = await getRecordByPath(window.location.pathname);
  if (!company) {
    return;
  }

  const companyName = company.companynames;
  const heading = main.querySelector('.company-heading');
  if (heading) {
    const newHeading = document.createElement('h1');
    newHeading.innerText = companyName;
    heading.replaceWith(newHeading);
  }
  const articles = await queryIndex((record) => isArticle(record)
    && commaSeparatedListContains(record.companynames, companyName));
  articles.sort(comparePublishDate);

  loadTemplateArticleCards(main, 'company', articles);
}
