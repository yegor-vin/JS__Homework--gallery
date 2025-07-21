import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api';
const API_KEY = '50096548-9b55e248e724d91cc3eb8f4be';

axios.defaults.baseURL = BASE_URL;

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreImagesBtn = document.querySelector('.load-more');
const formInput = form.querySelector('input');

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
    console.log(images.hits, 'images');
    const totalHits = images.totalHits;

    if (images.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there was an error fetching the images. Please try again.'
      );
      return;
    } else {
      console.log(images);

      TOTAL_ITEMS = images.totalHits;
      pages = Math.ceil(TOTAL_ITEMS / PER_PAGE);

      console.log(pages, 'pages');

      createImageCard(images.hits);
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

async function fetchImages(page = 1) {
  const params = {
    key: API_KEY,

    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page,
    per_page: 40,
  };

  if (query) {
    params.q = query;
  }

  const response = await axios.get(`/`, { params });

  return response.data;
}

function createImageCard(imagesData) {
  const markup = imagesData.map(
    ({
      id,
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) => {
      return `
     <div class='photo-card'>
  <a href='${largeImageURL}'>
    <img
      src='${webformatURL}'
      alt='${tags}'
      loading='lazy'
      height='200'
      width='360'
    />
  </a>
  <div class='info'>
    <p class='info-item'>
      <b>Likes <br />
      ${likes}
      </b>
    </p>
    <p class='info-item'>
      <b>Views <br />
      ${views}
      </b>
    </p>
    <p class='info-item'>
      <b>Comments <br />
      ${comments}
      </b>
    </p>
    <p class='info-item'>
      <b>Downloads <br />
      ${downloads}
      </b>
    </p>
  </div>
</div>
`;
    }
  );

  gallery.insertAdjacentHTML('beforeend', markup.join(''));

  // Scroll to the bottom of the gallery
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

loadMoreImagesBtn.addEventListener('click', async (e) => {
  if (formInput.value.trim() !== query) {
    query = formInput.value.trim();

    gallery.innerHTML = '';
    currentPage = 1;
  } else {
    currentPage += 1;
  }

  try {
    const images = await fetchImages();

    createImageCard(images.hits);
    lightBox.refresh();

    checkLoadMoreButtonVisibility(images.totalHits);

    if (images.totalHits <= currentPage * 40) {
    }
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

let totalPageButtons = [];

totalPageButtons[totalPageButtons.length - 1] = pages;

if (pages > 7) {
  totalPageButtons[totalPageButtons.length - 2] = '...';
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

prevButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage -= 1;
  }

  if (currentPage < pages) {
    nextButton.disabled = false;
  }

  if (currentPage === 1) {
    prevButton.disabled = true;
  }

  renderPaginationButtons();
});

nextButton.addEventListener('click', () => {
  if (currentPage < pages) {
    currentPage += 1;
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
  const pagination = document.querySelector('.pagination');
  pagination.classList.remove('pagination--hidden');

  const paginationContainer = document.querySelector('.pagination__pages');

  const updatedButtons = totalPageButtons;
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

  const buttonsMarkup = updatedButtons.map((page) => {
    return `
    <button class='pagination__button page ${
      page === currentPage ? 'page--active' : ''
    }'>${page}</button> `;
  });

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

      const response = await fetchImages(currentPage);
      TOTAL_ITEMS = response.hits.length;

      checkLoadMoreButtonVisibility(response.totalHits);

      gallery.innerHTML = '';
      createImageCard(response.hits);
      lightBox.refresh();
    };
  });
}

function checkPaginationVisibility() {
  const pagination = document.querySelector('.pagination');
  if (pages > 1) {
    pagination.classList.remove('pagination--hidden');
  } else {
    pagination.classList.add('pagination--hidden');

    totalPageButtons = Array.from(
      { length: pages > 7 ? 7 : pages },
      (_, i) => i + 1
    );
    renderPaginationButtons();
  }
}
