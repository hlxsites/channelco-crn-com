/**
 * Modifies the DOM as necessary to display the block.
 * @param {HTMLElement} block Default DOM structure for the block.
 */
export default function decorate(block) {
  block.innerHTML = `
    <div class="social-share-buttons-container">
      <div class="sharethis-inline-share-buttons"></div>
    </div>
  `;
}
