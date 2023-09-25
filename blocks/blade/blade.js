/**
 * Decorates the block's content with any additional elements required to
 * render the block.
 * @param {HTMLElement} block Element containing the block's author data.
 */
export default function decorate(block) {
  [...block.children].forEach((blade) => {
    [...blade.children].forEach((column) => {
      const picture = column.querySelector('picture');
      if (picture) {
        column.classList.add('blade-picture');
      } else {
        column.classList.add('blade-text');
        // ensure proper text wrapping
        column.innerHTML = column.innerHTML.replaceAll(/&nbsp;/g, ' ');
      }
    });
  });
}
