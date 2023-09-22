function createBreadcrumbItem(href, label) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.classList.add('breadcrumb-item');
  a.href = href;
  a.innerHTML = label;
  li.append(a);
  return li;
}

export default function decorate(block) {
  // If path ends with '/', pop the last item out. Then pop the current page
  const pathArr = window.location.pathname.split('/');
  if (pathArr[pathArr.length - 1] === '') pathArr.pop();
  const lastPath = pathArr[pathArr.length - 1];
  pathArr.pop();

  // Formulate the list for breadcrumb
  const list = document.createElement('ul');
  list.classList.add('breadcrumb-list');
  let segments = '/';
  pathArr.forEach((path) => {
    if (path !== '') segments += `${path}/`;
    list.append(createBreadcrumbItem(segments, path === '' ? 'HOME' : ` ▸ ${path.replaceAll('-', ' ')}`));
  });

  // Last item in breadcrumb should be current page title. If not found, default to path
  const currPageTitle = document.querySelector('h1');
  list.append(' ▸ ');
  list.append(currPageTitle ? currPageTitle.innerText : lastPath.replaceAll('-', ' '));

  block.append(list);
}
