import { decorateIcons } from '../../scripts/lib-franklin.js';
import ffetch from '../../scripts/ffetch.js';

const CHUNK_SIZE = 10000;

async function renderContent(block) {
  const page = window.location.pathname;
  const title = document.querySelector('title').innerText;
  let splitURL = page.split('/');
  const sheet = page.includes('news') ? 'article' : 'slideshow';
  const URLTailEnd = splitURL[splitURL.length - 1];
  /* eslint-disable no-restricted-globals */
  const pageIndex = isNaN(URLTailEnd) ? 1 : Number(URLTailEnd);
  const firstArticle = isNaN(URLTailEnd)
    ? page : page.slice(0, (page.length - (URLTailEnd.length + 1)));
  const articles = ffetch('/query-index.json')
    .chunks(CHUNK_SIZE)
    .sheet(sheet)
    .filter((p) => p.title === title);
  const filteredList = [];
  /* eslint-disable no-restricted-syntax */
  for await (const article of articles) {
    filteredList.push(article);
  }
  const pathArray = [];
  pathArray.push(firstArticle);
  filteredList.forEach((element) => {
    splitURL = element.path.split('/');
    const URLTailEnd2 = Number(splitURL[splitURL.length - 1]);
    pathArray[URLTailEnd2] = element.path;
  });
  const startIndex = (pageIndex < 3) ? 1 : pageIndex - 2;
  const endIndex = ((pageIndex + 2) >= (pathArray.length - 1))
    ? pathArray.length - 1 : pageIndex + 2;
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'news list results');
  nav.classList.add('news-list-pagination');
  const ul = document.createElement('ul');
  ul.classList.add('pagination');
  if (pageIndex > 1) {
    const back = document.createElement('li');
    back.classList.add('page-item');
    back.innerHTML = `<a class = "page-link previous" id = "a-prev" href="${pathArray[pageIndex - 1]}">Back</a>`;
    ul.append(back);
  }
  if (startIndex > 1) {
    const dashedOne = document.createElement('li');
    dashedOne.classList.add('page-item');
    dashedOne.innerHTML = `<a class = "page-link" href="${pathArray[1]}">1 ...</a>`;
    ul.append(dashedOne);
  }
  for (let i = startIndex; i <= endIndex; i += 1) {
    const li = document.createElement('li');
    li.classList.add('page-item');
    if (i === pageIndex && i === 1) {
      li.innerHTML = `<a class = "page-link" href="#">${i}</a>`;
      li.classList.add('active-first');
      li.setAttribute('aria-current', 'page');
    } else if (i === pageIndex && i === endIndex) {
      li.innerHTML = `<a class = "page-link next" href="#">${i}</a>`;
      li.classList.add('active-last');
      li.setAttribute('aria-current', 'page');
    } else if (i === pageIndex) {
      li.innerHTML = `<a class = "page-link" href="#">${i}</a>`;
      li.classList.add('active');
      li.setAttribute('aria-current', 'page');
    } else if (undefined !== pathArray[i]) {
      li.innerHTML = `<a class = "page-link" href="${pathArray[i]}">${i}</a>`;
    }
    ul.append(li);
  }
  if (endIndex < pathArray.length - 1) {
    const dashedLastLi = document.createElement('li');
    dashedLastLi.classList.add('page-item');
    dashedLastLi.innerHTML = `<a class = "page-link" href="${pathArray[pathArray.length - 1]}">... ${pathArray.length - 1}</a>`;
    ul.append(dashedLastLi);
  }
  if (pageIndex < (pathArray.length - 1)) {
    const next = document.createElement('li');
    next.classList.add('page-item');
    next.innerHTML = `<a class = "page-link next" id = "a-next" href="${pathArray[pageIndex + 1]}">Next</a>`;
    ul.append(next);
  }
  nav.append(ul);
  block.append(nav);
  decorateIcons(block);
}

export default async function decorate(block) {
  renderContent(block);
}
