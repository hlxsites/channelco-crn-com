import ffetch from '../../scripts/ffetch.js';

async function getFilterDetails() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const key = urlSearchParams.get('key');
  const cacheName = urlSearchParams.get('cache');
  const cache = await caches.open(cacheName);
  const cacheResponse = await cache.match(`${key}-details`);

  if (cacheResponse) {
    const { data } = await cacheResponse.json();
    return data;
  }

  // No cache data found, we fetch data from backend
  const [dataSource, year] = cacheName.split('-');
  const spreadsheet = `/data-source/${dataSource}/${dataSource}-data.json`;
  const dataMapSheet = `/data-source/${dataSource}/data-mapping.json`;
  const data = await ffetch(spreadsheet)
    .sheet(year)
    .map((item) => item)
    .filter((item) => item.Pkey === key);
  const { value } = await data.next();
  return value;
}

export default async function decorate(block) {
  const data = await getFilterDetails();
  console.log(data);
}
