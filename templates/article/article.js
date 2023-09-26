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
  }
  // TODO: need to determine how to get related content. For now it will just
  // link to a static list.
  await buildRelatedContent(heading.parentElement, [
    'https://main--channelco-crn-com--hlxsites.hlx.page/news/managed-services/painful-decision-slalom-consulting-layoffs-hit-900-workers',
    'https://main--channelco-crn-com--hlxsites.hlx.page/news/internet-of-things/5-industrial-iot-solutions-that-are-solving-big-problems',
    'https://main--channelco-crn-com--hlxsites.hlx.page/news/computing/apple-mac-s-transition-from-intel-has-lured-influx-of-new-customers',
    'https://main--channelco-crn-com--hlxsites.hlx.page/news/computing/asus-starts-selling-nuc-mini-pcs-after-intel-exits-business',
    'https://main--channelco-crn-com--hlxsites.hlx.page/news/computing/dell-s-moonshot-5-key-features-of-concept-luna',
  ]);

  const topLink = document.createElement('a');
  topLink.classList.add('up-arrow', 'to-article-top');
  topLink.href = '#top';
  topLink.target = '_self';
  topLink.title = 'To Top';
  topLink.setAttribute('aria-label', 'To Top');
  topLink.innerHTML = `
    <h3>To Top</h3>
  `;
  heading.parentElement.append(topLink);
}
