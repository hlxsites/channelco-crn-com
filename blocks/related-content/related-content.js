import { decorateIcons } from '../../scripts/lib-franklin.js';

/**
 * Modifies the block's DOM as necessary.
 * @param {HTMLElement} block The block's default DOM structure.
 */
export default async function decorate(block) {
  const ul = block.querySelector('ul');
  if (!ul) {
    return;
  }
  const target = ul.parentElement;
  const icon = document.createElement('span');
  icon.classList.add('icon', 'icon-paperclip');

  const list = document.createElement('div');
  list.classList.add('related-content-list');
  list.append(ul);

  target.append(icon, list);

  decorateIcons(block);
}
