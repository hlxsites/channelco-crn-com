import {
  getCategoryName,
  getCategoryPath,
  createOptimizedPicture,
  getRecordsFromBlock,
  buildArticleAuthor,
} from '../../scripts/shared.js';

/**
 * Converts the cards block from its authored format into HTML.
 * @param {HTMLElement} block The block's element on the page.
 */
export default async function decorate(block) {
  // retrieve article information for all specified article urls
  const articles = await getRecordsFromBlock(block);

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

    const author = buildArticleAuthor(article);
    const description = document.createElement('p');
    description.classList.add('article-card-description');
    description.innerText = article.description;

    const infoDiv = document.createElement('div');
    infoDiv.append(category);
    infoDiv.append(title);
    infoDiv.append(author);
    infoDiv.append(description);

    const articlePictureLink = document.createElement('a');
    articlePictureLink.href = article.path;
    articlePictureLink.setAttribute('aria-label', article.title);
    const articlePicture = createOptimizedPicture(article.image, article.title, index === 0);
    articlePictureLink.append(articlePicture);
    const articleImage = articlePicture.querySelector('img');
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
