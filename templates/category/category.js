import {
  buildBlock,
  decorateBlock,
  loadBlock,
} from '../../scripts/lib-franklin.js';
import {
  getArticlesByCategory,
  getRecordByPath,
  comparePublishDate,
  createTemplateWithArticles,
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

  const articles = await getArticlesByCategory(category.title);
  articles.sort(comparePublishDate);

  const lastElement = main.children.length ? main.children.item(main.children.length - 1) : null;
  const h1 = document.createElement('h1');
  h1.innerText = category.title;
  main.insertBefore(h1, lastElement);

  const tag = buildBlock('tag', { elems: [] });
  main.insertBefore(tag, lastElement);
  decorateBlock(tag);
  loadBlock(tag);
  createTemplateWithArticles(main, `${category.title} News`, articles, lastElement);
}
