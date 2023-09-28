export default function decorate(block) {
  // Extract the unit-id from the block
  const unitIdElement = block.querySelector('div:nth-child(1) > div:nth-child(2)');
  if (!unitIdElement) {
    // eslint-disable-next-line no-console
    console.error('Unit ID not found in the block');
    return;
  }
  const unitId = unitIdElement.textContent;

  // Extract the type from the block
  const typeElement = block.querySelector('div:nth-child(2) > div:nth-child(2)');
  if (!typeElement) {
    // eslint-disable-next-line no-console
    console.error('Type not found in the block');
    return;
  }
  const type = typeElement.textContent;

  // Determine the text and class based on the type
  let adText; let
    adClass;
  if (type === 'Advertisement') {
    adText = 'Advertisement';
    adClass = 'right-ad';
  } else if (type === 'Sponsored post') {
    adText = 'Sponsored post';
    adClass = 'right-sponsored';
  } else {
    // eslint-disable-next-line no-console
    console.error('Unknown type in the block');
    return;
  }

  // Remove the divs containing the 'id', 'unit-id', 'type', and the type value
  const divContainers = block.querySelectorAll('div > div');
  divContainers.forEach((div) => div.remove());

  // Build the ad using the extracted unit-id and determined text and class
  const rightAdHTML = `
    <!-- AD IMU  STARTS  -->

    <div class="${adClass}">
      <span class="ad-title">${adText}</span> <br />
      <div id="${unitId}" class="tmsads"></div>
    </div>

    <br clear="all">
  `;

  const range = document.createRange();
  const rightAdEl = range.createContextualFragment(rightAdHTML);
  block.append(rightAdEl);
}
