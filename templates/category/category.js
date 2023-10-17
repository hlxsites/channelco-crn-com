import {
  buildBlock,
  decorateBlock,
  loadBlock,
} from '../../scripts/lib-franklin.js';
import {
  getArticlesByCategory,
  buildArticleCardsBlock,
  buildNewsSlider,
  loadTemplateArticleCards,
  addToTopSection,
  getTitle,
  getFirstDefaultSection,
  getLastDefaultSection,
} from '../../scripts/shared.js';

/**
 * Creates the news sub-heading on the page.
 * @param {string} title Text to display in the heading.
 * @param  {...string} classes Additional classes (if any)
 *  to include on the heading element.
 * @returns {HTMLElement} The newly created element.
 */
function createNewsHeading(title, ...classes) {
  const newsLink = document.createElement('a');
  newsLink.title = title;
  newsLink.ariaLabel = title;
  newsLink.classList.add('link-arrow');
  newsLink.innerText = title;
  newsLink.href = '/news/';

  const newsHeading = document.createElement('h2');
  newsHeading.append(newsLink);
  newsHeading.classList.add(
    'news-heading',
    ...classes,
  );
  return newsHeading;
}

/**
 * Creates the news primary heading on the page.
 * @param {string} text Text to display in the heading.
 * @param  {...string} classes Additional classes (if any)
 *  to include on the heading element.
 * @returns {HTMLElement} The newly created element.
 */
function createHeading(text, ...classes) {
  const title = document.createElement('h1');
  title.innerText = text;
  if (classes.length) {
    title.classList.add(...classes);
  }
  return title;
}

/**
 * Modifies the DOM with additional elements required to display a category page.
 * @param {HTMLElement} main The page's main element.
 */
// eslint-disable-next-line import/prefer-default-export
export function loadEager(main) {
  const title = getTitle();
  addToTopSection(main, createHeading(title));
  buildNewsSlider(main);

  let lastElement;
  const firstSection = getFirstDefaultSection(main);
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

  const newsHeading = createNewsHeading(`${title} News`);
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
  const lastSection = getLastDefaultSection(main);
  if (!lastSection) {
    return;
  }

  const articles = await getArticlesByCategory(getTitle());

  loadTemplateArticleCards(main, 'category', articles);

  const categoryNavigation = buildBlock('category-navigation', { elems: [] });
  lastSection.append(categoryNavigation);
  decorateBlock(categoryNavigation);
  await loadBlock(categoryNavigation);
}
