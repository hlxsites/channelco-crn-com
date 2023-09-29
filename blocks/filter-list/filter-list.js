import { readBlockConfig } from '../../scripts/lib-franklin.js';
import ffetch from '../../scripts/ffetch.js';

function buildCell(rowIndex) {
  const cell = rowIndex ? document.createElement('td') : document.createElement('th');
  if (!rowIndex) cell.setAttribute('scope', 'col');
  return cell;
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

  // Create filter
  console.log(dataMap);
  
  // Create table
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  const headerRow = document.createElement('tr');
  headerRow.classList.add('row1');
  tableFields.forEach((field) => {
    const cell = buildCell(0);
    cell.innerText = field.includes('(link)') ? field.replace('(link)', '').trim() : field;
    headerRow.append(cell);
  });
  thead.append(headerRow);

  data.forEach((item, i) => {
    const row = document.createElement('tr');
    const isEvenRow = i % 2 === 0;
    row.classList.add(isEvenRow ? 'row2' : 'row1');
    tableFields.forEach((field) => {
      const isDetailsLink = field.includes('(link)');
      const value = isDetailsLink ? item[field.replace('(link)', '').trim()] : item[field];
      const cell = buildCell(1);
      if (isDetailsLink) {
        const a = document.createElement('a');
        a.href = `${detailsUrl}?key=${item.Pkey}&reportCode=${spreadsheet}&year`;
        a.innerText = value;
        cell.append(a);
      } else {
        cell.innerText = value;
      }
      row.append(cell);
    });
    tbody.append(row);
  });
  block.innerHTML = '';
  block.append(table);
}
