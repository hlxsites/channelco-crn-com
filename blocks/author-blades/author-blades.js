import {
  getRecordsFromBlock,
  buildAuthorBlades,
} from '../../scripts/shared.js';

const BIO_LENGTH = 350;

/**
 * Decorates the author blades by retrieving all authors from the site index
 * and auto blocking blades with each author's information.
 * @param {HTMLElement} block Target where author blades will be added.
 */
export default async function decorate(block) {
  try {
    const authors = await getRecordsFromBlock(block);
    await buildAuthorBlades(block, authors, BIO_LENGTH);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('Unable to retrieve author information', e);
  }
}
