import { decorateIcons } from '../../scripts/lib-franklin.js';

/**
 * Modifies the DOM as required to create the block.
 * @param {HTMLElement} block Element representing the
 *  default DOM of the block.
 */
export default function decorate(block) {
  const ul = block.querySelector('ul');
  if (!ul) {
    return;
  }
  const target = ul.parentElement;
  const infoIcon = document.createElement('span');
  infoIcon.classList.add('icon', 'icon-info-circle');

  const links = document.createElement('div');
  links.classList.add('learn-more-links');
  links.appendChild(ul);

  target.append(infoIcon, links);
  block.querySelectorAll('a').forEach((a) => { a.classList.add('link-arrow'); });

  decorateIcons(block);
}
