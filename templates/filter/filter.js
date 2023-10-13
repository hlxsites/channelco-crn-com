import ffetch from '../../scripts/ffetch.js';

const alphaArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'];

function dataMapLookup(value, dataMap) {
  const foundValue = dataMap.find((item) => item.key === value);
  return foundValue ? foundValue.value : value;
}

function createDropdownOption(value, dataMap) {
  const option = document.createElement('option');
  option.innerText = dataMapLookup(value, dataMap);
  option.setAttribute('value', value);
  return option;
}

// Function to get unique values from an array of keys for each object
function getUniqueValuesByKeys(data, key) {
  const uniqueValues = [];

  data.forEach((obj) => {
    const value = obj[key];

    // Check if the value is not in the uniqueValues array for this key
    if (!uniqueValues.includes(value)) {
      uniqueValues.push(value);
    }
  });

  return uniqueValues;
}

// eslint-disable-next-line import/prefer-default-export
export async function loadDelayed(main) {
  const dropdowns = main.querySelectorAll('select[data-populated="false"]');
  const dataSource = dropdowns[0].getAttribute('data-source');
  const year = dropdowns[0].getAttribute('data-year');
  const dataSheet = `/data-source/${dataSource}/${dataSource}-data.json`;
  const dataMapSheet = `/data-source/${dataSource}/data-mapping.json`;

  const promises = [];
  promises.push(ffetch(dataSheet).sheet(year).all());
  promises.push(ffetch(dataMapSheet).sheet(year).all());

  const [data, dataMap] = await Promise.all(promises);

  dropdowns.forEach((dropdown) => {
    const key = dropdown.getAttribute('data-key');
    const type = dropdown.getAttribute('data-type');

    dropdown.setAttribute('data-populated', true);
    if (type === 'alpha') {
      alphaArr.forEach((item) => {
        dropdown.append(createDropdownOption(item, dataMap));
      });
    } else {
      const uniqueValues = getUniqueValuesByKeys(data, key);
      uniqueValues.forEach((value) => {
        dropdown.append(createDropdownOption(value, dataMap));
      });
    }
  });
}
