import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';
import { decorateLinkedPictures } from '../../scripts/shared.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // fetch footer content
  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(
    `${footerPath}.plain.html`,
    window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {},
  );

  if (resp.ok) {
    const html = await resp.text();

    // decorate footer DOM
    const footer = document.createElement('div');
    footer.innerHTML = html;

    decorateIcons(footer);
    decorateLinkedPictures(footer);
    block.append(footer);

    // create two footer rows
    const row1 = document.createElement('div');
    row1.classList.add('footer-row');
    const row2 = document.createElement('div');
    row2.classList.add('footer-row');

    const footerMain = document.querySelector('.footer-main');
    const footerSublinks = document.querySelector('.footer-sublinks');
    const footerSocials = document.querySelector('.footer-social');

    row1.appendChild(footerMain);
    row2.appendChild(footerSublinks);
    row2.appendChild(footerSocials);

    // wrap footer rows in container
    const footerNavContainer = document.createElement('div');
    const footerContainer = document.querySelector('.footer');
    footerNavContainer.className = 'footer-nav';

    footerNavContainer.appendChild(row1);
    footerNavContainer.appendChild(row2);
    footerContainer.appendChild(footerNavContainer);

    // wrap social icons in own container
    const socialIcons = document.querySelector('.footer-social > div > div');
    socialIcons.className = 'social-icons';
    const followCRN = document.querySelector('.footer-social > div');
    followCRN.className = 'follow-crn';

    const p = socialIcons.querySelector('p');
    followCRN.appendChild(p);

    footerSocials.appendChild(socialIcons);
  }

  block.querySelector('.footer-brand a').setAttribute('aria-label', 'Navigate to homepage');
  block.querySelectorAll('.footer-social a').forEach((a) => {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.setAttribute('aria-label', `Open our ${a.firstElementChild.classList[1].substring(5)} page in a new tab.`);
  });
}
