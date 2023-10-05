/* eslint-disable no-unused-vars */
/* eslint-disable no-new */
/* eslint-disable no-undef */
function createCookie(name, value, days) {
  let expires;

  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = `; expires=${date.toGMTString()}`;
  } else {
    expires = '';
  }
  document.cookie = `${encodeURIComponent(name)}=${value}${expires}; path=/`;
}

function googleTranslateElementInit() {
  new google.translate.TranslateElement({ pageLanguage: 'en' }, 'google_translate_element');
}

function loadGoogleTranslateScript() {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.body.appendChild(script);
}

const domain = window.location.hostname;
if (domain === 'www.crnitalia.it') {
  createCookie('googtrans', '/en/it');
} else if (domain === 'www.crnfrance.fr') {
  createCookie('googtrans', '/en/fr');
}
loadGoogleTranslateScript();
