import { getMetadata } from "../../scripts/lib-franklin.js";
import { createTag } from "../../scripts/scripts.js";

function createBreadcrumbItem(href, label) {
    return createTag('a', { href, class: 'breadcrumb-item' }, label);
}

export default function decorate(block) {
    // If path ends with '/', pop the last item out. Then pop the current page
    const pathArr = window.location.pathname.split('/');
    if (pathArr[pathArr.length-1] == '') pathArr.pop();
    const lastPath = pathArr[pathArr.length-1]; 
    pathArr.pop();
    
    // Formulate the list for breadcrumb
    const list = createTag('ul', { class: 'breadcrumb-list' });
    let segments = '/';
    pathArr.forEach((path) => {
        if (path !== '') segments += `${path}/`;
        list.append(createBreadcrumbItem(segments, path === '' ? 'HOME' : ` ▸ ${path.replaceAll('-', ' ')}`));
    })

    // Last item in breadcrumb should be current page title for articles and path for anything else
    const templateType = getMetadata('template');
    if (templateType == 'article') {
        const currPageTitle = document.querySelector('h1');
        list.append(` ▸ ${currPageTitle.innerText}`);
    } else {
        list.append(` ▸ ${lastPath.replaceAll('-', ' ')}`);
    }
    

    block.append(list);
}