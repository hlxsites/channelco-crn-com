import {
  buildBlock,
  decorateBlock,
  loadBlock,
} from '../../scripts/lib-franklin.js';
import {
  getArticlesByCategory,
  getRecordByPath,
  comparePublishDate,
  buildArticleCardsBlock,
  buildNewsSlider,
} from '../../scripts/shared.js';

import ffetch from '../../scripts/ffetch.js';

/**
 * Modifies the DOM with additional elements required to display a category page.
 * @param {HTMLElement} main The page's main element.
 */
// eslint-disable-next-line import/prefer-default-export
let startIndex = 5;
let endIndex = 13;
let totalArtciles;
export async function loadEager(main) {
  const category = await getRecordByPath(window.location.pathname);
  if (!category) {
    return;
  }
  console.log(category);
  buildNewsSlider(main, category.title);
}

function buildCategoryNavigation(main){
  const categoryNav = document.createElement('div');
  categoryNav.classList.add('category-nav');
  if(startIndex > 5) {
    const prevDiv = document.createElement('div');
    prevDiv.classList.add('previous');
    prevDiv.id = 'previous-button';
    const prevBtn = document.createElement('a');
    prevBtn.classList.add('btn-on-white');
    prevBtn.classList.add('white');
    prevBtn.id = 'previous'
    prevBtn.textContent = 'Prev';
    prevDiv.appendChild(prevBtn);
    categoryNav.append(prevDiv);
    prevBtn.addEventListener('click', () =>{
      startIndex = startIndex - 15;
      endIndex = endIndex - 15;
      loadArticle(main);
    });
  }
  if(endIndex < totalArtciles) {
    const nextDiv = document.createElement('div');
    nextDiv.classList.add('load-more');
    nextDiv.id = 'load-more-button';
    const nextBtn = document.createElement('a');
    nextBtn.classList.add('btn-on-white');
    nextBtn.classList.add('white');
    nextBtn.id = 'load-more'
    nextBtn.textContent = 'Next';
    nextDiv.appendChild(nextBtn);
    categoryNav.append(nextDiv);
    nextBtn.addEventListener('click', ()=>{
      startIndex = startIndex + 15;
      endIndex = endIndex + 15;
      loadArticle(main);
    });
  }  
  return categoryNav;    
}

/**
 * Modifies the DOM with additional elements required to display a category page.
 * @param {HTMLElement} main The page's main element.
 */
// eslint-disable-next-line import/prefer-default-export

async function loadArticle(main) {
  console.log('inside loadArticle'+window.location.pathname);
  const category = await ffetch('/query-index.json').filter((article) => {
    return  article.path === window.location.pathname;
  }).all();
  
  if (!category) {
    console.log('inside if');
    return;
  }
  console.log(category);
  let lastElement;
  const contentSection = main.querySelector('.content-section');
  if (!contentSection) {
    return;
  }
  if (contentSection.children.length > 0) {
    lastElement = contentSection.children.item(0);
  }

  const articles = await getArticlesByCategory(category.category);
  totalArtciles = articles.length;console.log(totalArtciles);
  console.log(category);
  articles.sort(comparePublishDate);
  if(startIndex === 5) {
    buildArticleCardsBlock(articles.slice(0, 5), (leadCards) => {
      leadCards.classList.add('lead-article');
      contentSection.insertBefore(leadCards, lastElement);
    });
}
  const newsLinkText = `${category.title} News`;
  const newsLink = document.createElement('a');
  newsLink.title = newsLinkText;
  newsLink.ariaLabel = newsLinkText;
  newsLink.classList.add('link-arrow');
  newsLink.innerText = newsLinkText;

  const newsHeading = document.createElement('h2');
  newsHeading.append(newsLink);
  contentSection.insertBefore(newsHeading, lastElement);

  buildArticleCardsBlock(articles.slice(startIndex, endIndex), (cards) => {
    contentSection.insertBefore(cards, lastElement);
  });

  const categoryNavigation = buildCategoryNavigation(main);
  contentSection.append(categoryNavigation);
}

export async function loadLazy(main) {
  loadArticle(main);
}
