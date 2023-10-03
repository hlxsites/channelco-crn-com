import {
  getRecordsFromBlock,
  buildArticleCardsContent,
} from '../../scripts/shared.js';

/**
 * Converts the cards block from its authored format into HTML.
 * @param {HTMLElement} block The block's element on the page.
 */
export default async function decorate(block) {
  // only attempt to decorate the block if it consists of a list of
  // URLs
  const ul = block.querySelector('ul');
  if (!ul) {
    return;
  }

  // retrieve article information for all specified article urls
  const articles = await getRecordsFromBlock(block);

  const blockTarget = block.children.item(0).children.item(0);
  if (!blockTarget) {
    return;
  }

  await buildArticleCardsContent(articles, blockTarget);
}
