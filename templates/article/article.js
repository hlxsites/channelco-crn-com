import {
  buildBlock,
  loadBlock,
  decorateBlock
} from '../../scripts/lib-franklin.js';

import {
  getRecordByPath,
  getCategoryName,
  getCategoryPath,
  getAuthorByName,
  buildArticleAuthor,
  buildAuthorBlades,
  buildLearnMore,
  buildRelatedContent,
  buildSocialShare,
  getRelatedArticles,
} from '../../scripts/shared.js';

/**
 * Processes the DOM as necessary in order to auto block items required
 * for all articles.
 * @param {HTMLElement} main The page's main content.
 */
export default async function loadTemplate(main) {
  const path = window.location.pathname;

  const article = await getRecordByPath(path);
  if (!article) {
    return;
  }
  const categoryPath = getCategoryPath(path);
  const categoryName = getCategoryName(article);
  const author = await getAuthorByName(article.author);

  const heading = main.querySelector('h1');
  if (!heading) {
    return;
  }
  const picture = main.querySelector('picture');
  if (!picture) {
    return;
  }

  buildSocialShare(picture);

  const categoryLink = document.createElement('a');
  categoryLink.classList.add('link-arrow', 'article-category-link');
  categoryLink.innerText = categoryName;
  categoryLink.href = categoryPath;
  categoryLink.title = categoryName;
  categoryLink['aria-label'] = categoryName;
  heading.parentElement.insertBefore(categoryLink, heading);

  const authorContainer = buildArticleAuthor(article);
  heading.parentElement.insertBefore(authorContainer, heading.nextSibling);

  await buildLearnMore(heading.parentElement, article.keywords);
  if (author) {
    await buildAuthorBlades(heading.parentElement, [author]);
    const authorLink = heading.parentElement.querySelector('.blade.author .blade-text a');
    if (authorLink) {
      authorLink.classList.add('link-arrow');
    }
  }

  const related = await getRelatedArticles(article);
  await buildRelatedContent(heading.parentElement, related);
}
