import {
  getRecordByPath,
  comparePublishDate,
  createTemplateWithArticles,
  queryIndex,
  isArticle,
  commaSeparatedListContains,
} from '../../scripts/shared.js';

/**
 * Modifies the DOM as needed for the template.
 * @param {HTMLElement} main The page's main element.
 */
export default async function decorate(main) {
  const company = await getRecordByPath(window.location.pathname);
  if (!company) {
    return;
  }

  const companyName = company.companynames;
  const articles = await queryIndex((record) => isArticle(record)
    && commaSeparatedListContains(record.companynames, companyName));
  articles.sort(comparePublishDate);

  const lastElement = main.children.length ? main.children.item(main.children.length - 1) : null;
  const h1 = document.createElement('h1');
  h1.innerText = companyName;
  main.insertBefore(h1, lastElement);

  const h2 = document.createElement('h2');
  h2.classList.add('link-arrow');
  h2.innerText = `News About ${companyName}`;
  main.insertBefore(h2, lastElement);

  await createTemplateWithArticles(main, 'More News', articles, lastElement);
}
