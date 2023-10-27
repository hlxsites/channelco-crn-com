/* eslint-disable no-plusplus */
import { getMetadata, decorateIcons } from '../../scripts/lib-franklin.js';
import { decorateLinkedPictures } from '../../scripts/shared.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeSearch() {
  document.querySelector('nav .nav-search').classList.remove('active');
}

function closeMenu() {
  ['.menu-items div', '.desktop', '.desktop-menu', '.mobile', '.mobile-menu', '.mobile-menu li'].forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (el.hasAttribute('aria-expanded')) {
        el.setAttribute('aria-expanded', 'false');
      } if (el.hasAttribute('expanded')) {
        el.setAttribute('expanded', 'false');
      } if (selector === '.mobile') {
        el.style.height = '0px';
      }
    });
  });
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
      nav.setAttribute('aria-expanded', 'false');
      nav.querySelector('button').focus();
    }
    const search = document.querySelector('nav .nav-search');
    if (search && search.classList.contains('active')) {
      closeSearch();
    }
    closeMenu();
  }
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
  // document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  // enable menu collapse on escape keypress
  if ((expanded && !isDesktop.matches) || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
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

    const navSections = nav.querySelector('.nav-sections');
    const menuItems = document.createElement('div');
    menuItems.classList.add('menu-items');

    const menuContainer = document.createElement('div');
    menuContainer.id = 'menu-container';
    menuContainer.classList.add('desktop');
    menuContainer.setAttribute('aria-expanded', 'false');

    if (navSections) {
      navSections.querySelectorAll(':scope > .navigation > div:nth-child(odd) > div').forEach((menuItem, index) => {
        menuItems.append(menuItem);
        menuItem.setAttribute('expanded', 'false');

        menuItem.addEventListener('click', () => {
          const currentState = menuItem.getAttribute('expanded') === 'true';
          const newState = !currentState;

          Array.from(menuItems.children).forEach((el) => {
            if (el !== menuItem) {
              el.setAttribute('aria-expanded', 'false');
            }
          });

          const desktopMenus = document.querySelectorAll('.desktop-menu');
          Array.from(desktopMenus).forEach((el, i) => {
            if (i !== index) {
              el.setAttribute('aria-expanded', 'false');
            }
          });

          menuItem.setAttribute('aria-expanded', newState.toString());
          menuContainer.setAttribute('aria-expanded', newState.toString());
          const menuSections = document.querySelectorAll('.menu-section');
          if (menuSections[index]) {
            menuSections[index].setAttribute('aria-expanded', newState.toString());
          }
          const desktopMenu = desktopMenus[index];
          if (desktopMenu) {
            desktopMenu.setAttribute('aria-expanded', newState.toString());
          }
        });
      });

      navSections.querySelectorAll(':scope > .navigation > div:nth-child(even)').forEach((menuContent, index) => {
        menuContainer.appendChild(menuContent);
        // menuContent.classList.add('menu-section');
        menuContent.classList.add('desktop-menu');
        menuContent.setAttribute('aria-expanded', 'false');

        const cloneMenu = menuContent.cloneNode(true);
        cloneMenu.classList.replace('desktop-menu', 'mobile-menu');
        menuItems.children[index].appendChild(cloneMenu);

        cloneMenu.querySelectorAll('div > ul > li:first-child').forEach((li) => {
          li.setAttribute('expanded', 'false');
          li.addEventListener('click', (event) => {
            event.stopPropagation();
            const currentState = event.currentTarget.getAttribute('expanded') === 'true';
            const newState = !currentState;
            event.currentTarget.setAttribute('expanded', newState ? 'true' : 'false');
          });
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
    const navWrapper = document.createElement('div');
    navWrapper.className = 'nav-wrapper';
    navWrapper.append(nav);
    decorateLinkedPictures(navWrapper);
    nav.querySelector('.nav-brand a').setAttribute('aria-label', 'Navigate to homepage');
    block.append(navWrapper);
    navSections.append(menuItems);

    // mobile nav container

    const setHeight = (element) => {
      if (element.classList.contains('mobile') || element.closest('.mobile')) {
        const mobileContainer = document.querySelector('.mobile');
        if (mobileContainer.getAttribute('aria-expanded') === 'true') {
          const contentHeight = mobileContainer.firstElementChild.offsetHeight;
          mobileContainer.style.height = `${contentHeight}px`;
        } else {
          mobileContainer.style.height = '0px';
        }
      }
    };

    const toggleMobile = (mobileMenu) => {
      const ariaCurrentState = mobileMenu.getAttribute('aria-expanded');
      const ariaNewState = ariaCurrentState === 'true' ? 'false' : 'true';
      mobileMenu.setAttribute('aria-expanded', ariaNewState);

      if (mobileMenu.hasAttribute('expanded')) {
        const expandedCurrentState = mobileMenu.getAttribute('expanded');
        const expandedNewState = expandedCurrentState === 'true' ? 'false' : 'true';
        mobileMenu.setAttribute('expanded', expandedNewState);
      }
      setHeight(mobileMenu);
    };

    const main = document.querySelector('main');
    const parentElement = main.parentNode;
    const menuEl = document.createElement('div');
    menuEl.classList.add('nav-container');
    const mobile = document.createElement('div');
    mobile.classList.add('mobile');
    mobile.style.height = '0px';
    mobile.setAttribute('aria-expanded', 'false');

    const clone = menuItems.cloneNode(true);
    mobile.appendChild(clone);

    hamburger.addEventListener('click', () => {
      toggleMobile(mobile);
    });

    const menuItemsDivs = mobile.querySelectorAll('.menu-items > div');
    menuItemsDivs.forEach((divItem) => {
      divItem.addEventListener('click', () => {
        toggleMobile(divItem);
        const items = divItem.querySelector('.mobile-menu');
        if (items) {
          toggleMobile(items);
        }
      });
    });

    mobile.querySelectorAll('.mobile-menu ul').forEach((ul) => {
      if (ul.querySelector('code')) {
        ul.remove();
      }
    });

    const items = mobile.querySelectorAll('.mobile-menu');
    items.forEach((item) => {
      item.addEventListener('click', (event) => {
        const closestLi = event.target.closest('li');
        if (closestLi && closestLi.hasAttribute('expanded')) {
          event.stopPropagation();
          toggleMobile(closestLi);
        }
      });
    });

    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = `
          <button>Close
            <span class="circle">
            <img src=icons/x.svg>
          </svg>
            </span>
          </button>
          `;
    closeBtn.classList.add('close-button');
    closeBtn.querySelector('button').onclick = closeMenu;

    menuContainer.prepend(closeBtn);
    parentElement.insertBefore(menuEl, main);
    menuEl.append(menuContainer, mobile);
  }
}
