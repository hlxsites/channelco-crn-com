import { fetchPlaceholders, readBlockConfig } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const { player, playlist, video } = readBlockConfig(block);
  const { brightcovedataaccount } = await fetchPlaceholders();
  block.innerHTML = '';

  const html = `
    <div class="${playlist ? 'brightcove-playlist' : 'brightcove-video'}">
      <video-js
        data-account="${brightcovedataaccount}"
        data-player="${player}"
        controls=""
        data-embed="default"
        data-video-id="${video || ''}"
        data-playlist-id="${playlist || ''}"
        data-application-id=""
        class="vjs-fluid"></video-js>
      <script src="//players.brightcove.net/${brightcovedataaccount}/${player}_default/index.min.js"></script>
      ${playlist ? '<div class="vjs-playlist"></div>' : ''}
    </div>
  `;

  const range = document.createRange();
  const brightcoveEl = range.createContextualFragment(html);
  block.append(brightcoveEl);
}
