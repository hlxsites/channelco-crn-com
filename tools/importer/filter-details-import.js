/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */

const map = {
  ppg: {
    elemToReplace: 'databaseResults',
    config: {
      Heading: ['Company', 'Program, Five_Star'],
      Details: 'Location, Phone, URL, Founded, Established\nLeadership: Top_Exec, NACC_Full(NACC_Image_URL), ProgramMgr_Full, NACM_Full, WWC_Full\nProgram Highlights: Changes, Goals, Elements, Elevator',
    },
  },
};

function createFilterDetailsBlock(main, url, document) {
  const urlArr = url.split('/');
  const reportCode = urlArr[urlArr.length - 1].slice(0, 3);
  const filterConfig = map[reportCode];
  const elemToReplace = document.getElementById(filterConfig.elemToReplace);

  const cells = [[filterConfig.type]];
  Object.keys(filterConfig.config).forEach((key) => {
    const value = filterConfig.config[key];
    cells.push([key, value]);
  });

  const table = WebImporter.DOMUtils.createTable(cells, document);
  const parent = elemToReplace.parentNode;
  parent.replaceChild(table, elemToReplace);
}

export default {
  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    const main = document.body;

    createFilterDetailsBlock(main, url, document);
    WebImporter.DOMUtils.remove(main, [
      'nav',
      'footer',
      'time',
      '.red-border-bottom',
      '.ad-leaderboard',
      '.breadcrumb',
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

    return main;
  },
  // eslint-disable-next-line no-unused-vars
  generateDocumentPath: ({ document, url, html, params }) => WebImporter.FileUtils.sanitizePath(
    new URL(url).pathname.replace(/\.htm$/, ''),
  ),
};
