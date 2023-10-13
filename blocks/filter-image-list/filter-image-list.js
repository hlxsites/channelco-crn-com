import { readBlockConfig } from '../../scripts/lib-franklin.js';
import ffetch from '../../scripts/ffetch.js';
import { dataMapLookup } from '../../scripts/shared.js';

function onDropdownChange() {
  console.log("changed");
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const currentUrlArray = window.location.href.split('/');
  const reportPath = currentUrlArray[currentUrlArray.length - 1];
  currentUrlArray[currentUrlArray.length - 1] = `${currentUrlArray[currentUrlArray.length - 1]}-details`;
  const detailsUrl = currentUrlArray.join('/');
  const [dataSource, year] = reportPath.split('-');
  const filterFields = config['filter-fields'].split(',');
  const imageUrl = config['image-url'];
  const { information } = config;
  const spreadsheet = `/data-source/${dataSource}/${dataSource}-data.json`;
  const dataMapSheet = `/data-source/${dataSource}/data-mapping.json`;

  const promises = [];
  promises.push(ffetch(spreadsheet).sheet(year).limit(10).all());
  promises.push(ffetch(dataMapSheet).sheet(year).all());

  const [data, dataMap] = await Promise.all(promises);

  block.innerHTML = '';

  // Process and create filter fields
  const filterDiv = document.createElement('div');
  filterDiv.classList.add('filters');
  const filters = {};
  filterFields.forEach((field) => {
    if (field.includes('(alpha')) {
      const fieldName = field.replace('(alpha)', '').trim();
      filters[fieldName] = {
        value: `-- Select ${dataMapLookup(dataMap, fieldName)} --`,
        type: 'alpha',
      };
    } else if (field.includes('(value)')) {
      const fieldName = field.replace('(value)', '').trim();
      filters[fieldName] = {
        value: `-- Select ${dataMapLookup(dataMap, fieldName)} --`,
        type: 'value',
      };
    } else {
      filters[field] = {
        value: `-- Select ${dataMapLookup(dataMap, field)} --`,
        type: 'value',
      };
    }
  });

  const dropdownsDiv = document.createElement('div');
  dropdownsDiv.classList.add('filters');
  Object.keys(filters).forEach((key) => {
    const dropdownDiv = document.createElement('div');
    const filterPrompt = document.createElement('b');
    filterPrompt.innerText = `Find by ${dataMapLookup(dataMap, key)}:`;
    dropdownDiv.classList.add('dropdown');
    const dropdown = document.createElement('select');
    dropdown.setAttribute('data-populated', false);
    dropdown.setAttribute('data-key', key);
    dropdown.setAttribute('data-type', filters[key].type);
    dropdown.setAttribute('data-source', dataSource);
    dropdown.setAttribute('data-year', year);
    const option = document.createElement('option');
    option.innerText = dataMapLookup(dataMap, filters[key].value);
    option.setAttribute('value', filters[key].value);
    dropdown.append(option);
    dropdown.addEventListener('change', () => onDropdownChange(block, dropdown, spreadsheet, year, filters, key, detailsUrl, dataSource, tableFields, dataMap));

    dropdownDiv.append(filterPrompt);
    dropdownDiv.append(dropdown);
    dropdownsDiv.append(dropdownDiv);
  });
  block.append(dropdownsDiv);

  // Create card table
  const displayDiv = document.createElement('div');
  data.forEach((item, i) => {
    const card = document.createElement('div');
    const isEvenCard = i % 2 === 0;
    card.classList.add('card');
    card.classList.add(isEvenCard ? 'card1' : 'card2');

    const imageDiv = document.createElement('div');
    imageDiv.classList.add('image');
    const img = document.createElement('img');
    img.src = item[imageUrl];
    card.append(img);

    const infoLink = document.createElement('a');
    infoLink.innerText = item[information];
    infoLink.href = detailsUrl;
    card.append(infoLink);

    displayDiv.append(card);
  });
  block.append(displayDiv);
}
