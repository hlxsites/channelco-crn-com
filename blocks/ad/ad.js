import { buildAdBlock } from '../../scripts/shared.js';

export default function decorate(block) {
  // Extract the unit-id from the block
  const unitIdElement = block.querySelector(
    'div:nth-child(1) > div:nth-child(2)',
  );
  if (!unitIdElement) {
    // eslint-disable-next-line no-console
    console.error('Unit ID not found in the block');
    return;
  }
  const unitId = unitIdElement.textContent;

  // Extract the type from the block
  const typeElement = block.querySelector(
    'div:nth-child(2) > div:nth-child(2)',
  );
  if (!typeElement) {
    // eslint-disable-next-line no-console
    console.error('Type not found in the block');
    return;
  }
  const type = typeElement.textContent;

  // Remove the divs containing the 'id', 'unit-id', 'type', and the type value
  const divContainers = block.querySelectorAll('div > div');
  divContainers.forEach((div) => div.remove());

  block.append(buildAdBlock(unitId, type));
}
