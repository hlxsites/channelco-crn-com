/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */

const map = {
  ppg: {
    type: 'Filter List',
    elemToReplace: 'companydisplay',
    config: {
      'Filter fields': 'Company(alpha),Five_Star(value)',
      'Table fields': 'Company,Five_Star,Program(link)',
    },
  },
  cc: {
    type: 'Filter Image List',
    elemToReplace: 'my_div',
    config: {
      'Filter fields': 'Chief_Last(alpha),Co mpany(value)',
      'Image URL': 'Image_URL',
      Information: 'CEO_Name_Company',
    },
  },
  sp: {
    type: 'Filter List',
    elemToReplace: 'my_div',
    config: {
      'Filter fields': 'Company(alpha)',
      'Table fields': 'Rank,Company(link)',
    },
  },
};

function createFilterBlock(main, url, document, form) {
  const urlArr = url.split('/');
  const reportCode = urlArr[urlArr.length - 1].match(/^[^\d]*/)[0];
  const filterConfig = map[reportCode];
  const elemToReplace = document.getElementById(filterConfig.elemToReplace);

  const cells = [[filterConfig.type]];
  Object.keys(filterConfig.config).forEach((key) => {
    const value = filterConfig.config[key];
    cells.push([key, value]);
  });

  const table = WebImporter.DOMUtils.createTable(cells, document);
  if (elemToReplace) {
    const parent = elemToReplace.parentNode;
    parent.replaceChild(table, elemToReplace);
  } else {
    main.append(table);
  }
}

function createMetadata(main, document) {
  const meta = {};

  meta.Template = 'filter';
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);
  return meta;
}

export default {
  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    const main = document.body;

    createFilterBlock(main, url, document);

    WebImporter.DOMUtils.remove(main, [
      'nav',
      'footer',
      'time',
      '.red-border-bottom',
      '.ad-leaderboard',
      '.breadcrumb',
      'searchDiv',
      'form',
      'list',
      '.modal',
      '.ribbon',
      '.curtain',
      'PTLOW',
      '.trending',
      '.sponsored-resources',
      '.rr-crn-awards',
      '.rr-crn-magazine',
      '.ad-text',
      '.ad-sponsored-post',
    ]);

    createMetadata(main, document);

    return main;
  },
  // eslint-disable-next-line no-unused-vars
  generateDocumentPath: ({ document, url, html, params }) => WebImporter.FileUtils.sanitizePath(
    new URL(url).pathname.replace(/\.htm$/, ''),
  ),
};
