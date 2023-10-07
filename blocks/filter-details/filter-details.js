import ffetch from '../../scripts/ffetch.js';
import { readBlockConfig } from '../../scripts/lib-franklin.js';

async function getFilterDetails() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const key = urlSearchParams.get('key');
  const dataSource = urlSearchParams.get('dataSource');
  const year = urlSearchParams.get('year');
  const dataMapSheet = `/data-source/${dataSource}/data-mapping.json`;
  const dataMap = await ffetch(dataMapSheet).sheet(year).all();
  const spreadsheet = `/data-source/${dataSource}/${dataSource}-data.json`;
  const data = await ffetch(spreadsheet)
    .sheet(year)
    .map((item) => item)
    .filter((item) => item.Pkey === key);
  const { value } = await data.next();
  return {
    data: value,
    dataMap,
  };
}

export default async function decorate(block) {
  const { data, dataMap } = await getFilterDetails();
  const { heading, details } = readBlockConfig(block);
  block.innerHTML = '';

  const headerDiv = document.createElement('div');
  headerDiv.classList.add('details-header');
  heading.forEach((header) => {
    const values = header.split(',');
    const row = document.createElement('div');
    row.classList.add('heading-row');
    values.forEach((value) => {
      const h = document.createElement('h2');
      // eslint-disable-next-line max-len
      const foundHeader = dataMap.find((item) => item.key === data[value.trim()]);
      h.innerText = foundHeader ? foundHeader.value : data[value.trim()];
      row.append(h);
    });
    headerDiv.append(row);
  });
  block.append(headerDiv);

  const detailsDiv = document.createElement('div');
  detailsDiv.classList.add('details');

  const detailsList = Array.isArray(details) ? details : [details];
  detailsList.forEach(((detailItem) => {
    let parsedDetailItem;
    if (detailItem.includes(':')) {
      const detailHeading = detailItem.slice(0, detailItem.indexOf(':'));
      const detailHeadingDiv = document.createElement('div');
      detailHeadingDiv.classList.add('details-heading');
      detailHeadingDiv.innerText = detailHeading;
      detailsDiv.append(detailHeadingDiv);
      parsedDetailItem = detailItem.slice(detailItem.indexOf(':') + 1, detailItem.length);
    } else {
      parsedDetailItem = detailItem;
    }
    parsedDetailItem.split(',').map((item) => item.trim()).forEach((detail) => {
      const foundPrompt = dataMap.find((item) => item.key === detail);
      const prompt = foundPrompt ? foundPrompt.value : detail;
      const promptDiv = document.createElement('div');
      const answerDiv = document.createElement('div');
      promptDiv.classList.add('prompt');
      answerDiv.classList.add('answer');
      promptDiv.innerText = prompt;
      answerDiv.innerText = data[detail];
      detailsDiv.append(promptDiv);
      detailsDiv.append(answerDiv);
    });
  }));
  block.append(detailsDiv);
}
