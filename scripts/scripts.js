import {
  sampleRUM,
  loadHeader,
  loadFooter,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  toClassName,
  getMetadata,
} from './lib-franklin.js';

import { decorateMain } from './shared.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

const TEMPLATE_LIST = ['category', 'article', 'author'];

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) {
      sessionStorage.setItem('fonts-loaded', 'true');
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * @typedef Template
 * @property {function} [default] Default export of the template, which will be called in the lazy
 *  phase. Expects a single argument: the document's <main> HTMLElement.
 * @property {function} [loadLazy] If provided, will be called in the lazy phase. If both a default
 *  export and loadLazy function are provided, only the default export will be called. Expects a
 *  single argument: the document's <main> HTMLElement.
 * @property {function} [loadEager] If provided, will be called in the eager phase. Expects a single
 *  argument: the document's <main> HTMLElement.
 * @property {function} [loadDelayed] If provided, will be called in the delayed phase. Expects a
 *  single argument: the document's <main> HTMLElement.
 */

/**
 * @type {Template}
 */
let universalTemplate;
/**
 * @type {Template}
 */
let template;

/**
 * Invokes a template's eager method, if specified.
 * @param {Template} [toLoad] Template whose eager method should be invoked.
 * @param {HTMLElement} main The document's main element.
 */
async function loadEagerTemplate(toLoad, main) {
  if (toLoad && toLoad.loadEager) {
    await toLoad.loadEager(main);
  }
}

/**
 * Invokes a template's lazy method, if specified.
 * @param {Template} [toLoad] Template whose lazy method should be invoked.
 * @param {HTMLElement} main The document's main element.
 */
async function loadLazyTemplate(toLoad, main) {
  if (toLoad) {
    if (toLoad.default) {
      await toLoad.default(main);
    } else if (toLoad.loadLazy) {
      await toLoad.loadLazy(main);
    }
  }
}

/**
 * Invokes a template's delayed method, if specified.
 * @param {Template} [toLoad] Template whose delayed method should be invoked.
 * @param {HTMLElement} main The document's main element.
 */
async function loadDelayedTemplate(toLoad, main) {
  if (toLoad && toLoad.loadDelayed) {
    await toLoad.loadDelayed(main);
  }
}

/**
 * Run template specific decoration code.
 * @param {Element} main The container element
 */
async function decorateTemplates(main) {
  try {
    // Load the universal template for every page
    const universalTemplateName = 'universal';
    universalTemplate = await import(
      `../templates/${universalTemplateName}/${universalTemplateName}.js`
    );
    loadCSS(
      `${window.hlx.codeBasePath}/templates/${universalTemplateName}/${universalTemplateName}.css`,
    );
    loadEagerTemplate(universalTemplate, main);

    const templateName = toClassName(getMetadata('template'));
    const templates = TEMPLATE_LIST;
    if (templates.includes(templateName)) {
      template = await import(`../templates/${templateName}/${templateName}.js`);
      loadCSS(
        `${window.hlx.codeBasePath}/templates/${templateName}/${templateName}.css`,
      );
      loadEagerTemplate(template, main);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('template loading failed', error);
  }
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await decorateTemplates(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);
  loadLazyTemplate(universalTemplate, main);
  loadLazyTemplate(template, main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => {
    const main = document.querySelector('main');
    loadDelayedTemplate(universalTemplate, main);
    loadDelayedTemplate(template, main);
    import('./delayed.js');
  }, 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
