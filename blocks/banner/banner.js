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
}
