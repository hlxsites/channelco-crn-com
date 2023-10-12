import { getMetadata } from '../../scripts/lib-franklin.js';
import {
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
// eslint-disable-next-line import/prefer-default-export
export function loadEager(main) {
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
  categoryLink.innerText = 'Category';
  heading.parentElement.insertBefore(categoryLink, heading);

  const authorContainer = buildArticleAuthor();
  heading.parentElement.insertBefore(authorContainer, heading.nextSibling);
}

/**
 * Processes the DOM as necessary in order to auto block items required
 * for all articles.
 * @param {HTMLElement} main The page's main content.
 */
// eslint-disable-next-line import/prefer-default-export
export async function loadLazy(main) {
  const path = window.location.pathname;
  const article = {
    path,
    category: getMetadata('category'),
    author: getMetadata('author'),
    publisheddate: getMetadata('publisheddate'),
    keywords: getMetadata('keywords'),
  };

  const categoryPath = getCategoryPath(path);
  const categoryName = getCategoryName(article);

  const categoryPlaceholder = main.querySelector('.article .article-category-link');
  if (categoryPlaceholder) {
    const categoryLink = document.createElement('a');
    categoryLink.classList.add('link-arrow', 'article-category-link');
    categoryLink.innerText = categoryName;
    categoryLink.href = categoryPath;
    categoryLink.title = categoryName;
    categoryLink.ariaLabel = categoryName;
    categoryPlaceholder.replaceWith(categoryLink);
  }

  const authorPlaceholder = main.querySelector('.article .article-author-container');
  if (authorPlaceholder) {
    authorPlaceholder.replaceWith(buildArticleAuthor(article));
  }

  const contentSection = main.querySelector('.content-section');
  if (!contentSection) {
    return;
  }

  const author = await getAuthorByName(article.author);
  await buildLearnMore(contentSection, article.keywords);
  if (author) {
    await buildAuthorBlades(contentSection, [author]);
    const authorLink = contentSection.querySelector(
      '.blade.author .blade-text a',
    );
    if (authorLink) {
      authorLink.classList.add('link-arrow');
    }
  }

  const related = await getRelatedArticles(article);
  await buildRelatedContent(contentSection, related);
}
