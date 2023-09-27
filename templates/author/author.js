import {
  buildBlock,
  decorateBlock,
  loadBlock,
  getMetadata,
  decorateIcons,
} from '../../scripts/lib-franklin.js';
import { createOptimizedPicture } from '../../scripts/shared.js';

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
export default async function decorate(main) {
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
}
