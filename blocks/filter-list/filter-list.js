import { readBlockConfig } from '../../scripts/lib-franklin.js';
import ffetch from '../../scripts/ffetch.js';

function buildCell(rowIndex) {
  const cell = rowIndex ? document.createElement('td') : document.createElement('th');
  if (!rowIndex) cell.setAttribute('scope', 'col');
  return cell;
}

function dataMapLookup(dataMap, value) {
  const foundValue = dataMap.find((item) => item.key === value);
  return foundValue ? foundValue.value : value;
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

// eslint-disable-next-line max-len
async function onDropdownChange(block, dropdown, spreadsheet, year, filters, key, detailsUrl, dataSource, tableFields, dataMap) {
  const tbody = block.querySelector('tbody');
  tbody.innerHTML = '';
  const selectedValue = dropdown.value.includes('-- Select ') ? '' : dropdown.value;
  if (selectedValue === '') {
    const data = await ffetch(spreadsheet).sheet(year).all();
    populateTable(data, tableFields, dataMap, detailsUrl, dataSource, year, tbody);
    return;
  }

  if (filters[key].type === 'alpha') {
    const data = await ffetch(spreadsheet)
      .sheet(year)
      .map((item) => item)
      .filter((item) => {
        if (selectedValue === '#') return !Number.isNaN(parseInt(item[key].charAt(0), 2));
        return item[key].charAt(0).toUpperCase() === selectedValue;
      })
      .all();
    populateTable(data, tableFields, dataMap, detailsUrl, dataSource, year, tbody);
  } else {
    const data = await ffetch(spreadsheet)
      .sheet(year)
      .map((item) => item)
      .filter((item) => item[key] === selectedValue)
      .all();
    populateTable(data, tableFields, dataMap, detailsUrl, dataSource, year, tbody);
  }

  // Remove load more...
  const loadMoreDiv = block.querySelector('.load-more');
  if (loadMoreDiv) loadMoreDiv.remove();
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const dataSource = config['data-source'];
  const { year } = config;
  const spreadsheet = `/data-source/${dataSource}/${dataSource}-data.json`;
  const dataMapSheet = `/data-source/${dataSource}/data-mapping.json`;
  const filterFields = config['filter-fields'].split(',');
  const tableFields = config['table-fields'].split(',');

  const promises = [];
  promises.push(ffetch(spreadsheet).sheet(year).limit(20).all());
  promises.push(ffetch(dataMapSheet).sheet(year).all());

  const [data, dataMap] = await Promise.all(promises);

  const currentUrlArray = window.location.href.split('/');
  currentUrlArray[currentUrlArray.length - 1] = `${currentUrlArray[currentUrlArray.length - 1]}-${year}details`;
  const detailsUrl = currentUrlArray.join('/');

  // Clear block contents
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
