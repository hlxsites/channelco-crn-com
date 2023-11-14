/* eslint-disable prefer-destructuring */
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
let template;
let isPagination;
const captializeFirstLetter = (str) => {
  const arr = str.split(' ');
  for (let i = 0; i < arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }
  const str2 = arr.join(' ');
  return str2;
};

const createMetadata = (main, document) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.textContent.replace(/[\n\t]/gm, '');
  }

  const templateType = document.querySelector('[name="templateType"]');
  if (templateType) {
    meta.Template = 'article';
  }
  const desc = document.querySelector('[property="og:description"]');
  if (desc) {
    meta.Description = desc.content;
  }

  const authorName = document.querySelector('[name="author"]');
  if (authorName) {
    meta.Author = authorName.content;
  }

  const category = document.querySelector('.home');
  if (category != null) {
    const categoryValue = captializeFirstLetter(category.textContent);
    if (
      categoryValue.trim() !== 'Channel News'
      && categoryValue.includes('News')
    ) {
      meta.category = categoryValue.replace('News', '');
    } else {
      meta.category = categoryValue.trim();
    }
    if (categoryValue.trim() !== 'Events') {
     category.parentNode.remove();
    } else {
      category.remove();
    }
  }

  let pubishDate = document.querySelector('[property="article:published_time"]');
  if (pubishDate) {
    meta.PublishedDate = pubishDate.content;
  } else {
    pubishDate = document.querySelector('time').textContent;
    meta.PublishedDate = pubishDate.content;
  }

  const keywords = document.querySelector('[name="keywords"]');
  if (keywords) {
    meta.keywords = keywords.content;
  }

  const pagination = document.querySelector('.pagination');
  if (pagination) {
    meta.SlideShow = 'true';
    isPagination = true;
  } else {
    meta.SlideShow = 'false';
  }

  const CompanyNames = document.querySelector('[name="CompanyNames"]');
  if (CompanyNames) {
    meta.companynames = CompanyNames.content;
  }

  const CompanyWebpages = document.querySelector('[name="CompanyWebpages"]');
  if (CompanyNames) {
    meta.companywebpages = CompanyWebpages.content;
  }

  const img = document.querySelector('[property="og:image"]');
  if (img && img.content) {
    const el = document.createElement('img');
    el.src = img.content;
    meta.Image = el;
  }

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
};

const createFetchMetadata = (main, document) => {
  const meta = {};

  const title = document.querySelector('.page-title');
  if (title) {
    meta.Title = title.textContent;
  }

  const desc = document.querySelector('[property="og:description"]');
  if (desc) {
    meta.Description = desc.content;
  }

  const templateType = document.querySelector('[name="templateType"]');
  if (templateType) {
    if (templateType.content === 'staff') {
      meta.Template = 'author';
      meta.title = document.querySelector('title').textContent;
      const author = document.querySelector('title').textContent.split('|')[0];
      meta.author = author;

      const desc = document.querySelector('[property="og:description"]');
      if (desc) {
        meta.authorDescription = desc.content;
      }

      const authorTitle = document.querySelector('.author-title');
      if (authorTitle) {
        meta.authorTitle = authorTitle.textContent;
      }

      const authorImage = document.querySelector('[property="og:image"]');
      if (authorImage && authorImage.content) {
        const el = document.createElement('img');
        el.src = authorImage.content;
        meta.authorImage = el;
      }
    } else if (templateType.content === 'flatpage') {
      meta.Template = '';
    } else {
      meta.Template = templateType.content;
    }
  }
  if (templateType.content === 'webpage') {
    const category = document.querySelector('.page-title');
    if (category != null) {
      const categoryValue = captializeFirstLetter(category.textContent);
      meta.category = categoryValue;
    }
    meta.Template = 'Category';
  }

  const publishDateElement = document.querySelector('[property="article:published_time"]') || document.querySelector('h5 > time');
  if (publishDateElement) {
    meta.PublishedDate = publishDateElement.textContent;
  }

  const CompanyNames = document.querySelector('[name="CompanyNames"]');
  if (CompanyNames.content) {
    meta.companynames = CompanyNames.content;
  }

  const CompanyWebpages = document.querySelector('[name="CompanyWebpages"]');
  if (CompanyWebpages.content) {
    meta.companywebpages = CompanyWebpages.content;
  }

  const keywords = document.querySelector('[name="keywords"]');
  if (keywords.content) {
    meta.Keywords = keywords.content;
  }

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
};

/** create Columns Banner block */
/* const createBreadCrumbs = (main, document) => {
  const selector = '.breadcrumb';
  main.querySelectorAll(selector).forEach((breadcrumb) => {
    const bannerContent = '';

    const cells = [['breadcrumb'], [bannerContent]];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    breadcrumb.innerHTML = '';
    breadcrumb.append(table);
  });
}; */

/** create Columns features block */
/* const pagination = (main, document) => {
  const selector = '.pagination';
  main.querySelectorAll(selector).forEach((pagNav) => {
    const cells = [['pagination'], ['']];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    pagNav.append(table);
  });
}; */

