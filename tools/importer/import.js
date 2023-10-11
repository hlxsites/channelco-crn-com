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
const captializeFirstLetter = (str) => {
  const arr = str.split(" ");
  for (let i = 0; i < arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }
  const str2 = arr.join(" ");
  return str2;
};

const createMetadata = (main, document) => {
  const meta = {};

  const title = document.querySelector("title");
  if (title) {
    meta.Title = title.textContent.replace(/[\n\t]/gm, "");
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

  const category = document.querySelector(".home");
  if (category != null) {
    const categoryValue = captializeFirstLetter(category.textContent);
    if (
      "Channel News" != categoryValue.trim() &&
      categoryValue.includes("News")
    ) {
      meta.category = categoryValue.replace("News", "");
    } else {
      meta.category = categoryValue;
    }
    category.parentNode.remove();
  }

  const pubishDate = document.querySelector(
    '[property="article:published_time"]'
  );
  if (pubishDate) {
    meta.PublishedDate = pubishDate.content;
  }

  const keywords = document.querySelector('[name="keywords"]');
  if (keywords) {
    meta.keywords = keywords.content;
  }

  const pagination = document.querySelector(".pagination");
  if (pagination) {
    meta.SlideShow = "true";
  } else {
    meta.SlideShow = "false";
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
    const el = document.createElement("img");
    el.src = img.content;
    meta.Image = el;
  }

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
};

const createFetchMetadata = (main, document) => {
  const meta = {};

  const title = document.querySelector(".page-title");
  if (title) {
    meta.Title = title.textContent;
  }

  const templateType = document.querySelector('[name="templateType"]');
  if (templateType) {
    meta.Template = templateType.content;
  }
  const desc = document.querySelector('[property="og:description"]');
  if (desc) {
    meta.Description = desc.content;
  }
  if (templateType.content === "webpage") {
    const category = document.querySelector(".page-title");
    if (category != null) {
      const categoryValue = captializeFirstLetter(category.textContent);
      meta.category = categoryValue;
    }
    meta.Template = "Category";
  }

  const CompanyNames = document.querySelector('[name="CompanyNames"]');
  if (CompanyNames) {
    meta.companynames = CompanyNames.content;
  }

  const CompanyWebpages = document.querySelector('[name="CompanyWebpages"]');
  if (CompanyNames) {
    meta.companywebpages = CompanyWebpages.content;
  }

  const keywords = document.querySelector('[name="keywords"]');
  if (keywords) {
    meta.Keywords = keywords.content;
  }

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
};

/** create Columns Banner block */
const createBreadCrumbs = (main, document) => {
  const selector = ".breadcrumb";
  main.querySelectorAll(selector).forEach((breadcrumb) => {
    const bannerContent = "";

    const cells = [["breadcrumb"], [bannerContent]];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    breadcrumb.innerHTML = "";
    breadcrumb.append(table);
  });
};

/** create Columns features block */
const pagination = (main, document) => {
  const selector = ".pagination";
  main.querySelectorAll(selector).forEach((pagNav) => {
    const cells = [["pagination"], [""]];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    pagNav.append(table);
  });
};

/** create AuthorBio block */
const createAuthorBio = (main, document) => {
  main.querySelectorAll(".card.mb-3").forEach((authorbio) => {
    if (authorbio.querySelector(".author-bio-blurb")) {
      authorbio.remove();
    } else if (authorbio.querySelector(".author-name-md")) {
      authorbio.remove();
    }
  });
  const authorNameMD = main.querySelector(".author-name-md");
  if (
    null != authorNameMD.parentNode.id &&
    "news-article" === authorNameMD.parentNode.id
  ) {
    authorNameMD.remove();
  } else {
    authorNameMD.parentNode.remove();
  }
};

const createAdBlock = (adBlock, main, document) => {
  adBlock.querySelectorAll(".int-ads").forEach((ad) => {
    const div = ad.querySelector(":scope > div");
    const cells = [["AD"], ["id", div.id], ["type", "Sponsored post"]];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    ad.parentNode.innerHTML = "";
    let article = main.querySelector(".article");
    if (!article) {
      article = document.getElementById("news-article");
    }
    const p = article.querySelector("p:nth-of-type(5)");
    if (p) {
      p.after(table);
    } else {
      adBlock.replaceWith(table);
    }
  });
};

const removeLearnMore = (main, document) => {
  main.querySelectorAll(".card").forEach((card) => {
    const learnMore = card.querySelector(".learn-more-md");
    if (learnMore) {
      card.remove();
    }
  });
};

const insertBrightCoveBlock = (main, document) => {
  main.querySelectorAll('.video-player').forEach((videoPlayer) => {
    const videoJS = videoPlayer.getElementsByTagName('video-js')[0];
    const playListID = videoJS.getAttribute('data-playlist-id');
    const videoId = videoJS.getAttribute('data-video-id');
    const player = videoJS.getAttribute('data-player');    
    const cells = [["Brightcove"]];
    if(player) {
      cells.push(["player" , player]);
    }
    if (playListID) {
      cells.push(["playlist", playListID]);
    }
    if (videoId) {
      cells.push(["video" , videoId]);
    }    
    const table = WebImporter.DOMUtils.createTable(cells, document);
    main.append(table);

  });
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
    if (templateType.content === "article" || templateType.content === "slideshow") {
      createAuthorBio(main, document);
      const adBlock = document.getElementById("imu1forarticles");
      if (adBlock) {
        createAdBlock(adBlock, main, document);
      }
      createMetadata(main, document);
      removeLearnMore(main, document);
    } else if (templateType.content === "company") {      
      createFetchMetadata(main, document);
      WebImporter.DOMUtils.remove(main, [".container.parent"]);
    } else if (templateType.content === "webpage") {
      insertBrightCoveBlock(main, document);
      createFetchMetadata(main, document);
      WebImporter.DOMUtils.remove(main, [".container.parent"]);
    }
    WebImporter.DOMUtils.remove(main, [
      "nav",
      "footer",
      "time",
      ".red-border-bottom",
      ".ad",
      ".trending",
      ".sponsored-resources",
      ".rr-crn-awards",
      ".ad-sponsored-post",
      ".rr-crn-magazine",
      ".breadcrumb",
      ".modal",
      ".ribbon",
      ".back-to-top",
      ".GLadv-728",
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
  }) =>
    WebImporter.FileUtils.sanitizePath(
      new URL(url).pathname.replace(/\.htm$/, "").replace(/\/$/, "")
    ),
};
