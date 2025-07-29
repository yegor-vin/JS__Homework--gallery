import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './api.js';
import { renderCards } from './render.js';

import { form, gallery, loadMoreImagesBtn, formInput } from './refs.js';

let lightBox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

let query = formInput.value.trim();

let currentPage = 1;

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (formInput.value.trim() === '') {
    Notiflix.Notify.failure('Please enter a search query to find images.');

    return;
  }

  loadMoreImagesBtn.style.display = 'none';
  gallery.innerHTML = '';
  currentPage = 1;

  if (formInput.value.trim() !== query) {
    query = formInput.value.trim();
  }

  try {
    const images = await fetchImages(query);

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
      checkLoadMoreButtonVisibility(totalHits);
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

loadMoreImagesBtn.addEventListener('click', async (e) => {
  if (formInput.value.trim() !== query) {
    gallery.innerHTML = '';
    query = formInput.value.trim();

    currentPage = 1;
  } else {
    currentPage += 1;
  }

  try {
    const images = await fetchImages(query);
    makeTotalPageButtonsArray(images.totalHits);

    renderCards(images.hits, gallery);
    lightBox.refresh();
    checkPaginationVisibility();
    checkLoadMoreButtonVisibility(images.totalHits);
  } catch (error) {
    console.error('Error fetching additional images:', error);
  }
});

function checkLoadMoreButtonVisibility(totalImages) {
  if (totalImages <= currentPage * 40) {
    loadMoreImagesBtn.style.display = 'none';

    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  } else {
    loadMoreImagesBtn.style.display = 'block';
  }
}

// PAGINATION

let TOTAL_ITEMS = 0;

const PER_PAGE = 40;
let pages = 0;

let totalPageButtons = 0;

function makeTotalPageButtonsArray(totalHits) {
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

function renderPagination() {
  const pagination = `
  <div class='pagination pagination--hidden' >
  <button class='pagination__button prev'> < </button>
  <div class='pagination__pages'></div>
  <button class='pagination__button next'> > </button>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', pagination);
}

renderPagination();

const prevButton = document.querySelector('.pagination__button.prev');
if (currentPage === 1) prevButton.disabled = true;

const nextButton = document.querySelector('.pagination__button.next');

prevButton.addEventListener('click', async () => {
  if (currentPage > 1) {
    currentPage -= 1;

    gallery.innerHTML = '';

    const response = await fetchImages(query, currentPage);

    checkLoadMoreButtonVisibility(response.totalHits);

    renderCards(response.hits, gallery);
    lightBox.refresh();
  }

  if (currentPage < pages) {
    nextButton.disabled = false;
  }

  if (currentPage === 1) {
    prevButton.disabled = true;
  }

  renderPaginationButtons();
});

nextButton.addEventListener('click', async () => {
  if (currentPage < pages) {
    currentPage += 1;

    gallery.innerHTML = '';

    const response = await fetchImages(query, currentPage);

    checkLoadMoreButtonVisibility(response.totalHits);

    renderCards(response.hits, gallery);
    lightBox.refresh();
  }

  if (currentPage > 1) {
    prevButton.disabled = false;
  }

  if (currentPage === pages) {
    nextButton.disabled = true;
  }

  renderPaginationButtons();
});

function renderPaginationButtons() {
  const paginationContainer = document.querySelector('.pagination__pages');

  const updatedButtons = totalPageButtons;
  if (totalPageButtons.length > 7) {
    if (currentPage >= 1 && currentPage <= 4) {
      updatedButtons[0] = 1;
      updatedButtons[1] = 2;
      updatedButtons[2] = 3;
      updatedButtons[3] = 4;
      updatedButtons[4] = 5;
      updatedButtons[5] = '...';
    }

    if (currentPage > 4 && currentPage < pages - 3) {
      updatedButtons[1] = '...';
      updatedButtons[2] = currentPage - 1;
      updatedButtons[3] = currentPage;
      updatedButtons[4] = currentPage + 1;
      updatedButtons[5] = '...';
    }

    if (currentPage >= pages - 3) {
      updatedButtons[1] = '...';
      updatedButtons[2] = pages - 4;
      updatedButtons[3] = pages - 3;
      updatedButtons[4] = pages - 2;
      updatedButtons[5] = pages - 1;
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

        renderPaginationButtons();

        if (currentPage === 1) {
          prevButton.disabled = true;
        } else {
          prevButton.disabled = false;
        }

        if (currentPage === pages) {
          nextButton.disabled = true;
        } else {
          nextButton.disabled = false;
        }
      }

      const response = await fetchImages(query, currentPage);
      makeTotalPageButtonsArray(response.totalHits);

      checkPaginationVisibility();

      checkLoadMoreButtonVisibility(response.totalHits);

      gallery.innerHTML = '';
      renderCards(response.hits, gallery);
      lightBox.refresh();

      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  });
}

function checkPaginationVisibility() {
  const pagination = document.querySelector('.pagination');
  if (pages > 0) {
    pagination.classList.remove('pagination--hidden');
    renderPaginationButtons();
  } else {
    pagination.classList.add('pagination--hidden');
  }
}
