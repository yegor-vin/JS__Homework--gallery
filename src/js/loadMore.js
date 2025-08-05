function checkLoadMoreButtonVisibility(totalImages, currentPage, loadMoreImagesBtn) {
  if (totalImages <= currentPage * 40) {
    loadMoreImagesBtn.style.display = 'none';

    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  } else {
    loadMoreImagesBtn.style.display = 'block';
  }
}

export { checkLoadMoreButtonVisibility };
