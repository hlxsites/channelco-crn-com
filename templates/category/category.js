import {
  buildBlock,
  decorateBlock,
  loadBlock,
} from '../../scripts/lib-franklin.js';
import {
  getArticlesByCategory,
  getRecordByPath,
  comparePublishDate,
  buildArticleCardsBlock,
  buildNewsSlider,
  loadTemplateArticleCards,
} from '../../scripts/shared.js';

/**
 * Modifies the DOM with additional elements required to display a category page.
 * @param {HTMLElement} main The page's main element.
 */
// eslint-disable-next-line import/prefer-default-export
export async function loadEager(main) {
  const category = await getRecordByPath(window.location.pathname);
  if (!category) {
    return;
  }
  buildNewsSlider(main, category.title);

  let lastElement;
  const firstSection = main.querySelector('.section');
  if (!firstSection) {
    return;
  }
  if (firstSection.children.length > 0) {
    lastElement = firstSection.children.item(0);
  }

  buildArticleCardsBlock(5, 'category', (leadCards) => {
    leadCards.classList.add('lead-article');
    firstSection.insertBefore(leadCards, lastElement);
  });

  const newsLinkText = `${category.title} News`;
  const newsLink = document.createElement('a');
  newsLink.title = newsLinkText;
  newsLink.ariaLabel = newsLinkText;
  newsLink.classList.add('link-arrow');
  newsLink.innerText = newsLinkText;

  const newsHeading = document.createElement('h2');
  newsHeading.append(newsLink);
  firstSection.insertBefore(newsHeading, lastElement);

  buildArticleCardsBlock(8, 'category', (cards) => {
    firstSection.insertBefore(cards, lastElement);
  });
}

/**
 * Modifies the DOM with additional elements required to display a category page.
 * @param {HTMLElement} main The page's main element.
 */
// eslint-disable-next-line import/prefer-default-export
export async function loadLazy(main) {
  const category = await getRecordByPath(window.location.pathname);
  if (!category) {
    return;
  }
  const contentSection = main.querySelector('.content-section');
  if (!contentSection) {
    return;
  }

  const articles = await getArticlesByCategory(category.title);
  articles.sort(comparePublishDate);

  loadTemplateArticleCards(main, 'category', articles);

  const categoryNavigation = buildBlock('category-navigation', { elems: [] });
  contentSection.append(categoryNavigation);
  decorateBlock(categoryNavigation);
  await loadBlock(categoryNavigation);
}
