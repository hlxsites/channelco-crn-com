import {
  getArticlesByPath,
  getCategoryName,
  getCategoryPath,
} from '../../scripts/scripts.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

/**
 * Converts the cards block from its authored format into HTML.
 * @param {HTMLElement} block The block's element on the page.
 */
export default async function decorate(block) {
  const uls = block.querySelectorAll('ul');
  let paths = [];

  // merge all li's from all ul's into a flat list of article paths
  [...uls].forEach((ul) => {
    ul.remove();
    const articles = ul.querySelectorAll('li');
    const articlePaths = [...articles].map((article) => {
      try {
        const url = new URL(article.textContent);
        const articlePath = url.pathname;
        return articlePath;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('unable to process card due to invalid URL content', e);
      }
      return false;
    })
      .filter((path) => !!path);
    paths = paths.concat(paths, articlePaths);
  });

  // retrieve article information for all specified article paths
  const articles = await getArticlesByPath(paths);

  const blockTarget = block.children.item(0).children.item(0);
  if (!blockTarget) {
    return;
  }

  const addlArticleContainer = document.createElement('div');
  addlArticleContainer.classList.add('sub-article');
  // add article cards for each article
  articles.forEach((article, index) => {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('article-card');

    const category = document.createElement('h3');
    category.classList.add('article-card-category');
    const categoryName = getCategoryName(article);
    category.innerHTML = `
      <a href="${getCategoryPath(article.path)}" class="link-arrow" aria-label="${categoryName}">${categoryName}</a>
    `;

    const title = document.createElement('h5');
    title.classList.add('article-card-title');
    title.innerHTML = `
      <a href="${article.path}" class="uncolored-link" aria-label="${article.title}">${article.title}</a>
    `;

    const author = document.createElement('h5');
    author.classList.add('article-card-author');
    // attempting to predict the URL to the author. may need to change to query
    // author information from index
    const authorId = String(article.author).toLowerCase()
      .replaceAll(/[^0-9a-z ]/g, '')
      .replaceAll(/[^0-9a-z]/g, '-');
    author.innerHTML = `
      <a href="/authors/${authorId}" class="link-arrow" aria-label="By ${article.author}"><span class="uncolored-link">By</span> ${article.author}</a>
    `;

    const date = document.createElement('h5');
    date.classList.add('article-card-date');
    date.innerText = article.publisheddate;

    const description = document.createElement('p');
    description.classList.add('article-card-description');
    description.innerText = article.description;

    const infoDiv = document.createElement('div');
    infoDiv.append(category);
    infoDiv.append(title);
    infoDiv.append(author);
    infoDiv.append(date);
    infoDiv.append(description);

    const articlePictureLink = document.createElement('a');
    articlePictureLink.href = article.path;
    articlePictureLink.setAttribute('aria-label', article.title);
    const articlePicture = createOptimizedPicture(article.image);
    articlePictureLink.append(articlePicture);
    const articleImage = articlePicture.querySelector('img');
    articleImage.alt = article.title;
    articleImage.title = article.title;
    cardDiv.append(articlePictureLink);
    cardDiv.append(infoDiv);

    if (index > 0) {
      addlArticleContainer.append(cardDiv);
    } else {
      cardDiv.classList.add('featured-article');
      blockTarget.append(cardDiv);
    }
  });
  blockTarget.append(addlArticleContainer);
}
