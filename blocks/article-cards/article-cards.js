import {
  getCategoryName,
  getCategoryPath,
  createOptimizedPicture,
  buildArticleAuthor,
  getPathsFromBlock,
} from '../../scripts/shared.js';

/**
 * Builds the link to the article's category. The link will either be a placeholder skeleton
 * or an actual link, depending on the provided parameters.
 * @param {import('../../scripts/shared.js').QueryIndexRecord} [article] If provided, the
 *  element will contain a link with the category name. Otherwise it will be a placeholder.
 * @returns {HTMLElement} The card's category.
 */
function createCategoryLink(article = false) {
  const category = document.createElement('h3');
  category.classList.add('article-card-category');

  if (article) {
    const categoryName = getCategoryName(article);
    category.innerHTML = `
      <a href="${getCategoryPath(article.path)}" class="link-arrow" aria-label="${categoryName}">${categoryName}</a>
    `;
  }

  return category;
}

/**
 * Builds the article's title information. It will either be a placeholder skeleton
 * or the actual title, depending on the provided parameters.
 * @param {import('../../scripts/shared.js').QueryIndexRecord} [article] If provided, the
 *  element will contain a link with the article title. Otherwise it will be a placeholder.
 * @returns {HTMLElement} The card's title.
 */
function createTitle(article = false) {
  const title = document.createElement('h5');
  title.classList.add('article-card-title');

  if (article) {
    title.innerHTML = `
      <a href="${article.path}" class="uncolored-link" aria-label="${article.title}">${article.title}</a>
    `;
  }

  return title;
}

/**
 * Builds the article's description information. It will either be a placeholder skeleton
 * or the actual description, depending on the provided parameters.
 * @param {import('../../scripts/shared.js').QueryIndexRecord} [article] If provided, the
 *  element will contain the article's description. Otherwise it will be a placeholder.
 * @returns {HTMLElement} The card's category.
 */
function createDescription(article = false) {
  const description = document.createElement('p');
  description.classList.add('article-card-description');

  if (article) {
    description.innerText = article.description;
  }

  return description;
}

/**
 * Builds the article's picture element. It will either be a placeholder skeleton
 * or the actual picture, depending on the provided parameters.
 * @param {boolean} isFeatured Should be true if the card is the featured card.
 * @param {import('../../scripts/shared.js').QueryIndexRecord} [article] If provided, the
 *  element will contain the article's picture. Otherwise it will be a placeholder.
 * @returns {HTMLElement} The card's picture.
 */
function createPicture(isFeatured, article = false) {
  const articlePictureLink = document.createElement('a');
  if (article) {
    articlePictureLink.href = article.path;
    articlePictureLink.setAttribute('aria-label', article.title);
    const articlePicture = createOptimizedPicture(article.image, article.title, isFeatured);
    articlePictureLink.append(articlePicture);
    const articleImage = articlePicture.querySelector('img');
    articleImage.title = article.title;
  }
  return articlePictureLink;
}

/**
 * Creates an element containing all the information for an article. The card will either
 * be a placeholder, or display an article's actual information, depending on the provided
 * parameters.
 * @param {boolean} isFeatured Should be true to create a card for the featured article.
 * @param {string} [path] Full path to the article represented by the card. If provided,
 *  will be set as the card's data-path.
 * @param {import('../../scripts/shared.js').QueryIndexRecord} [article] If provided, the
 *  card will contain the information from the given article. Otherwise the card will be
 *  a placeholder.
 * @returns {HTMLElement} Card information for an article.
 */
function createCard(isFeatured, path = false, article = false) {
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('article-card');
  if (isFeatured) {
    cardDiv.classList.add('featured-article');
  }
  if (!article) {
    cardDiv.classList.add('skeleton');
  }
  if (path) {
    cardDiv.dataset.path = path;
  }

  const category = createCategoryLink(article);
  const title = createTitle(article);
  const author = buildArticleAuthor(article);
  const description = createDescription(article);

  const infoDiv = document.createElement('div');
  infoDiv.append(category);
  infoDiv.append(title);
  infoDiv.append(author);
  infoDiv.append(description);

  const picture = createPicture(isFeatured, article);
  cardDiv.append(picture);
  cardDiv.append(infoDiv);

  return cardDiv;
}

/**
 * Converts the cards block from its authored format into HTML.
 *
 * Loading the cards fully requires action by something external to the block. During
 * the eager phase, the block will load placeholders based on the number of list items
 * (which must be links whose href and text are the same) contained in the block's
 * content. Each placeholder card will have a data-path attribute containing the path to
 * the article represented by the card.
 *
 * As an alternative to list items with article URLs, setting data-card-count on the
 * block will instruct the block to create the specified number of card placeholders.
 *
 * The cards rely on something setting each card's data-json attribute to the stringified
 * JSON of the article content that should be loaded into the card. Once this attribute is
 * set, the block will replace the placeholder card with an actual card based on the JSON.
 *
 * As an example, during the lazy phase the universal template will find all placeholder
 * cards on the page, query the index for articles base on each placeholder's data-path,
 * then set the data-json on each card with record data from the index.
 * @param {HTMLElement} block The block's element on the page.
 */
export default function decorate(block) {
  const paths = getPathsFromBlock(block);
  let cardCount = paths.length;
  if (!cardCount && block.dataset.cardCount) {
    // if no paths found, fall back to data-card-count
    cardCount = parseInt(block.dataset.cardCount);
  }

  if (!cardCount) {
    return;
  }

  const blockTarget = block.children.item(0).children.item(0);
  if (!blockTarget) {
    return;
  }

  const addlArticleContainer = document.createElement('div');
  addlArticleContainer.classList.add('sub-article');

  // add article cards for each article. These will be placeholder cards.
  const featured = createCard(true, paths.length ? paths[0] : false);
  for (let i = 1; i < cardCount; i += 1) {
    const card = createCard(false, paths.length ? paths[i] : false);
    addlArticleContainer.append(card);
  }
  blockTarget.append(featured);
  blockTarget.append(addlArticleContainer);

  // listens for attribute modifications on child elements, and will replace a placeholder card with an
  // actual card when a skeleton's data-json attribute is set
  const observer = new MutationObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.type === 'attributes' && entry.target.classList.contains('skeleton') && entry.target.dataset.json) {
        const article = JSON.parse(entry.target.dataset.json);
        const finalCard = createCard(entry.target.classList.contains('featured-article'), article.path, article);
        entry.target.parentNode.replaceChild(finalCard, entry.target);
      }
    });
  });
  observer.observe(blockTarget, { attributes: true, subtree: true });
}
