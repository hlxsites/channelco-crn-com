import { readBlockConfig } from '../../scripts/lib-franklin.js';
import ffetch from '../../scripts/ffetch.js';
import { dataMapLookup, getFilterInfoLocation } from '../../scripts/shared.js';

function populateCardDisplay(data, imageUrl, information, detailsUrl, displayDiv) {
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
    infoLink.href = `${detailsUrl}?c=${item.Pkey}`;
    card.append(infoLink);

    displayDiv.append(card);
  });
}

// Resets all dropdowns aside from current
function resetDropdowns(block, currDropdown) {
  const dropdowns = block.querySelectorAll('select');
  dropdowns.forEach((dropdown) => {
    if (dropdown !== currDropdown) {
      dropdown.selectedIndex = 0;
    }
  });
}

async function onDropdownChange(block, dropdown, filters, key, imageUrl, information, detailsUrl) {
  const year = dropdown.getAttribute('data-year');
  const dataSource = dropdown.getAttribute('data-source');
  const dataSheet = getFilterInfoLocation(dataSource)[0];
  const container = block.querySelector('.card-display');

  const selectedValue = dropdown.value.includes('-- Select ') ? undefined : dropdown.value;
  if (!selectedValue) {
    const data = await ffetch(dataSheet).sheet(year).all();
    container.innerHTML = '';
    populateCardDisplay(data, imageUrl, information, detailsUrl, container);
    return;
  }

  if (filters[key].type === 'alpha') {
    const data = await ffetch(dataSheet)
      .sheet(year)
      .filter((item) => {
        if (selectedValue === '#') return !Number.isNaN(parseInt(item[key].charAt(0), 2));
        return item[key].charAt(0).toUpperCase() === selectedValue;
      })
      .all();
    container.innerHTML = '';
    resetDropdowns(block, dropdown);
    populateCardDisplay(data, imageUrl, information, detailsUrl, container);
  } else {
    const data = await ffetch(dataSheet)
      .sheet(year)
      .filter((item) => item[key] === selectedValue)
      .all();
    container.innerHTML = '';
    resetDropdowns(block, dropdown);
    populateCardDisplay(data, imageUrl, information, detailsUrl, container);
  }
}

// eslint-disable-next-line max-len
async function loadMore(dataSheet, year, offset, imageUrl, information, detailsUrl, displayDiv, loadMoreDiv) {
  const data = await ffetch(dataSheet).sheet(year).slice(offset).all();
  populateCardDisplay(data, imageUrl, information, detailsUrl, displayDiv);

  if (loadMoreDiv) {
    loadMoreDiv.remove();
  }
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
  const [dataSheet, dataMapSheet] = getFilterInfoLocation(dataSource);
  const offset = 30;

  const promises = [];
  promises.push(ffetch(dataSheet).sheet(year).limit(offset).all());
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
    dropdown.addEventListener('change', () => onDropdownChange(block, dropdown, filters, key, imageUrl, information, detailsUrl));

    dropdownDiv.append(filterPrompt);
    dropdownDiv.append(dropdown);
    dropdownsDiv.append(dropdownDiv);
  });
  block.append(dropdownsDiv);

  // Create card table
  const displayDiv = document.createElement('div');
  displayDiv.classList.add('card-display');
  populateCardDisplay(data, imageUrl, information, detailsUrl, displayDiv);

  // Add load more... button
  const loadMoreDiv = document.createElement('div');
  loadMoreDiv.classList.add('load-more');
  const loadMoreButton = document.createElement('button');
  loadMoreButton.innerText = 'Load more...';
  loadMoreButton.addEventListener('click', () => { loadMore(dataSheet, year, offset, imageUrl, information, detailsUrl, displayDiv, loadMoreDiv); });
  loadMoreDiv.append(loadMoreButton);
  displayDiv.append(loadMoreDiv);

  block.append(displayDiv);
}
