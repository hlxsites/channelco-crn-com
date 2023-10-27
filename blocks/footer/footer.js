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
  const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});

  if (resp.ok) {
    const html = await resp.text();

    // decorate footer DOM
    const footer = document.createElement('div');
    footer.innerHTML = html;

    // Creating footer-nav div
    const footerNav = document.createElement('div');
    footerNav.className = 'footer-nav';

    // Creating first footer-row with footer-main as child
    const footerRow1 = document.createElement('div');
    footerRow1.className = 'footer-row';
    const footerMain = footer.querySelector('.footer-main');
    footerRow1.appendChild(footerMain.cloneNode(true));
    footerMain.remove();

    // Creating second footer-row with footer-sublinks, spacer, and footer-social as children
    const footerRow2 = document.createElement('div');
    footerRow2.className = 'footer-row';
    const footerSublinks = footer.querySelector('.footer-sublinks');
    const footerSocial = footer.querySelector('.footer-social');
    const spacer = document.createElement('div');
    spacer.className = 'spacer';

    // handle icons
    const paragraphs = footerSocial.querySelectorAll('p');

    // Wrap the first p tag in follow-crn
    const followCrn = document.createElement('div');
    followCrn.className = 'follow-crn';
    followCrn.appendChild(paragraphs[0].cloneNode(true));
    paragraphs[0].remove();

    // Wrap the rest of the p tags in social-icons
    const socialIcons = document.createElement('div');
    socialIcons.className = 'social-icons';
    paragraphs.forEach((p, index) => {
      if (index > 0) {
        socialIcons.appendChild(p.cloneNode(true));
        p.remove();
      }
    });

    // Append the new divs back to footer-social
    footerSocial.appendChild(followCrn);
    footerSocial.appendChild(socialIcons);

    footerRow2.appendChild(spacer);
    footerRow2.appendChild(footerSublinks.cloneNode(true));
    footerRow2.appendChild(footerSocial.cloneNode(true));
    footerSublinks.remove();
    footerSocial.remove();

    // Appending rows to footer-nav
    footerNav.appendChild(footerRow1);
    footerNav.appendChild(footerRow2);

    footer.appendChild(footerNav);

    decorateIcons(footer);
    decorateLinkedPictures(footer);
    block.append(footer);

    // Select the first div inside .footer.block
    const topLevelDiv = block.querySelector('div');

    if (topLevelDiv) {
      // Get all the child nodes of the inner div
      const children = Array.from(topLevelDiv.childNodes);

      // Insert each child node directly inside .footer.block before the topLevelDiv
      children.forEach((child) => {
        block.insertBefore(child, topLevelDiv);
      });

      // Remove the topLevelDiv
      block.removeChild(topLevelDiv);
    }
  }
}
