import axios from 'axios';


const BASE_URL = 'https://pixabay.com/api';
const API_KEY = '50096548-9b55e248e724d91cc3eb8f4be';

axios.defaults.baseURL = BASE_URL;

export async function fetchImages(query, currentPage = 1) {
  console.log(currentPage);
  
  const params = {
    key: API_KEY,

    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: currentPage,
    per_page: 40,
  };

  if (query) {
    params.q = query;
  }

  const response = await axios.get(`/`, { params });

  return response.data;
}
