import { getArticlesByPath } from '../../scripts/scripts.js';
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
  const authorNames = {};
  articles.forEach((article) => {
    if (article.author) {
      authorNames[article.author] = true;
    }
  });

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
    // TODO: need to determine how to get category
    category.innerHTML = `
      <a href="/news/networking">Networking</a>
    `;

    const title = document.createElement('h5');
    title.classList.add('article-card-title');
    title.innerText = article.title;

    const author = document.createElement('h5');
    author.classList.add('article-card-author');
    const authorId = String(article.author).toLowerCase()
      .replaceAll(/[^0-9a-z ]/g, '')
      .replaceAll(/[^0-9a-z]/g, '-');
    author.innerHTML = `
      by <a href="/authors/${authorId}">${article.author}</a>
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

    cardDiv.append(createOptimizedPicture(article.image));
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
