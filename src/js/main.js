import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './api.js';
import { renderCards } from './render.js';

import { form, gallery, loadMoreImagesBtn, formInput } from './refs.js';
import { checkLoadMoreButtonVisibility } from './loadMore.js';
import {makeTotalPageButtonsArray, checkPaginationVisibility} from './pagination.js';
import { variables } from './variables.js';




let lightBox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

variables.query = formInput.value.trim();


form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (formInput.value.trim() === '') {
    Notiflix.Notify.failure('Please enter a search query to find images.');

    return;
  }

  loadMoreImagesBtn.style.display = 'none';
  gallery.innerHTML = '';
  variables.currentPage = 1;

  if (formInput.value.trim() !== variables.query) {
    variables.query = formInput.value.trim();
  }

  try {
    const images = await fetchImages(variables.query, );

    const totalHits = images.totalHits;
    makeTotalPageButtonsArray(totalHits);

    if (images.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there was an error fetching the images. Please try again.'
      );
      return;
    } else {
      renderCards(images.hits, gallery);
      lightBox.refresh();
      checkLoadMoreButtonVisibility(totalHits, variables.currentPage, loadMoreImagesBtn);
      checkPaginationVisibility();

      Notiflix.Notify.success(
        `Hooray! We found totalHits images ${totalHits}.`
      );
    }
  } catch (error) {
    console.error('Error fetching images:', error);
    Notiflix.Notify.failure(
      'Sorry, there was an error fetching the images. Please try again.'
    );
  }
});

// ASYNC / AWAIT

/* loadMoreImagesBtn.addEventListener('click', async () => {
  if (formInput.value.trim() !== query) {
    gallery.innerHTML = '';
    query = formInput.value.trim();

    currentPage = 1;
  } else {
    currentPage += 1;
  }

  try {
    const images = await fetchImages(query, currentPage);
    makeTotalPageButtonsArray(images.totalHits);

    renderCards(images.hits, gallery);
    lightBox.refresh();
    checkLoadMoreButtonVisibility(
      images.totalHits,
      currentPage,
      loadMoreImagesBtn
    );
    checkPaginationVisibility();
  } catch (error) {
    console.error('Error fetching additional images:', error);
  }
}); */

// PAGINATION
/* 
let TOTAL_ITEMS = 0;

const PER_PAGE = 40;
let pages = 0;

let totalPageButtons = 0;
 */
/* function makeTotalPageButtonsArray(totalHits) {
  TOTAL_ITEMS = totalHits;
  pages = Math.ceil(TOTAL_ITEMS / PER_PAGE);
  totalPageButtons = totalPageButtons = Array.from(
    { length: pages > 7 ? 7 : pages },
    (_, i) => i + 1
  );

  totalPageButtons[totalPageButtons.length - 1] = pages;
  if (pages > 7) {
    totalPageButtons[totalPageButtons.length - 2] = '...';
  }
}

 */



/* prevButton.addEventListener('click', async () => {
  if (currentPage > 1) {
    currentPage -= 1;

    gallery.innerHTML = '';

    const response = await fetchImages(query, currentPage);

    checkLoadMoreButtonVisibility(
      response.totalHits,
      currentPage,
      loadMoreImagesBtn
    );

    renderCards(response.hits, gallery);
    lightBox.refresh();
  }

  if (currentPage < variables.pages) {
    nextButton.disabled = false;
  }

  if (currentPage === 1) {
    prevButton.disabled = true;
  }

  renderPaginationButtons({ pages, currentPage, totalPageButtons });
});

nextButton.addEventListener('click', async () => {
  if (currentPage < variables.pages) {
    currentPage += 1;

    gallery.innerHTML = '';

    const response = await fetchImages(query, currentPage);

    checkLoadMoreButtonVisibility(
      response.totalHits,
      currentPage,
      loadMoreImagesBtn
    );

    renderCards(response.hits, gallery);
    lightBox.refresh();
  }

  if (currentPage > 1) {
    prevButton.disabled = false;
  }

  if (currentPage === variables.pages) {
    nextButton.disabled = true;
  }

  renderPaginationButtons({ totalPageButtons, pages, currentPage });
});
 */


/* function renderPaginationButtons({ pages, currentPage, totalPageButtons }) {
  const paginationContainer = document.querySelector('.pagination__pages');

  const updatedButtons = variables.totalPageButtons;
  if (variables.totalPageButtons.length > 7) {
    if (currentPage >= 1 && currentPage <= 4) {
      updatedButtons[0] = 1;
      updatedButtons[1] = 2;
      updatedButtons[2] = 3;
      updatedButtons[3] = 4;
      updatedButtons[4] = 5;
      updatedButtons[5] = '...';
    }

    if (currentPage > 4 && currentPage < variables.pages - 3) {
      updatedButtons[1] = '...';
      updatedButtons[2] = currentPage - 1;
      updatedButtons[3] = currentPage;
      updatedButtons[4] = currentPage + 1;
      updatedButtons[5] = '...';
    }

    if (currentPage >= variables.pages - 3) {
      updatedButtons[1] = '...';
      updatedButtons[2] = variables.pages - 4;
      updatedButtons[3] = variables.pages - 3;
      updatedButtons[4] = variables.pages - 2;
      updatedButtons[5] = variables.pages - 1;
    }
  }

  const buttonsMarkup = updatedButtons.map(
    (page) => `
    <button class='pagination__button page ${
      page === currentPage ? 'page--active' : ''
    }'>${page}</button> `
  );

  paginationContainer.innerHTML = buttonsMarkup.join('');

  const paginationButtons = document.querySelectorAll('.page');

  paginationButtons.forEach((button) => {
    button.onclick = async () => {
      const pageNumber = parseInt(button.textContent, 10);
      if (pageNumber && pageNumber !== currentPage) {
        currentPage = pageNumber;

        renderPaginationButtons({ pages, currentPage, totalPageButtons });

        if (currentPage === 1) {
          prevButton.disabled = true;
        } else {
          prevButton.disabled = false;
        }

        if (currentPage === variables.pages) {
          nextButton.disabled = true;
        } else {
          nextButton.disabled = false;
        }
      }

      const response = await fetchImages(query, currentPage);
      makeTotalPageButtonsArray(response.totalHits);

      checkPaginationVisibility();

      checkLoadMoreButtonVisibility(
        response.totalHits,
        currentPage,
        loadMoreImagesBtn
      );

      gallery.innerHTML = '';
      renderCards(response.hits, gallery);
      lightBox.refresh();

      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  });
}

function checkPaginationVisibility() {
  const pagination = document.querySelector('.pagination');
  if (variables.pages > 0) {
    pagination.classList.remove('pagination--hidden');
    renderPaginationButtons({ pages, currentPage, totalPageButtons });
  } else {
    pagination.classList.add('pagination--hidden');
  }
}
 */
