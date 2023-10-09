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
  let lastElement;
  const contentSection = main.querySelector('.content-section');
  if (!contentSection) {
    return;
  }
  if (contentSection.children.length > 0) {
    lastElement = contentSection.children.item(0);
  }

  const articles = await getArticlesByCategory(category.title);
  articles.sort(comparePublishDate);

  buildArticleCardsBlock(articles.slice(0, 5), (leadCards) => {
    leadCards.classList.add('lead-article');
    contentSection.insertBefore(leadCards, lastElement);
  });

  const newsLinkText = `${category.title} News`;
  const newsLink = document.createElement('a');
  newsLink.title = newsLinkText;
  newsLink.ariaLabel = newsLinkText;
  newsLink.classList.add('link-arrow');
  newsLink.innerText = newsLinkText;

  const newsHeading = document.createElement('h2');
  newsHeading.append(newsLink);
  contentSection.insertBefore(newsHeading, lastElement);

  buildArticleCardsBlock(articles.slice(5, 13), (cards) => {
    contentSection.insertBefore(cards, lastElement);
  });

  const categoryNavigation = buildBlock('category-navigation', { elems: [] });
  contentSection.append(categoryNavigation);
  decorateBlock(categoryNavigation);
  await loadBlock(categoryNavigation);
}
