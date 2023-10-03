/* eslint-disable no-plusplus */
import { getMetadata, decorateIcons } from '../../scripts/lib-franklin.js';
import { decorateLinkedPictures } from '../../scripts/shared.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeSearch() {
  document.querySelector('nav .nav-search').classList.remove('active');
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }

    const search = document.querySelector('nav .nav-search');
    if (search && search.classList.contains('active')) {
      closeSearch();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Modifies the DOM to support the site's search UI.
 * @param {HTMLElement} nav The site's nav section, as defined in the nav content
 *  fragment.
 */
function decorateSearch(nav) {
  const search = nav.querySelector('.icon.icon-search');
  if (!search) {
    return;
  }

  const searchDiv = document.createElement('div');
  searchDiv.classList.add('nav-search');
  searchDiv.innerHTML = `
    <div class="nav-search-container">
      <p class="nav-search-title">Search<span class="icon icon-close"></span></p>
      <form action="/search" class="nav-search-form">
        <input type="search" name="query" placeholder="Search" aria-label="Search" size="1" />
        <button type="submit">Search</button>
      </form>
      <button id="nav-search-container-close">Close</button>
    </div>
  `;
  nav.append(searchDiv);

  search.addEventListener('click', () => {
    searchDiv.classList.add('active');
    searchDiv.focus();
  });

  nav.querySelector('#nav-search-container-close').addEventListener('click', (e) => {
    e.preventDefault();
    closeSearch();
  });
  nav.querySelector('.nav-search-container .icon.icon-close').addEventListener('click', () => {
    closeSearch();
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('role', 'button');
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('role');
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

function menuDrop() {
  const menuItems = document.querySelectorAll('.nav-drop');

  menuItems.forEach((menuItem) => {
    menuItem.addEventListener('click', function func() {
      const container = document.getElementById('menu-container');
      const navContent = this.querySelector('.nav-content').innerHTML;
      // update content in menu-container
      container.innerHTML = navContent;
      // toggle container visibility
      if (container.style.maxHeight && container.style.maxHeight !== '0px') {
        container.style.maxHeight = '0px';
        container.setAttribute('aria-expanded', 'false');
        container.innerHTML = '';
      } else {
        container.style.maxHeight = `${container.scrollHeight}px`;
        container.setAttribute('aria-expanded', 'true');
      }
    });
  });
}
/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  // fetch nav content
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  const resp = await fetch(`${navPath}.plain.html`);

  if (resp.ok) {
    const html = await resp.text();

    // decorate nav DOM
    const nav = document.createElement('nav');
    nav.id = 'nav';
    nav.innerHTML = html;

    const classes = ['brand', 'sections', 'tools'];
    classes.forEach((c, i) => {
      const section = nav.children[i];
      if (section) section.classList.add(`nav-${c}`);
    });

    let contentIDCounter = 0;
    const navSections = nav.querySelector('.nav-sections');
    if (navSections) {
      navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
        // add nav-content class & data-content attribute
        const innerUL = navSection.querySelector('ul');
        if (innerUL) {
          navSection.classList.add('nav-drop');
          innerUL.classList.add('nav-content');
          const contentID = contentIDCounter++;
          navSection.setAttribute('data-content-id', contentID);
        }

        if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
        navSection.addEventListener('click', () => {
          if (isDesktop.matches) {
            const expanded = navSection.getAttribute('aria-expanded') === 'true';
            toggleAllNavSections(navSections);
            navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            // mobile nav menu drop down
          } else {
            const expanded = navSection.getAttribute('aria-expanded') === 'true';
            navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            const ul = navSection.querySelector('ul');
            if (ul) {
              const list = ul.querySelectorAll('li');
              list.forEach((li) => {
                li.addEventListener('click', (event) => {
                  event.stopPropagation();
                  const childExpanded = li.getAttribute('aria-expanded') === 'true';
                  li.setAttribute('aria-expanded', childExpanded ? 'false' : 'true');
                });
              });
            }
          }
        });
      });
    }

    // hamburger for mobile
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
    hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
        <span class="nav-hamburger-icon"></span>
      </button>`;
    hamburger.addEventListener('click', () => toggleMenu(nav)); // removed navSections to keep ari expanded false in mobile
    nav.prepend(hamburger);
    nav.setAttribute('aria-expanded', 'false');
    // prevent mobile nav behavior on window resize

    toggleMenu(nav, navSections, isDesktop.matches);
    isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

    decorateSearch(nav);
    decorateIcons(nav);
    decorateLinkedPictures(nav);
    const navWrapper = document.createElement('div');
    navWrapper.className = 'nav-wrapper';
    navWrapper.append(nav);
    decorateLinkedPictures(navWrapper);
    nav.querySelector('.nav-brand a').setAttribute('aria-label', 'Navigate to homepage');
    block.append(navWrapper);
    // class names for drop down lists
    const classNames = ['news', 'video', 'companies', 'awards', 'events', 'industry', 'about'];
    for (let i = 0; i < classNames.length; i += 1) {
      const index = i + 1;
      const element = document.querySelector(`.nav-sections > ul > li:nth-child(${index})`);
      if (element) {
        element.id = classNames[i];
      }
    }
    const menuItems = document.querySelector('.nav-sections ul');
    menuItems.className = 'menu-items';
    const menuContainer = document.createElement('div');
    menuContainer.id = 'menu-container';
    navSections.append(menuContainer);
    menuDrop();
  }
}
