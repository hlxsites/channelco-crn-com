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
} from '../../scripts/shared.js';

function appendElementBeforeLast(target, last, toAppend) {
  if (last) {
    target.insertBefore(toAppend, last);
  } else {
    target.append(toAppend);
  }
}

/**
 * Modifies the DOM with additional elements required to display a category page.
 * @param {HTMLElement} main The page's main element.
 */
export default async function decorate(main) {
  const category = await getRecordByPath(window.location.pathname);
  if (!category) {
    return;
  }
  let lastElement;
  if (main.children.length > 0) {
    lastElement = main.children.item(0);
  }

  const h1 = document.createElement('h1');
  h1.innerText = category.title;
  appendElementBeforeLast(main, lastElement, h1);

  const tag = buildBlock('tag', { elems: [] });
  appendElementBeforeLast(main, lastElement, tag);
  decorateBlock(tag);
  await loadBlock(tag);

  const articles = await getArticlesByCategory(category.title);
  articles.sort(comparePublishDate);

  buildArticleCardsBlock(articles.slice(0, 5), (leadCards) => {
    leadCards.classList.add('lead-article');
    appendElementBeforeLast(main, lastElement, leadCards);
  });

  const newsLinkText = `${category.title} News`;
  const newsLink = document.createElement('a');
  newsLink.title = newsLinkText;
  newsLink.ariaLabel = newsLinkText;
  newsLink.classList.add('link-arrow');
  newsLink.innerText = newsLinkText;

  const newsHeading = document.createElement('h2');
  newsHeading.append(newsLink);
  appendElementBeforeLast(main, lastElement, newsHeading);

  buildArticleCardsBlock(articles.slice(5, 13), (cards) => {
    appendElementBeforeLast(main, lastElement, cards);
  });

  const categoryNavigation = buildBlock('category-navigation', { elems: [] });
  main.append(categoryNavigation);
  decorateBlock(categoryNavigation);
  await loadBlock(categoryNavigation);
}
