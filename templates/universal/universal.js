import {
  decorateBlock,
  loadBlock,
} from '../../scripts/lib-franklin.js';
import {
  getRecordsByPath,
  buildBreadcrumb,
} from '../../scripts/shared.js';

/**
 * Finds all placeholder article cards on the page, extracts the path of each, queries the
 * index for all paths, then sets the data-json attribute on each placeholder card with
 * the article's JSON.
 * @param {HTMLElement} main Main element of the document.
 */
async function loadArticleCards(main) {
  // find all article cards with a data-path attribute and build a lookup for each unique path
  const articleLookup = {};
  [...main.querySelectorAll('.article-card.skeleton[data-path]')]
    .forEach((articleCard) => {
      const path = articleCard?.dataset?.path;
      if (!articleLookup[path]) {
        articleLookup[path] = [];
      }
      articleLookup[path].push(articleCard);
    });

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
 * Modifies the DOM during the lazy phase, as required by the template
 * @param {HTMLElement} main Main element of the document.
 */
export default function loadLazy(main) {
  const contentSection = document.createElement('div');
  contentSection.classList.add('content-section');
  [...main.children].forEach((child) => {
    if (child.classList.contains('section')) {
      contentSection.append(child);
    }
  });
  main.classList.add('main-grid');
  main.insertBefore(contentSection, main.querySelector('.right-ad-section'));
  main.insertBefore(createToTopSection(), main.querySelector('.bottom-ad-section'));
  loadArticleCards(main);
}

/**
 * Loads the template's eager phase, which decorates the default content with
 * the site's layout.
 * @param {HTMLElement} main The document's main element.
 */
export async function loadEager(main) {
  const topSection = document.createElement('div');
  topSection.classList.add('top-section');

  const topAdSection = document.createElement('div');
  topAdSection.className = 'top-ad-section';
  topAdSection.id = 'top-ad-fragment-container';
  topSection.appendChild(topAdSection);

  const breadcrumb = buildBreadcrumb();
  if (breadcrumb) {
    topSection.appendChild(breadcrumb);
    decorateBlock(breadcrumb);
    await loadBlock(breadcrumb);
  }

  const newsWrapper = main.querySelector('.news-slider-wrapper');
  if (newsWrapper) {
    newsWrapper.parentElement.classList.remove('news-slider-container');
    topSection.classList.add('news-slider-container');
    topSection.appendChild(newsWrapper);
  }

  main.prepend(topSection);

  const rightAdSection = document.createElement('div');
  rightAdSection.className = 'right-ad-section';
  rightAdSection.id = 'right-ad-fragment-container';

  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'loading-animation';
  rightAdSection.appendChild(loadingDiv);

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

  main.appendChild(rightAdSection);
  main.appendChild(bottomAdSection);
}
