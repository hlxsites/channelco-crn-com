import {
  getMetadata,
  buildBlock,
  decorateBlock,
  loadBlock,
} from '../../scripts/lib-franklin.js';

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
  getLastDefaultSection,
  createArticle,
} from '../../scripts/shared.js';

function getArticleByMetadata() {
  return {
    path: window.location.pathname,
    category: getMetadata('category'),
    author: getMetadata('author'),
    publisheddate: getMetadata('publisheddate'),
    keywords: getMetadata('keywords'),
  };
}

/**
 * Processes the DOM as necessary in order to auto block items required
 * for all articles.
 * @param {HTMLElement} main The page's main content.
 */
// eslint-disable-next-line import/prefer-default-export
export function loadEager(main) {
  const slideshow = getMetadata('slideshow');
  const heading = main.querySelector('h1');
  if (!heading) {
    return;
  }
  if (slideshow !== 'true') {
    const picture = main.querySelector('picture');
    if (!picture) {
      return;
    }
    buildSocialShare(picture);
  }
  const article = getArticleByMetadata();
  const categoryPath = getCategoryPath(article.path);
  const categoryName = getCategoryName(article);
  const categoryLink = document.createElement('a');
  categoryLink.classList.add('link-arrow', 'article-category-link');
  categoryLink.innerText = categoryName;
  categoryLink.href = categoryPath;
  categoryLink.title = categoryName;
  categoryLink.ariaLabel = categoryName;
  heading.parentElement.insertBefore(categoryLink, heading);

  const authorContainer = buildArticleAuthor(article);
  heading.parentElement.insertBefore(authorContainer, heading.nextSibling);
  if (slideshow === 'true') {
    const count = createArticle(main);
    if (count > 1) {
      main.dataset.articleCount = count - 1;
    } else {
      main.dataset.articleCount = count;
    }
  }
}

/**
 * Processes the DOM as necessary in order to auto block items required
 * for all articles.
 * @param {HTMLElement} main The page's main content.
 */
// eslint-disable-next-line import/prefer-default-export
export async function loadLazy(main) {
  const article = getArticleByMetadata();
  const lastSection = getLastDefaultSection(main);
  if (!lastSection) {
    return;
  }
  if (getMetadata('slideshow') === 'true') {
    const paginationTop = buildBlock('pagination', { elems: [] });
    const paginationBottom = buildBlock('pagination', { elems: [] });
    const paginationPlaceholder = main.querySelector('.pagination-placeholder');
    paginationPlaceholder.parentElement
      .insertBefore(paginationTop, paginationPlaceholder.nextSibling);
    lastSection.append(paginationBottom);
    decorateBlock(paginationBottom);
    decorateBlock(paginationTop);
    await loadBlock(paginationTop);
    await loadBlock(paginationBottom);
  }
  await buildLearnMore(lastSection, article.keywords);
  const author = await getAuthorByName(article.author);
  if (author) {
    await buildAuthorBlades(lastSection, [author]);
    const authorLink = lastSection.querySelector(
      '.blade.author .blade-text a',
    );
    if (authorLink) {
      authorLink.classList.add('link-arrow');
    }
  }
  const related = await getRelatedArticles(article);
  await buildRelatedContent(lastSection, related);
}
