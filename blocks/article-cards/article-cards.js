import {
  getCategoryName,
  getCategoryPath,
  createOptimizedPicture,
  getPathsFromBlock,
  buildArticleAuthor,
  buildAdBlock,
} from '../../scripts/shared.js';

/**
 * Builds the link to the article's category. The link will either be a placeholder
 * or an actual link, depending on the provided parameters.
 * @param {import('../../scripts/shared.js').QueryIndexRecord} [article] If provided, the
 *  element will contain a link with the category name. Otherwise it will be a placeholder.
 * @returns {HTMLElement} The card's category.
 */
function createCategoryName(article) {
  const category = document.createElement('h3');
  category.classList.add('article-card-category');
  if (article) {
    const categoryName = getCategoryName(article);
    category.innerHTML = `
      <a href="${getCategoryPath(article.path)}" class="link-arrow" aria-label="${categoryName}">${categoryName}</a>
    `;
  } else {
    category.classList.add('placeholder');
    category.innerText = 'Category';
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
function createTitle(article) {
  const title = document.createElement('h5');
  title.classList.add('article-card-title');
  if (article) {
    title.innerHTML = `
      <a href="${article.path}" class="uncolored-link" aria-label="${article.title}">${article.title}</a>
    `;
  } else {
    title.innerText = 'Article Title: Placeholder Text that will be Replaced with the Title';
    title.classList.add('placeholder');
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
function createDescription(article) {
  const description = document.createElement('p');
  description.classList.add('article-card-description');
  if (article) {
    description.innerText = article.description;
  } else {
    description.classList.add('placeholder');
    description.innerText = 'A summary description of the article that will be displayed in the card. This is placeholder text that will be replaced with information about the article.';
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
function createPicture(article, isFeatured) {
  const articlePictureLink = document.createElement('a');
  if (article) {
    articlePictureLink.href = article.path;
    articlePictureLink.setAttribute('aria-label', article.title);
    const articlePicture = createOptimizedPicture(article.image, article.title, isFeatured);
    articlePictureLink.append(articlePicture);
    const articleImage = articlePicture.querySelector('img');
    articleImage.title = article.title;
  } else {
    articlePictureLink.classList.add('placeholder');
  }
  return articlePictureLink;
}

/**
 * Creates an element containing all the information for an article. The card will either
 * be a placeholder, or display an article's actual information, depending on the provided
 * parameters.
 * @param {string} [path] Full path to the article represented by the card. If provided,
 *  will be set as the card's data-path.
 * @param {boolean} [isFeatured] Should be true to create a card for the featured article.
 * @param {import('../../scripts/shared.js').QueryIndexRecord} [article] If provided, the
 *  card will contain the information from the given article. Otherwise the card will be
 *  a placeholder.
 * @param {HTMLElement} [ad] If specified, the ad to include at the bottom of the card.
 * @returns {HTMLElement} Card information for an article.
 */
function createCard(path, isFeatured = false, article = false, ad = false) {
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('article-card');

  if (!article) {
    cardDiv.classList.add('skeleton');
  }

  if (isFeatured) {
    cardDiv.classList.add('featured-article');
  }

  if (path) {
    cardDiv.dataset.path = path;
  }

  const category = createCategoryName(article);
  const title = createTitle(article);
  const author = buildArticleAuthor(article);
  const description = createDescription(article);

  const infoDiv = document.createElement('div');
  infoDiv.append(category);
  infoDiv.append(title);
  infoDiv.append(author);
  infoDiv.append(description);

  const articlePicture = createPicture(article, isFeatured);
  cardDiv.append(articlePicture);
  cardDiv.append(infoDiv);

  if (ad) {
    cardDiv.append(ad);
  }

  return cardDiv;
}

function getPath(paths, index) {
  if (paths.length > index) {
    return paths[index];
  }
  return false;
}

function buildAd(target, id, type) {
  const existingAd = target.querySelector(`#${id}`);
  if (existingAd) {
    return existingAd.parentElement.parentElement;
  }
  const ad = document.createElement('div');
  ad.classList.add('article-cards-ad');
  const adBlock = buildAdBlock(id, type);
  if (adBlock) {
    ad.append(adBlock);
  }
  return ad;
}

function buildCards(block, cardCount, articlePaths = []) {
  const blockTarget = block.children.item(0).children.item(0);
  if (!blockTarget) {
    return;
  }

  const cardDiv = document.createElement('div');
  const addlArticleContainer = document.createElement('div');
  addlArticleContainer.classList.add('sub-article');

  const includeAds = block.classList.contains('lead-article');
  const featured = createCard(getPath(articlePaths, 0), true, false, includeAds ? buildAd(blockTarget, 'unit-1659132512259', 'Advertisement') : false);
  cardDiv.append(featured);

  // add article cards for each article
  for (let i = 1; i < cardCount; i += 1) {
    const card = createCard(getPath(articlePaths, i));
    addlArticleContainer.append(card);
  }
  cardDiv.append(addlArticleContainer);

  if (includeAds && cardCount < 6) {
    cardDiv.append(buildAd(blockTarget, 'unit-1661973671931', 'Sponsored post'));
  }
  blockTarget.replaceWith(cardDiv);
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
  let cardCount = block.dataset.cardCount || 0;
  // retrieve article information for all specified article urls
  const articlePaths = getPathsFromBlock(block);

  if (articlePaths.length) {
    cardCount = articlePaths.length;
  }

  if (!cardCount) {
    return;
  }

  buildCards(block, cardCount, articlePaths);

  // listens for attribute modifications on child elements, and will replace a placeholder card
  // with an actual card when a skeleton's data-json attribute is set
  const observer = new MutationObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.type === 'attributes' && entry.target.classList.contains('skeleton') && entry.target.dataset.json && entry.attributeName === 'data-json') {
        const article = JSON.parse(entry.target.dataset.json);
        const finalCard = createCard(
          article.path,
          entry.target.classList.contains('featured-article'),
          article,
          entry.target.querySelector('.article-cards-ad'),
        );
        entry.target.parentNode.replaceChild(finalCard, entry.target);
      } else if (entry.type === 'attributes' && entry.attributeName === 'data-card-count' && entry.target.dataset.cardCount) {
        buildCards(block, entry.target.dataset.cardCount);
      }
    });
  });
  observer.observe(block, { attributes: true, subtree: true });
}
