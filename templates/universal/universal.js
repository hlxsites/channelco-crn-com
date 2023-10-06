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
 * Creates the general layout of the website, including things like
 * the top ad, right ad, bottom ad, etc.
 * @param {HTMLElement} main The page's main element.
 * @returns {Promise} Resolves when loading is complete.
 */
// eslint-disable-next-line import/prefer-default-export
export async function loadLazy(main) {
  const mainContainer = document.createElement('div');
  mainContainer.className = 'main-content-container';

  const contentSection = document.createElement('div');
  contentSection.className = 'content-section';

  const topAdSection = document.createElement('div');
  topAdSection.className = 'top-ad-section';
  topAdSection.id = 'top-ad-fragment-container';

  const contentAndAdsContainer = document.createElement('div');
  contentAndAdsContainer.className = 'content-and-ads-container';

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
  contentAndAdsContainer.appendChild(contentSection);
  contentAndAdsContainer.appendChild(rightAdSection);

  const breadcrumb = main.querySelector('.breadcrumb-container');
  const newsWrapper = main.querySelector('.news-slider-wrapper');

  if (breadcrumb) {
    main.insertBefore(topAdSection, breadcrumb);
  } else {
    main.prepend(topAdSection);
  }

  // Move remaining sections in main to contentSection
  Array.from(main.children)
    .filter((child) => child !== topAdSection && child !== breadcrumb)
    .forEach((section) => {
      contentSection.appendChild(section);
    });

  mainContainer.appendChild(contentAndAdsContainer);

  if (newsWrapper) {
    contentAndAdsContainer.prepend(newsWrapper);
    const newsContainer = main.querySelector('.news-slider-container');
    if (newsContainer) {
      newsContainer.classList.remove('news-slider-container');
    }
  }

  const toTopSection = createToTopSection();
  mainContainer.appendChild(toTopSection);

  main.appendChild(mainContainer);

  document.body.appendChild(bottomAdSection);
}
