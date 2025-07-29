export function renderCards(imagesData, gallery) {
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
}
