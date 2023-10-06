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

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const dataSource = config['data-source'];
  const { year } = config;
  const spreadsheet = `/data-source/${dataSource}/${dataSource}-data.json`;
  const dataMapSheet = `/data-source/${dataSource}/data-mapping.json`;
  const filterFields = config['filter-fields'].split(',');
  const tableFields = config['table-fields'].split(',');

  const data = await ffetch(spreadsheet).sheet(year).all();
  const dataMap = await ffetch(dataMapSheet).sheet(year).all();

  const currentUrlArray = window.location.href.split('/');
  currentUrlArray[currentUrlArray.length - 1] = `${currentUrlArray[currentUrlArray.length - 1]}-${year}details`;
  const detailsUrl = currentUrlArray.join('/');

  // Create cache for data in details and filters
  const cacheName = `${dataSource}-${year}`;
  const cache = await caches.open(cacheName);

  // Clear block contents
  block.innerHTML = '';

  // Process and create filter fields
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
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
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
        const cacheData = new Response(JSON.stringify({
          data: item,
        }), { headers: { 'Content-Type': 'application/json' } });
        await cache.put(`${item.Pkey}-details`, cacheData);

        const a = document.createElement('a');
        a.href = `${detailsUrl}?key=${item.Pkey}&cache=${cacheName}`;
        a.innerText = value;
        cell.append(a);
      } else {
        cell.innerText = value;
      }
      row.append(cell);
    });
    tbody.append(row);
  });
  block.append(table);
}
