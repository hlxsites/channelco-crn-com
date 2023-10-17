import { readBlockConfig, fetchPlaceholders } from '../../scripts/lib-franklin.js';

function loadScriptAndLoadForm(formId, divId) {
  const script = document.createElement('script');
  script.src = 'https://pages.thechannelco.com/js/forms2/js/forms2.min.js';
  script.onload = () => {
    window.MktoForms2.loadForm('//pages.thechannelco.com', formId, divId);
  };
  document.head.appendChild(script);
}

export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const placeholders = await fetchPlaceholders();
  const formId = placeholders.marketoformid;
  const divId = blockConfig.id;

  if (formId && divId) {
    block.textContent = '';
    const formDiv = document.createElement('form');
    formDiv.id = `mktoForm_${divId}`;
    block.append(formDiv);
    const observer = new IntersectionObserver(async (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadScriptAndLoadForm(formId, divId);
      }
    });
    observer.observe(block);
  }
}
