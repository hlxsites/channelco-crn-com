import { buildBreadcrumb, getRecordsByPath } from '../../scripts/shared.js';

function scrollToTop(event) {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function createToTopSection() {
  const toTopContainer = document.createElement('div');
  toTopContainer.className = 'back-to-top';

  const toTopCol = document.createElement('div');
  toTopCol.className = 'to-top-text';

  const toTopContent = document.createElement('div');
  const toTopLink = document.createElement('a');
  toTopLink.href = '#top';
  toTopLink.target = '_self';
  toTopLink.ariaLabel = 'To Top';

  const toTopHeader = document.createElement('h3');
  toTopHeader.className = 'back-top-top-section-header';
  toTopHeader.innerText = 'To Top';

  toTopLink.appendChild(toTopHeader);
  toTopContent.appendChild(toTopLink);
  toTopCol.appendChild(toTopContent);
  toTopContainer.appendChild(toTopCol);

  // Event listener to scroll to top smoothly
  toTopLink.addEventListener('click', scrollToTop);

  return toTopContainer;
}

/**
 * Queries all placeholder article cards on the page, retrieves their
 * article records, and replaces each card's placeholder content.
 * @param {HTMLElement} main The page's main element.
 * @returns {Promise} Resolves when cards have been loaded.
 */
async function loadArticleCards(main) {
  // find all article cards with a data-path attribute and build a lookup for each unique path
  const articleLookup = {};
  [...main.querySelectorAll('.article-card.skeleton[data-path]')].forEach(
    (articleCard) => {
      const path = articleCard?.dataset?.path;
      if (!articleLookup[path]) {
        articleLookup[path] = [];
      }
      articleLookup[path].push(articleCard);
    },
  );

  // set json data on any article cards from articles that were found
  const records = await getRecordsByPath(Object.keys(articleLookup));
  records.forEach((record) => {
    const path = record?.path;
    if (articleLookup[path]) {
      articleLookup[path].forEach((articleCard) => {
        articleCard.dataset.json = JSON.stringify(record);
      });
    }
  });
}

/**
 * Creates the general layout of the website, including things like
 * the top ad, right ad, bottom ad, etc.
 * @param {HTMLElement} main The page's main element.
 * @returns {Promise} Resolves when loading is complete.
 */
// eslint-disable-next-line import/prefer-default-export
export async function loadLazy(main) {
  // move all sections into a single container so that they can be
  // placed in the correct location in the page's grid
  const contentSection = document.createElement('div');
  contentSection.className = 'content-section';

  const rightAds = main.querySelector('.right-ad-section');
  if (!rightAds) {
    return;
  }

  [...main.querySelectorAll('main > .section')].forEach((section) => {
    contentSection.appendChild(section);
  });
  main.insertBefore(contentSection, rightAds);
  main.classList.add('grid-layout');

  const toTopSection = createToTopSection();
  main.appendChild(toTopSection);

  loadArticleCards(main);
}

/**
 * Loads the template's general layout onto the page.
 * @param {HTMLElement} main The document's main element.
 */
export function loadEager(main) {
  const topSection = document.createElement('div');
  topSection.classList.add('top-section');

  const topAdSection = document.createElement('div');
  topAdSection.className = 'top-ad-section';
  topAdSection.id = 'top-ad-fragment-container';

  const rightAdSection = document.createElement('div');
  rightAdSection.className = 'right-ad-section';
  rightAdSection.id = 'right-ad-fragment-container';

  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'loading-animation';
  rightAdSection.appendChild(loadingDiv);

  const breadcrumb = buildBreadcrumb();
  const newsWrapper = main.querySelector('.news-slider-wrapper');

  topSection.appendChild(topAdSection);
  if (breadcrumb) {
    topSection.appendChild(breadcrumb);
  }
  if (newsWrapper) {
    newsWrapper.parentElement.classList.remove('news-slider-container');
    topSection.appendChild(newsWrapper);
    newsWrapper.parentElement.classList.add('news-slider-container');
  }
  main.prepend(topSection);
  main.append(rightAdSection);
}

/**
 * Decorates the DOM as needed for the template during the
 * delayed phase.
 */
export function loadDelayed() {
  const bottomAdSection = document.createElement('div');
  bottomAdSection.className = 'bottom-ad-section';
  bottomAdSection.id = 'bottom-ad-fragment-container';

  // Create the close icon
  const closeIcon = document.createElement('img');
  closeIcon.className = 'close-icon';
  closeIcon.src = '/styles/icons/close-ribbon.png';
  closeIcon.alt = 'Close'; // Accessibility

  closeIcon.addEventListener('click', () => {
    bottomAdSection.style.display = 'none';
  });

  bottomAdSection.appendChild(closeIcon);
  document.body.appendChild(bottomAdSection);
}
