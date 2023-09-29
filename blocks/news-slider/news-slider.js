function addDragEvents(handle, carousel) {
  const RESISTANCE_FACTOR = 5;
  const DRAG_TOLERANCE = 10;

  let BOUNDARY_RIGHT = window.innerWidth <= 768 ? -600 : -2596;

  function adjustBoundary() {
    BOUNDARY_RIGHT = window.innerWidth <= 768 ? -600 : -2596;
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
  const newsItems = Array.from(block.querySelectorAll('ul li a'));

  // Create the main container
  const newsSlider = document.createElement('div');
  newsSlider.id = 'inthenews';

  const header = document.createElement('div');
  header.className = 'inthenews-header';
  header.textContent = 'In the News:';
  newsSlider.appendChild(header);

  const carousel = document.createElement('div');
  carousel.id = 'inthenews-carousel';
  carousel.className = 'dragdealer masked active';

  const handle = document.createElement('div');
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
  });

  const grayBackground = document.createElement('div');
  grayBackground.className = 'dragdealer-background';

  const fadeEffect = document.createElement('div');
  fadeEffect.className = 'fade-effect';

  carousel.appendChild(grayBackground);
  carousel.appendChild(fadeEffect);
  carousel.appendChild(handle);

  carousel.appendChild(handle);
  newsSlider.appendChild(carousel);
  addDragEvents(handle, carousel);

  // Replace the original block with our decorated one
  block.replaceWith(newsSlider);

  const swipeText = document.createElement('div');
  swipeText.className = 'swipe-text';
  swipeText.textContent = '< SWIPE >';

  newsSlider.parentNode.appendChild(swipeText);
}
