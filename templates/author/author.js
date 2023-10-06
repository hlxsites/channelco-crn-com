import {
  buildBlock,
  decorateBlock,
  loadBlock,
  getMetadata,
  decorateIcons,
} from '../../scripts/lib-franklin.js';
import {
  createOptimizedPicture,
  getArticlesByAuthor,
  comparePublishDate,
  buildArticleCardsBlock,
} from '../../scripts/shared.js';

function addIcon(beforeElement, iconName) {
  const span = document.createElement('span');
  span.classList.add('icon', iconName);
  beforeElement.parentElement.classList.add('author-link-icon');
  beforeElement.parentElement.insertBefore(span, beforeElement);
}

/**
 * Manipulates the DOM as necessary to format the template.
 * @param {HTMLElement} main Main element of the page.
 */
export async function loadEager(main) {
  const defaultContent = main.querySelector('.default-content-wrapper');
  if (!defaultContent) {
    return;
  }
  defaultContent.querySelectorAll('p > a').forEach((link) => {
    if (link.parentElement.children.length === 1) {
      if (link.href === link.textContent) {
        const href = String(link.href);
        if (href.includes('linkedin.com')) {
          addIcon(link, 'icon-linked-in');
        } else if (href.includes('twitter.com')) {
          addIcon(link, 'icon-twitter');
        }
      } else if (String(link.href).startsWith('mailto:')) {
        link.classList.remove('button', 'primary');
        addIcon(link, 'icon-mail');
      }
    }
  });
  const authorPicture = createOptimizedPicture(getMetadata('authorimage'));
  const elems = [];
  [...defaultContent.children].forEach((child) => {
    elems.push(child);
  });
  const block = buildBlock('blade', [
    [{ elems: [authorPicture] }, { elems }],
  ]);
  block.classList.add('author');
  defaultContent.append(block);
  decorateBlock(block);
  await loadBlock(block);
  decorateIcons(block);

  const authorName = getMetadata('author');
  const newsLink = document.createElement('h2');
  const label = `Latest News from ${authorName}`;
  newsLink.innerHTML = `
    <a href="/news/" title="${label}" aria-label="${label}">
      ${label}
    </a>
  `;
  defaultContent.append(newsLink);

  const articles = await getArticlesByAuthor(authorName);
  articles.sort(comparePublishDate);

  await buildArticleCardsBlock(
    articles.slice(0, 15),
    (articleCards) => defaultContent.append(articleCards),
  );

  const adIdLabel = document.createElement('div');
  adIdLabel.innerText = 'id';
  const adId = document.createElement('div');
  adId.innerText = 'unit-1659132512259';
  const adTypeLabel = document.createElement('div');
  adTypeLabel.innerText = 'type';
  const adType = document.createElement('div');
  adType.innerText = 'Advertisement';
  const ad = buildBlock('ad', [[{ elems: [adIdLabel, adId] }, { elems: [adTypeLabel, adType] }]]);
  defaultContent.append(ad);
  decorateBlock(ad);
  await loadBlock(ad);

  const navigation = buildBlock('category-navigation', { elems: [] });
  defaultContent.append(navigation);
  decorateBlock(navigation);
  await loadBlock(navigation);
}
