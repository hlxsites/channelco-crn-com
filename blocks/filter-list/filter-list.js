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

  // Create cache for data in details and filters
  const cacheName = `${dataSource}-${year}`;
  const cache = await caches.open(cacheName);

  // Create table
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  const headerRow = document.createElement('tr');
  headerRow.classList.add('row1');
  tableFields.forEach((field) => {
    const cell = buildCell(0);
    const rawValue = field.includes('(link)') ? field.replace('(link)', '').trim() : field;
    const foundValue = dataMap.find((mapItem) => mapItem.key === rawValue);
    cell.innerText = foundValue ? foundValue.value : rawValue;
    headerRow.append(cell);
  });
  thead.append(headerRow);

  data.forEach((item, i) => {
    const row = document.createElement('tr');
    const isEvenRow = i % 2 === 0;
    row.classList.add(isEvenRow ? 'row2' : 'row1');
    tableFields.forEach(async (field) => {
      const isDetailsLink = field.includes('(link)');
      const rawValue = isDetailsLink ? item[field.replace('(link)', '').trim()] : item[field];
      const foundValue = dataMap.find((mapItem) => mapItem.key === rawValue);
      const value = foundValue ? foundValue.value : rawValue;
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
  block.innerHTML = '';
  block.append(table);
}