/** create AuthorBio block */
/* const createAuthorBio = (main, document) => {
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
}; */

const createAdBlock = (adBlock, main, document) => {
  adBlock.querySelectorAll('.int-ads').forEach((ad) => {
    const div = ad.querySelector(':scope > div');
    const cells = [['AD'], ['id', div.id], ['type', 'Sponsored post']];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    ad.parentNode.innerHTML = '';
    let article = main.querySelector('.article');
    if (!article) {
      article = document.getElementById('news-article');
    }
    const p = article.querySelector('p:nth-of-type(4)');
    if (p) {
      p.after(table);
    } else {
      adBlock.replaceWith(table);
    }
  });
};

/** create Marketo block */
const createMarketo = (main, document) => {
  const table = main.querySelector('.GListMap > table');

  if (table) {
    main.querySelectorAll('.GListMap > table p').forEach((paragraph) => {
      main.append(paragraph);
    // paragraph.remove();
    });
    table.remove();
  }
  const marketoForm = main.querySelector('.GListMap > form');
  if (marketoForm) {
    const formId = marketoForm.id;
    const id = formId.match(/\d+/);
    let extractedNumber;
    if (id) {
      extractedNumber = id[0];
    }
    const cells = [['Marketo']];
    cells.push(['id', extractedNumber]);
    const marketoTable = WebImporter.DOMUtils.createTable(cells, document);
    main.append(marketoTable);
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

const insertBrightCoveBlock = (main, document, templateType) => {
  main.querySelectorAll('.video-player').forEach((videoPlayer) => {
    const videoJS = videoPlayer.getElementsByTagName('video-js')[0];
    const playListID = videoJS.getAttribute('data-playlist-id');
    const videoId = videoJS.getAttribute('data-video-id');
    const player = videoJS.getAttribute('data-player');
    const cells = [['Brightcove']];
    if (player) {
      cells.push(['player', player]);
    }
    if (playListID) {
      cells.push(['playlist', playListID]);
    }
    if (videoId) {
      cells.push(['video', videoId]);
    }
    const table = WebImporter.DOMUtils.createTable(cells, document);
    main.append(table);
  });
  if (templateType === 'flatpage') {
    const video = main.getElementsByTagName('video');
    for (const videoPlayer of video) {
      const playListID = videoPlayer.getAttribute('data-playlist-id');
      const videoId = videoPlayer.getAttribute('data-video-id');
      const player = videoPlayer.getAttribute('data-player');
      const cells = [['Brightcove']];
      if (player) {
        cells.push(['player', player]);
      }
      if (playListID) {
        cells.push(['playlist', playListID]);
      }
      if (videoId) {
        cells.push(['video', videoId]);
      }
      const table = WebImporter.DOMUtils.createTable(cells, document);
      videoPlayer.parentElement.replaceWith(table);
    }
  }
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
    template = templateType;
    if (templateType.content === 'article' || templateType.content === 'slideshow' || templateType.content === 'channelcast' || templateType.content === 'contributions') {
      // createAuthorBio(main, document);
      const adBlock = document.getElementById('imu1forarticles');
      if (adBlock) {
        createAdBlock(adBlock, main, document);
      }
      removeLearnMore(main, document);
      createMarketo(main, document);
      createMetadata(main, document);
      let { pathname } = new URL(url);
      if (!pathname.includes('.html') && pathname.indexOf('htm') < pathname.length - 3) {
        pathname = pathname.replace('.htm', '');
      }
      const splitURL = pathname.split('/');
      const pageName = splitURL[splitURL.length - 1].split('.');
      if (isNaN(pageName[0]) && isPagination && !pageName[0].includes('index')) {
        slidehsowPageURL = new URL(url).pathname.replace('.htm', '').replace(/\/$/, '');
        slidehsowPageURL += '/index';
      } else if (pageName[1] && pageName[1].includes('html')) {
        '';
        slidehsowPageURL = new URL(url).pathname.replace('.html', '').replace(/\/$/, '');
      } else {
        slidehsowPageURL = new URL(url).pathname.replace('.htm', '').replace(/\/$/, '');
      }
    } else if (templateType.content === 'company') {
      createFetchMetadata(main, document);
      WebImporter.DOMUtils.remove(main, ['.container.parent']);
    } else if (templateType.content === 'webpage') {
      insertBrightCoveBlock(main, document);
      createFetchMetadata(main, document);
      WebImporter.DOMUtils.remove(main, ['.container.parent']);
    } else if (templateType.content === 'staff') {
      createFetchMetadata(main, document);
      WebImporter.DOMUtils.remove(main, ['.list-news']);
    } else if (templateType.content === 'flatpage') {
      insertBrightCoveBlock(main, document, templateType.content);
      createFetchMetadata(main, document);
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
      '.author-pic-round-sm',
      '.author-bio-blurb',
      '.author-name-md',
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
