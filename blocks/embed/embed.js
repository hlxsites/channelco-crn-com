import { readBlockConfig } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
  const config = readBlockConfig(block);
  if (config.url) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        const html = `
          <div class="embed-container">
            <div>
                <iframe loading="lazy" allow="encrypted-media" allowfullscreen="" src="${config.url}"></iframe>
            </div>
          </div>
        `;
        block.innerHTML = html;
        observer.disconnect();
      }
    });
    observer.observe(block);
    block.textContent = '';
  } else {
    block.remove();
  }
}
