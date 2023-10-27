import ffetch from '../../scripts/ffetch.js';
import { readBlockConfig } from '../../scripts/lib-franklin.js';
import { isURL } from '../../scripts/shared.js';

async function getFilterDetails() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const key = urlSearchParams.get('c');
  const currentUrlArray = window.location.href.split('/');
  const [dataSource, year] = currentUrlArray[currentUrlArray.length - 1].split('-');
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

function createImageDiv(imageUrl) {
  const imgDiv = document.createElement('div');
  imgDiv.classList.add('image');
  const img = document.createElement('img');
  img.src = imageUrl;
  imgDiv.append(img);
  return imgDiv;
}

export default async function decorate(block) {
  const { data, dataMap } = await getFilterDetails();
  const { heading, details, 'heading-image': headingImage } = readBlockConfig(block);
  block.innerHTML = '';

  const detailsDiv = document.createElement('div');
  detailsDiv.classList.add('details');

  if (headingImage) {
    const imgDiv = createImageDiv(data[headingImage]);
    imgDiv.classList.add('heading-img');
    detailsDiv.append(imgDiv);
  }

  const headingList = Array.isArray(heading) ? heading : [heading];
  headingList.forEach((header) => {
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
    detailsDiv.append(row);
  });
  block.append(detailsDiv);

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
    parsedDetailItem.split(',').map((item) => item.trim()).forEach((rawDetail) => {
      const br = document.createElement('br');
      br.setAttribute('clear', 'all');

      let detail = rawDetail;
      let hasImage = false;
      if (rawDetail.includes('(') && rawDetail.includes(')')) {
        detail = rawDetail.slice(0, rawDetail.indexOf('('));
        hasImage = true;
        const imageUrl = data[rawDetail.slice(rawDetail.indexOf('(') + 1, rawDetail.indexOf(')' - 1))];
        const imgDiv = createImageDiv(imageUrl);
        detailsDiv.append(imgDiv);
      }
      const foundPrompt = dataMap.find((item) => item.key === detail);
      const prompt = foundPrompt ? foundPrompt.value : detail;
      const answer = data[detail];
      const promptDiv = document.createElement('div');
      const answerDiv = document.createElement('div');
      promptDiv.classList.add('prompt');
      answerDiv.classList.add('answer');
      promptDiv.innerHTML = prompt;
      answerDiv.innerHTML = isURL(answer) ? `<a href="${answer}">${answer}</a>` : answer;
      detailsDiv.append(promptDiv);
      detailsDiv.append(answerDiv);
      if (hasImage) detailsDiv.append(br);
    });
  }));
  block.append(detailsDiv);
}
