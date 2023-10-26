export default async function decorate(block) {
  const iframe = document.createElement('iframe');
  const link = block.querySelector('a')?.getAttribute('href');
  const fixedHeightClass = [...block.classList].find((el) => /[0-9]+px/.test(el));

  if (fixedHeightClass) {
    iframe.height = fixedHeightClass;
  }
  iframe.src = link;
  iframe.setAttribute('frameborder', 0);

  const options = {
    root: null,
    rootMargin: '20%',
    threshold: 1.0,
  };

  // add event listener for intersection observer when block is in view port
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        block.replaceChildren(iframe);
        observer.unobserve(block);
      }
    });
  }, options);

  // observe the block
  observer.observe(block);
}
