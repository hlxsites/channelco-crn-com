import { fetchPlaceholders, loadScript, readBlockConfig } from '../../scripts/lib-franklin.js';

function loadVideoLibrary(block, videoAccount, videoPlayer) {
  if (block.getAttribute('data-video-status') === 'loaded') {
    return;
  }
  loadScript(`https://players.brightcove.net/${videoAccount}/${videoPlayer}_default/index.min.js`);
  block.setAttribute('data-video-status', 'loaded');
}

export default async function decorate(block) {
  const { player, playlist, video } = readBlockConfig(block);
  const { brightcovedataaccount } = await fetchPlaceholders();

  block.innerHTML = `
    <div class="${playlist ? 'vjs-playlist-player-container' : 'brightcove-video'}">
    <video-js
        data-account="${brightcovedataaccount}"
        data-player="${player}"
        data-embed="default"
        class="vjs-fluid video-playlist video-js vjs-paused vjs-controls-enabled vjs-workinghover vjs-v7 vjs-user-active vjs-layout-large vjs-mouse vjs-playlist-enabled vjs-plugins-ready vjs-player-info vjs-contextmenu vjs-contextmenu-ui vjs-errors vjs-thumbnails not-hover" 
        controls=""
        data-video-id="${video || ''}"
        data-playlist-id="${playlist || ''}"
        data-application-id=""
        class="vjs-fluid">
      </video-js>
      ${playlist ? '<div class="vjs-playlist"></div>' : ''}
    </div>
  `;

  const options = {
    root: null,
    rootMargin: '20%',
    threshold: 1.0,
  };

  // add event listener for intersection observer when block is in view port
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadVideoLibrary(block, brightcovedataaccount, player);
        observer.unobserve(block);
      }
    });
  }, options);

  // observe the block
  observer.observe(block);
}
