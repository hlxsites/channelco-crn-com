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
export default async function decorate(main) {
  const category = await getRecordByPath(window.location.pathname);
  if (!category) {
    return;
  }
  const content = main.querySelector('.content-section');
  if (!content) {
    return;
  }
  let lastElement = null;
  if (content.children.length > 0) {
    lastElement = content.children.item(0);
  }

  const newsSlider = buildNewsSlider(content, category.title);
  decorateBlock(newsSlider);

  await buildArticleCardsBlock(5, 'category', (leadCards) => {
    leadCards.classList.add('lead-article');
    content.insertBefore(leadCards, lastElement);
  });

  const newsLinkText = `${category.title} News`;
  const newsLink = document.createElement('a');
  newsLink.title = newsLinkText;
  newsLink.ariaLabel = newsLinkText;
  newsLink.classList.add('link-arrow');
  newsLink.innerText = newsLinkText;

  const newsHeading = document.createElement('h2');
  newsHeading.append(newsLink);
  content.insertBefore(newsHeading, lastElement);

  await buildArticleCardsBlock(8, 'category', (cards) => {
    content.insertBefore(cards, lastElement);
  });

  const categoryNavigation = buildBlock('category-navigation', { elems: [] });
  content.append(categoryNavigation);
  decorateBlock(categoryNavigation);
  loadBlock(categoryNavigation);

  // page layout is in place, query and populate cards
  const articles = await getArticlesByCategory(category.title);
  articles.sort(comparePublishDate);
  loadTemplateArticleCards(main, 'category', articles);
}
