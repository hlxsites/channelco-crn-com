export default function decorate(block) {
  const main = document.querySelector('main');
  const pageCount = main.dataset.articleCount;
  const usp = new URLSearchParams(window.location.search);
  const pageIndex = Number(usp.get('page') || 1);
  const page = window.location.href.split('?')[0];
  const startIndex = (pageIndex < 3) ? 1 : pageIndex - 2;
  const endIndex = ((pageIndex + 2) >= (pageCount))
    ? pageCount : pageIndex + 2;
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'news list results');
  nav.classList.add('news-list-pagination');
  const ul = document.createElement('ul');
  ul.classList.add('pagination');
  if (pageIndex > 1) {
    const back = document.createElement('li');
    back.classList.add('page-item');
    back.innerHTML = `<a class = "page-link previous" id = "a-prev" href="${page}?page=${pageIndex - 1}">Back</a>`;
    ul.append(back);
  }
  if (startIndex > 1) {
    const dashedOne = document.createElement('li');
    dashedOne.classList.add('page-item');
    dashedOne.innerHTML = `<a class = "page-link" href="${page}?page=1">1 ...</a>`;
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
    } else {
      li.innerHTML = `<a class = "page-link" href="${page}?page=${i}">${i}</a>`;
    }
    ul.append(li);
  }
  if (endIndex < pageCount) {
    const dashedLastLi = document.createElement('li');
    dashedLastLi.classList.add('page-item');
    dashedLastLi.innerHTML = `<a class = "page-link" href="${page}?page=${pageCount}">... ${pageCount}</a>`;
    ul.append(dashedLastLi);
  }
  if (pageIndex < pageCount) {
    const next = document.createElement('li');
    next.classList.add('page-item');
    next.innerHTML = `<a class = "page-link next" id = "a-next" href="${page}?page=${pageIndex + 1}">Next</a>`;
    ul.append(next);
  }
  nav.append(ul);
  block.append(nav);
}
