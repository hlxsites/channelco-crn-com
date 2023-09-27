import { decorateIcons } from '../../scripts/lib-franklin.js';
import { getRecordsFromBlock } from '../../scripts/shared.js';

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

  target.append(icon, list);

  decorateIcons(block);

  const articles = await getRecordsFromBlock(block);
  const articleList = document.createElement('ul');
  articles.forEach((article) => {
    const articleItem = document.createElement('li');
    articleItem.innerHTML = `
      <a href="${article.path}" title="${article.title}" aria-label="${article.title}">
        ${article.title}
      </a>
    `;
    articleList.append(articleItem);
  });
  list.append(articleList);
}
