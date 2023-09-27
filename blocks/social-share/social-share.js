/**
 * Modifies the DOM as necessary to display the block.
 * @param {HTMLElement} block Default DOM structure for the block.
 */
export default function decorate(block) {
  // TODO: need to react to clicking share links.
  block.innerHTML = `
    <a href="#" title="Share to LinkedIn" aria-label="Share to LinkedIn" class="social-share-linked-in">
      <img src="https://platform-cdn.sharethis.com/img/linkedin.svg" alt="Share to LinkedIn" />
    </a>
    <a href="#" title="Share to Facebook" aria-label="Share to Facebook" class="social-share-facebook">
      <img src="https://platform-cdn.sharethis.com/img/facebook.svg" alt="Share to Facebook" />
    </a>
    <a href="#" title="Share to Twitter" aria-label="Share to Twitter" class="social-share-twitter">
      <img src="https://platform-cdn.sharethis.com/img/twitter.svg" alt="Share to Twitter" />
    </a>
    <a href="#" title="Share to Email" aria-label="Share to Email" class="social-share-email">
      <img src="https://platform-cdn.sharethis.com/img/email.svg" alt="Share to Email" />
    </a>
    <a href="#" title="Share This" aria-label="Share This" class="social-share-this">
      <img src="https://platform-cdn.sharethis.com/img/sharethis.svg" alt="Share This" />
    </a>
  `;
}
