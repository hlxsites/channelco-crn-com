import {
  buildBlock,
  decorateBlock,
  loadBlock,
} from '../../scripts/lib-franklin.js';
import {
  getAllAuthors,
  createOptimizedPicture,
} from '../../scripts/scripts.js';

const BIO_LENGTH = 350;

function createAuthorLink(author) {
  const authorLink = document.createElement('a');
  authorLink.title = author.author;
  authorLink.setAttribute('alt', author.author);
  authorLink.href = author.path;
  return authorLink;
}

/**
 * Decorates the author blades by retrieving all authors from the site index
 * and auto blocking blades with each author's information.
 * @param {HTMLElement} block Target where author blades will be added.
 */
export default async function decorate(block) {
  block.innerHTML = '';
  try {
    const authors = await getAllAuthors();
    const authorRows = [];
    authors.forEach((author) => {
      const pictureLink = createAuthorLink(author);
      pictureLink.append(createOptimizedPicture(author.authorimage));

      const nameLink = createAuthorLink(author);
      const authorName = document.createElement('h4');
      authorName.innerText = author.author;
      nameLink.append(authorName);

      let bioStr = String(author.authordescription);
      if (bioStr.length > BIO_LENGTH) {
        bioStr = `${bioStr.substring(0, BIO_LENGTH)}... <a href="${author.path}" title="Read more" aria-label="Read more">Read more</a>`;
      }
      const bio = document.createElement('p');
      bio.innerHTML = bioStr;

      authorRows.push([{ elems: [pictureLink] }, { elems: [nameLink, bio] }]);
    });
    const blades = buildBlock('blade', authorRows);
    blades.classList.add('author');
    block.append(blades);
    decorateBlock(blades);
    await loadBlock(blades);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('Unable to retrieve author information', e);
  }
}
