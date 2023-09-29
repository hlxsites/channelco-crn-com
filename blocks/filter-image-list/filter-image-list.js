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
  const filterFields = config['filter-fields'].split(',');
  const tableFields = config['table-fields'].split(',');

  const data = await ffetch(spreadsheet).sheet(year).all();

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  const headerRow = document.createElement('tr');
  tableFields.forEach((field) => {
    const cell = buildCell(0);
    cell.innerText = field;
    headerRow.append(cell);
  });
  thead.append(headerRow);

  data.forEach((item) => {
    const row = document.createElement('tr');
    tableFields.forEach((field) => {
      const value = item[field];
      const cell = buildCell(1);
      cell.innerText = value;
      row.append(cell);
    });
    tbody.append(row);
  });
  block.innerHTML = '';
  block.append(table);
  // [...block.children].forEach((child, i) => {
  //   const row = document.createElement('tr');
  //   if (i) tbody.append(row);
  //   else thead.append(row);
  //   [...child.children].forEach((col) => {
  //     const cell = buildCell(i);
  //     cell.innerHTML = col.innerHTML;
  //     row.append(cell);
  //   });
  // });
  // block.innerHTML = '';
  // block.append(table);
}
