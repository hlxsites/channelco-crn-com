import ffetch from '../../scripts/ffetch.js';
import { readBlockConfig } from '../../scripts/lib-franklin.js';

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function populateSponsoredResources(block) {
  const config = readBlockConfig(block);
  const dataSource = config.datasource;

  try {
    const dataGenerator = ffetch(dataSource);
    const allFetchedLinks = await dataGenerator.all();

    const ul = document.querySelector('.sponsored-resources ul');

    const randomFiveLinks = shuffle(allFetchedLinks).slice(0, 5);

    randomFiveLinks.forEach((item) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.URL;
      a.title = item.Title;
      a.textContent = item.Title;
      a.target = '_blank';

      li.appendChild(a);
      ul.appendChild(li);
    });
  } catch (error) {
    const errorMessage = document.createElement('p');
    errorMessage.textContent = 'Unable to load the sponsored resources. Please try again later.';
    errorMessage.className = 'error-message';
    const container = document.querySelector('.sponsored-resources');
    container.appendChild(errorMessage);
  }
}

export default function decorate(block) {
  if (block.classList.contains('magazine')) {
    const h2 = block.querySelector('h2');
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('content-wrapper');

    const linksContainer = document.createElement('div');
    linksContainer.classList.add('links-container');

    const pButtons = block.querySelectorAll('.button-container');
    pButtons.forEach((pButton) => {
      linksContainer.appendChild(pButton);
    });
    contentWrapper.appendChild(linksContainer);

    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container');
    const picture = block.querySelector('picture');
    imageContainer.appendChild(picture);
    contentWrapper.appendChild(imageContainer);

    block.appendChild(h2);
    block.appendChild(contentWrapper);
  }

  if (block.classList.contains('tv')) {
    const pElements = block.querySelectorAll('p');
    if (pElements.length >= 2) {
      [pElements[pElements.length - 2], pElements[pElements.length - 1]].forEach((pElem) => {
        const contentWrapper = document.createElement('div');
        contentWrapper.classList.add('content-wrapper');

        // Links Container for the <p>
        const linksContainer = document.createElement('div');
        linksContainer.classList.add('links-container');
        const aElem = pElem.querySelector('a');
        if (aElem) {
          aElem.remove();
          linksContainer.appendChild(aElem);
          contentWrapper.appendChild(linksContainer);
          pElem.appendChild(contentWrapper); // Attach the content wrapper back to the original <p>
        }

        // Image Container for the <p>
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');
        const pictureElem = pElem.querySelector('picture');
        if (pictureElem) {
          pictureElem.remove();
          imageContainer.appendChild(pictureElem);
          contentWrapper.appendChild(imageContainer);
        }
      });
    }
  }

  if (block.classList.contains('newsletter')) {
    const h2 = block.querySelector('h2');

    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('content-wrapper');

    // Links Container
    const linksContainer = document.createElement('div');
    linksContainer.classList.add('links-container');
    const firstP = block.querySelector('p');
    const h3 = block.querySelector('h3');

    if (firstP) linksContainer.appendChild(firstP.cloneNode(true));
    if (h3) linksContainer.appendChild(h3.cloneNode(true));

    contentWrapper.appendChild(linksContainer);

    // Image Container
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container');
    const picture = block.querySelector('picture');
    if (picture) imageContainer.appendChild(picture.cloneNode(true));

    contentWrapper.appendChild(imageContainer);

    // Clean up the original content inside block and append the newly created contentWrapper
    while (block.firstChild) {
      block.removeChild(block.firstChild);
    }

    block.appendChild(h2);
    block.appendChild(contentWrapper);
  }

  if (block.classList.contains('sponsored-resources')) {
    const h2 = document.createElement('h2');
    h2.id = 'sponsored-resources';
    h2.innerText = 'SPONSORED RESOURCES';

    const ul = document.createElement('ul');

    block.appendChild(h2);
    block.appendChild(ul);

    populateSponsoredResources(block);
  }
}
