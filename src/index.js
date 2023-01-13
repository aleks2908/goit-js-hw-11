import axios from 'axios';
import Notiflix from 'notiflix';
// import SimpleLightbox from 'simplelightbox';
// import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
// const loadMoreBtn = document.querySelector('.load-more');
const guard = document.querySelector('.js-guard');

form.addEventListener('submit', onFormSubmit);
// loadMoreBtn.addEventListener('click', goFatch);
let page = 0;
let searchQuerry = '';

const options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};

const observer = new IntersectionObserver(onInfinityLoad, options);

function onFormSubmit(evt) {
  evt.preventDefault();
  searchQuerry = evt.currentTarget.elements.searchQuery.value;
  // loadMoreBtn.hidden = true;
  gallery.innerHTML = '';
  page = 0;
  if (!evt.currentTarget.elements.searchQuery.value.trim()) {
    Notiflix.Notify.failure("You didn't enter anything in the search field.");
    return;
  }

  goFatch();
}

async function goFatch() {
  const BASE_URL = 'https://pixabay.com/api/';
  const MY_KEY = '32804952-bc7fa4c68d10a619b16622bc9';

  page += 1;

  try {
    const resp = await axios.get(
      `${BASE_URL}?key=${MY_KEY}&q=${searchQuerry}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`
    );

    let totalHits = resp.data.totalHits;
    if (totalHits === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    } else if (page === 1) {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    renderMarkup(resp.data.hits);
    observer.observe(guard);
    if (page * 40 >= totalHits) {
      observer.unobserve(guard);
      // loadMoreBtn.hidden = true;
      Notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    console.log(error);
  }
}

function renderMarkup(cards) {
   try {
     let cardsMarkup = cards
       .map(
         ({
           webformatURL,
           largeImageURL,
           tags,
           likes,
           views,
           comments,
           downloads,
         }) => `<div class="photo-card">
<img src="${webformatURL}" alt="${tags}" class="photo" loading="lazy" width=100%/>
  <div class="info">
    <p class="info-item">
      <b>Likes</b><br>${likes}
    </p>
    <p class="info-item">
      <b>Views</b><br>${views}
    </p>
    <p class="info-item">
      <b>Comments</b><br>${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b><br>${downloads}
    </p>
  </div>
</div>`
       )
       .join('');

     gallery.insertAdjacentHTML('beforeend', cardsMarkup);
    //  loadMoreBtn.hidden = false;
   } catch (error) {
     console.log(error);
   }
}


function onInfinityLoad(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      goFatch(observer);
    }
    }
  );
}
