import ffetch from '../../scripts/ffetch.js';

export default async function decorate(block) {
  const urlSearchParams = new URLSearchParams(window.location.search);
  console.log(urlSearchParams);
  const key = urlSearchParams.get('key');
  const dataSource = urlSearchParams.get('dataSource');
  const year = urlSearchParams.get('year');
  const data = await ffetch(dataSource)
    .sheet(year)
    .map(({ Pkey }) => Pkey)
    .filter((Pkey) => Pkey === key);
  console.log(data.next());
}
