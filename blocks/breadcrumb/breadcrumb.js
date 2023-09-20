import { createTag } from "../../scripts/scripts.js";

function createBreadcrumbItem(href, label) {
    return createTag('a', { href, class: 'breadcrumb-item' }, label);
}

export default function decorate(block) {
    // Add black border div above breadcrumb
    const blackBorder = createTag('div', { class: 'breadcrumb-black-border' });
    block.append(blackBorder);

    // If path ends with '/', pop the last item out. Then pop the current page
    const pathArr = window.location.pathname.split('/');
    if (pathArr[pathArr.length-1] == '') pathArr.pop();
    pathArr.pop();

    const currPageTitle = document.querySelector('h1');
    
    const list = createTag('ul', { class: 'breadcrumb-list' });
    let segments = '/';
    pathArr.forEach((path) => {
        if (path !== '') segments += `${path}/`;

        list.append(createBreadcrumbItem(segments, path === '' ? 'HOME' : ` ▸ ${path.replaceAll('-', ' ')}`));
    })

    list.append(` ▸ ${currPageTitle.innerText}`);

    block.append(list);
}