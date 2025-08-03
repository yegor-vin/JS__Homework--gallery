import { loadMoreImagesBtn, formInput, gallery } from './refs';
import { variables, PER_PAGE } from './variables';
import { fetchImages } from './api';
import { renderCards } from './render';
import { checkLoadMoreButtonVisibility } from './loadMore';

variables.query = formInput.value.trim();

loadMoreImagesBtn.addEventListener('click', async () => {
  if (formInput.value.trim() !== variables.query) {
    gallery.innerHTML = '';
    variables.query = formInput.value.trim();

    variables.currentPage = 1;
  } else {
    variables.currentPage += 1;
  }

  try {
    const images = await fetchImages(variables.query, variables.currentPage);
    makeTotalPageButtonsArray(images.totalHits);

    renderCards(images.hits, gallery);
    /*  lightBox.refresh(); */
    checkLoadMoreButtonVisibility(
      images.totalHits,
      variables.currentPage,
      loadMoreImagesBtn
    );
    checkPaginationVisibility();
  } catch (error) {
    console.error('Error fetching additional images:', error);
  }
});

function renderPagination() {
  document.body.insertAdjacentHTML(
    'beforeend',
    `
      <div class='pagination pagination--hidden'>
        <button class='pagination__button prev'> < </button>
        <div class='pagination__pages'></div>
        <button class='pagination__button next'> > </button>
      </div>
    `
  );
}

renderPagination();

const prevButton = document.querySelector('.pagination__button.prev');
if (variables.currentPage === 1) prevButton.disabled = true;
const nextButton = document.querySelector('.pagination__button.next');

prevButton.addEventListener('click', async () => {
  if (variables.currentPage > 1) {
    variables.currentPage -= 1;

    gallery.innerHTML = '';

    const response = await fetchImages(variables.query, variables.currentPage);

    checkLoadMoreButtonVisibility(
      response.totalHits,
      variables.currentPage,
      loadMoreImagesBtn
    );

    renderCards(response.hits, gallery);
    /*     lightBox.refresh(); */
  }

  if (variables.currentPage < variables.pages) {
    nextButton.disabled = false;
  }

  if (variables.currentPage === 1) {
    prevButton.disabled = true;
  }

  renderPaginationButtons(
    variables.pages,
    variables.currentPage,
    variables.totalPageButtons
  );
});

nextButton.addEventListener('click', async () => {
  if (variables.currentPage < variables.pages) {
    variables.currentPage += 1;

    gallery.innerHTML = '';

    const response = await fetchImages(variables.query, variables.currentPage);

    checkLoadMoreButtonVisibility(
      response.totalHits,
      variables.currentPage,
      loadMoreImagesBtn
    );

    renderCards(response.hits, gallery);
    lightBox.refresh();
  }


  console.log(variables.currentPage);
  
  if (variables.currentPage > 1) {
    prevButton.disabled = false;
  }

  if (variables.currentPage === variables.pages) {
    nextButton.disabled = true;
  }

  renderPaginationButtons(
    variables.pages,
    variables.currentPage,
    variables.totalPageButtons
  );
});

function makeTotalPageButtonsArray(totalHits) {
  variables.TOTAL_ITEMS = totalHits;
  variables.pages = Math.ceil(variables.TOTAL_ITEMS / PER_PAGE);

  variables.totalPageButtons = Array.from(
    { length: variables.pages > 7 ? 7 : variables.pages },
    (_, i) => i + 1
  );

  variables.totalPageButtons[variables.totalPageButtons.length - 1] =
    variables.pages;
  if (variables.pages > 7) {
    variables.totalPageButtons[variables.totalPageButtons.length - 2] = '...';
  }

}


function renderPaginationButtons(pages, currentPage, totalPageButtons) {
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
        console.log( currentPage === pageNumber);
        
        

        renderPaginationButtons(
          pages,
          currentPage,
          totalPageButtons
        );
        

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

      const response = await fetchImages(variables.query, currentPage);
      makeTotalPageButtonsArray(response.totalHits);

      checkPaginationVisibility();

      checkLoadMoreButtonVisibility(
        response.totalHits,
        variables.currentPage,
        loadMoreImagesBtn
      );

      gallery.innerHTML = '';
      renderCards(response.hits, gallery);
 /*      lightBox.refresh(); */

      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  });
}

function checkPaginationVisibility() {
  const pagination = document.querySelector('.pagination');
  if (variables.pages > 0) {
    pagination.classList.remove('pagination--hidden');
    renderPaginationButtons(
      variables.pages,
      variables.currentPage,
      variables.totalPageButtons
    );
  } else {
    pagination.classList.add('pagination--hidden');
  }
}

export { makeTotalPageButtonsArray, checkPaginationVisibility };
