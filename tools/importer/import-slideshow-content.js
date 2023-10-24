/* eslint-disable no-unused-vars */
/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */
let slidehsowPageURL;
let isPagination;

/** Remove AuthorBio block */
const removeAuthorBio = (main, document) => {
  main.querySelectorAll('.card.mb-3').forEach((authorbio) => {
    if (authorbio.querySelector('.author-bio-blurb')) {
      authorbio.remove();
    } else if (authorbio.querySelector('.author-name-md')) {
      authorbio.remove();
    }
  });
  const authorNameMD = main.querySelector('.author-name-md');
  if (
    authorNameMD.parentNode.id != null
    && authorNameMD.parentNode.id === 'news-article'
  ) {
    authorNameMD.remove();
  } else {
    authorNameMD.parentNode.remove();
  }
};

const removeLearnMore = (main, document) => {
  main.querySelectorAll('.card').forEach((card) => {
    const learnMore = card.querySelector('.learn-more-md');
    if (learnMore) {
      card.remove();
    }
  });
};

const addSection = (main) => {
  const newsListPagination = main.querySelector('nav.news-list-pagination');
  newsListPagination.insertAdjacentHTML('afterend', '---');
};

export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @returns {HTMLElement} The root element to be transformed
   */
  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document,
    url,
    html,
    params,
  }) => {
    // define the main element: the one that will be transformed to Markdown
    const main = document.body;

    // use helper method to remove header, footer, etc.
    const templateType = document.querySelector('[name="templateType"]');
    if (templateType.content === 'article' || templateType.content === 'slideshow') {
      addSection(main);
      removeAuthorBio(main, document);
      removeLearnMore(main, document);
      let { pathname } = new URL(url);
      if (!pathname.includes('.html') && pathname.indexOf('htm') < pathname.length - 3) {
        pathname = pathname.replace('.htm', '');
      }
    }

    WebImporter.DOMUtils.remove(main, [
      'nav',
      'footer',
      'time',
      '.red-border-bottom',
      '.ad',
      '.trending',
      '.sponsored-resources',
      '.rr-crn-awards',
      '.ad-sponsored-post',
      '.rr-crn-magazine',
      '.breadcrumb',
      '.modal',
      '.ribbon',
      '.back-to-top',
      '.GLadv-728',
      '.tax-term-flag',
      '.article-title',
      '.article-description-text',
    ]);
    // create the metadata block and append it to the main element

    return main;
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @return {string} The path
   */
  generateDocumentPath: ({
    // eslint-disable-next-line no-unused-vars
    document,
    url,
    html,
    params,
  }) => {
    if (!isPagination) {
      return WebImporter.FileUtils.sanitizePath(
        new URL(url).pathname.replace(/\.htm$/, '').replace(/\/$/, ''),
      );
    }
    return WebImporter.FileUtils.sanitizePath(
      slidehsowPageURL,
    );
  },

};
