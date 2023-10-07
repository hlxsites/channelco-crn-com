import { readBlockConfig } from '../../scripts/lib-franklin.js';
import ffetch from '../../scripts/ffetch.js';

const alphaArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'];

function buildCell(rowIndex) {
  const cell = rowIndex ? document.createElement('td') : document.createElement('th');
  if (!rowIndex) cell.setAttribute('scope', 'col');
  return cell;
}

function dataMapLookup(dataMap, value) {
  const foundValue = dataMap.find((item) => item.key === value);
  return foundValue ? foundValue.value : value;
}

// Function to get unique values from an array of keys for each object
function getUniqueValuesByKeys(arr, keys, dataMap) {
  const uniqueValuesByKeys = {};

  keys.forEach((key) => {
    uniqueValuesByKeys[key] = [`-- Select ${dataMapLookup(dataMap, key)} --`];
  });

  arr.forEach((obj) => {
    keys.forEach((key) => {
      const value = obj[key];

      // Check if the value is not in the uniqueValues array for this key
      if (!uniqueValuesByKeys[key].includes(value)) {
        uniqueValuesByKeys[key].push(value);
      }
    });
  });

  return uniqueValuesByKeys;
}

function populateTable(data, tableFields, dataMap, detailsUrl, dataSource, year, tbody) {
  data.forEach((item, i) => {
    const row = document.createElement('tr');
    const isEvenRow = i % 2 === 0;
    row.classList.add(isEvenRow ? 'row2' : 'row1');
    tableFields.forEach(async (field) => {
      const isDetailsLink = field.includes('(link)');
      const rawValue = isDetailsLink ? item[field.replace('(link)', '').trim()] : item[field.trim()];
      const value = dataMapLookup(dataMap, rawValue);
      const cell = buildCell(1);
      if (isDetailsLink) {
        const a = document.createElement('a');
        a.href = `${detailsUrl}?key=${item.Pkey}&dataSource=${dataSource}&year=${year}`;
        a.innerText = value;
        cell.append(a);
      } else {
        cell.innerText = value;
      }
      row.append(cell);
    });
    tbody.append(row);
  });
}

async function loadMore(tableFields, dataMap, detailsUrl, dataSource, year, tbody, loadMoreDiv) {
  const spreadsheet = `/data-source/${dataSource}/${dataSource}-data.json`;
  const newData = await ffetch(spreadsheet).sheet(year).slice(20).all();

  populateTable(newData, tableFields, dataMap, detailsUrl, dataSource, year, tbody);

  if (loadMoreDiv) {
    loadMoreDiv.remove();
  }
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const dataSource = config['data-source'];
  const { year } = config;
  const spreadsheet = `/data-source/${dataSource}/${dataSource}-data.json`;
  const dataMapSheet = `/data-source/${dataSource}/data-mapping.json`;
  const filterFields = config['filter-fields'].split(',');
  const tableFields = config['table-fields'].split(',');

  const data = await ffetch(spreadsheet).sheet(year).limit(20).all();
  const dataMap = await ffetch(dataMapSheet).sheet(year).all();

  const currentUrlArray = window.location.href.split('/');
  currentUrlArray[currentUrlArray.length - 1] = `${currentUrlArray[currentUrlArray.length - 1]}-${year}details`;
  const detailsUrl = currentUrlArray.join('/');

  // Clear block contents
  block.innerHTML = '';

  // Process and create filter fields
  const filterDiv = document.createElement('div');
  filterDiv.classList.add('filters');
  const alphaFields = {};
  const valueFields = [];
  filterFields.forEach((field) => {
    if (field.includes('(alpha')) {
      const fieldName = field.replace('(alpha)', '').trim();
      alphaArr.unshift(`-- Select ${dataMapLookup(dataMap, fieldName)} --`);
      alphaFields[fieldName] = alphaArr;
    } else if (field.includes('(value)')) {
      valueFields.push(field.replace('(value)', '').trim());
    } else {
      valueFields.push(field.trim());
    }
  });
  const filterDropdownValues = {
    ...alphaFields,
    ...getUniqueValuesByKeys(data, valueFields, dataMap),
  };
  Object.keys(filterDropdownValues).forEach((key) => {
    const dropdownDiv = document.createElement('div');
    const filterPrompt = document.createElement('b');
    filterPrompt.innerText = `Find by ${dataMapLookup(dataMap, key)}:`;
    dropdownDiv.classList.add('dropdown');
    const dropdown = document.createElement('select');
    filterDropdownValues[key].forEach((item) => {
      const option = document.createElement('option');
      option.innerText = dataMapLookup(dataMap, item);
      option.setAttribute('value', item);
      dropdown.append(option);
    });
    dropdownDiv.append(filterPrompt);
    dropdownDiv.append(dropdown);
    block.append(dropdownDiv);
  });

  // Create table
  const tableDiv = document.createElement('div');
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  tableDiv.classList.add('table');
  table.append(thead, tbody);

  const headerRow = document.createElement('tr');
  headerRow.classList.add('row1');
  tableFields.forEach((field) => {
    const cell = buildCell(0);
    const rawValue = field.includes('(link)') ? field.replace('(link)', '').trim() : field.trim();
    cell.innerText = dataMapLookup(dataMap, rawValue);
    headerRow.append(cell);
  });
  thead.append(headerRow);

  populateTable(data, tableFields, dataMap, detailsUrl, dataSource, year, tbody);
  tableDiv.append(table);

  // Add load more... button
  const loadMoreDiv = document.createElement('div');
  loadMoreDiv.classList.add('load-more');
  const loadMoreButton = document.createElement('button');
  loadMoreButton.innerText = 'Load more...';
  loadMoreButton.addEventListener('click', () => { loadMore(tableFields, dataMap, detailsUrl, dataSource, year, tbody, loadMoreDiv); });
  loadMoreDiv.append(loadMoreButton);
  tableDiv.append(loadMoreDiv);

  block.append(tableDiv);
}
