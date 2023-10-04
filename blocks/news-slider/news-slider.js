import { readBlockConfig } from '../../scripts/lib-franklin.js';

function addDragEvents(handle, carousel, isTabsBlock) {
  const RESISTANCE_FACTOR = 5;
  const DRAG_TOLERANCE = 10;
  let BOUNDARY_RIGHT;

  if (isTabsBlock) {
    BOUNDARY_RIGHT = window.innerWidth <= 768 ? -1330 : -3276;
  } else {
    BOUNDARY_RIGHT = window.innerWidth <= 768 ? -930 : -2590;
  }

  function adjustBoundary() {
    if (isTabsBlock) {
      BOUNDARY_RIGHT = window.innerWidth <= 768 ? -1330 : -3276;
    } else {
      BOUNDARY_RIGHT = window.innerWidth <= 768 ? -930 : -2590;
    }
  }

  let isDragging = false;
  let startPos = 0;
  let startMouseX = 0;
  let currentTransform = 0;
  let dragStartedOnLink = null;

  function isMinimalDrag(start, end) {
    return Math.abs(end - start) < DRAG_TOLERANCE;
  }

  function snapToBoundary(ele, boundary) {
    currentTransform = boundary;
    ele.style.transform = `translateX(${boundary}px)`;
  }

  function calculateTransform(current, shift) {
    let newTransform = current + shift;

    if (newTransform > 0 || newTransform < BOUNDARY_RIGHT) {
      newTransform = current + shift / RESISTANCE_FACTOR;
      if (newTransform > 0) {
        carousel.classList.add('dragged-left');
      } else {
        carousel.classList.add('dragged-right');
      }
    } else {
      carousel.classList.remove('dragged-left');
      carousel.classList.remove('dragged-right');
    }

    return newTransform;
  }

  function startDrag(e) {
    if (e.target.tagName === 'A') {
      dragStartedOnLink = e.target;
      e.preventDefault();
    }
    isDragging = true;
    startPos = e.touches ? e.touches[0].clientX : e.clientX;
    startMouseX = startPos;
  }

  function moveDrag(e) {
    if (!isDragging) return;
    const posX = e.touches ? e.touches[0].clientX : e.clientX;
    const dragShift = posX - startPos;

    const newTransform = calculateTransform(currentTransform, dragShift);

    handle.style.transform = `translateX(${newTransform}px)`;
    currentTransform = newTransform;
    startPos = posX;

    e.preventDefault(); // prevent default touch behavior
  }

  function endDrag(e) {
    if (
      dragStartedOnLink
      && isMinimalDrag(
        startMouseX,
        e.changedTouches ? e.changedTouches[0].clientX : e.clientX,
      )
    ) {
      dragStartedOnLink.click();
    }
    dragStartedOnLink = null;
    isDragging = false;

    // Snap back if out of bounds
    if (currentTransform > 0) {
      snapToBoundary(handle, 0);
    } else if (currentTransform < BOUNDARY_RIGHT) {
      snapToBoundary(handle, BOUNDARY_RIGHT);
    }
  }

  carousel.addEventListener('mousedown', startDrag);
  carousel.addEventListener('touchstart', startDrag);

  window.addEventListener('mousemove', moveDrag);
  window.addEventListener('touchmove', moveDrag);

  window.addEventListener('mouseup', endDrag);
  window.addEventListener('touchend', endDrag);

  window.addEventListener('resize', adjustBoundary);
}

export default function decorate(block) {
  const isTabsBlock = block.classList.contains('tabbed');
  let newsItems;
  let newsSlider;
  let carousel;
  let handle;
  let h1;

  if (isTabsBlock) {
    const { title } = readBlockConfig(block);
    h1 = document.createElement('h1');
    h1.textContent = title;
    h1.className = 'slider-title';

    h1 = block.querySelector('ul h1'); //overwrite h1 if its in the block
    if (h1) {
      h1.className = 'slider-title'; // set its class to 'slider-title'
    }

    // Query for anchor tags only when 'tabs' class is present
    newsItems = Array.from(block.querySelectorAll('ul li'));

    newsSlider = document.createElement('div');
    newsSlider.id = 'inthesubtaxonomies';

    carousel = document.createElement('div');
    carousel.id = 'inthetaxonomies-carousel';
    carousel.className = 'dragdealer active';

    handle = document.createElement('div');
    handle.className = 'handle';

    const ul = document.createElement('ul');
    ul.className = 'section-sub-nav nav';

    newsItems.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'slide';

      const link = document.createElement('a');
      link.href = item.href || '#';
      link.className = 'eyebrow-link';
      link.textContent = item.textContent;

      li.appendChild(link);
      ul.appendChild(li);
    });

    handle.appendChild(ul);
    newsSlider.appendChild(carousel);
  } else {
    newsItems = Array.from(block.querySelectorAll('ul li a'));

    newsSlider = document.createElement('div');
    newsSlider.id = 'inthenews';

    const header = document.createElement('div');
    header.className = 'inthenews-header';
    header.textContent = 'In the News:';
    newsSlider.appendChild(header);

    carousel = document.createElement('div');
    carousel.id = 'inthenews-carousel';
    carousel.className = 'dragdealer masked active';

    handle = document.createElement('div');
    handle.className = 'handle';

    newsItems.forEach((item) => {
      const slide = document.createElement('div');
      slide.className = 'slide';

      const newsItem = document.createElement('span');
      newsItem.className = 'inthenews-item';

      const dot = document.createElement('span');
      dot.className = 'inthenews-dot';

      const link = document.createElement('a');
      link.href = item.href;
      link.textContent = item.title;

      newsItem.appendChild(dot);
      newsItem.appendChild(link);
      slide.appendChild(newsItem);
      handle.appendChild(slide);

      const fadeEffect = document.createElement('div');
      fadeEffect.className = 'fade-effect';
      carousel.appendChild(fadeEffect);
    });
  }

  const grayBackground = document.createElement('div');
  grayBackground.className = 'dragdealer-background';

  carousel.appendChild(grayBackground);
  carousel.appendChild(handle);

  newsSlider.appendChild(carousel);
  addDragEvents(handle, carousel, isTabsBlock);

  // Replace the original block with our decorated one
  block.replaceWith(newsSlider);

  const swipeText = document.createElement('div');
  swipeText.className = 'swipe-text';
  swipeText.textContent = '< SWIPE >';

  if (isTabsBlock && h1) {
    newsSlider.parentNode.insertBefore(h1, newsSlider);
  }

  newsSlider.parentNode.appendChild(swipeText);
}
