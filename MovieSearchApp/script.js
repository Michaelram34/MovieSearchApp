/* script.js */
const API_KEY = '208efbe611ddf35d1e791a016487f9a4'; // Your TMDB API Key
const API_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`;
const MOVIE_DETAILS_URL = `https://api.themoviedb.org/3/movie/`;
const UPCOMING_URL = `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}`;
const TRENDING_URL = `https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}`;

let ratings = JSON.parse(localStorage.getItem('ratings')) || {};

let myList = JSON.parse(localStorage.getItem('myList')) || [];

function ratingStars(id, ratingValue) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        const filled = i <= ratingValue;
        stars += `<span class="star ${filled ? 'filled' : ''}" onclick="rateMovie(${id}, ${i})">${filled ? '★' : '☆'}</span>`;
    }
    return `<div class="rating" id="rating-${id}">${stars}</div>`;
}

function createMovieCard(movie, director, description, providerText, ratingValue, buttonsHtml) {
    const imgPath = movie.poster_path || movie.poster || '';
    const card = document.createElement('div');
    card.classList.add('movie-card');
    card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${imgPath}" alt="${movie.title}">
        <div class="movie-info">
            <h3>${movie.title}</h3>
            <span>📅 ${movie.release_date || 'Unknown'}</span>
            ${providerText ? `<span class="providers">${providerText}</span>` : ''}
            ${ratingStars(movie.id, ratingValue)}
            ${buttonsHtml}
        </div>
    `;
    return card;
}

document.getElementById('search')?.addEventListener('input', async function () {
    const query = this.value.trim();
    if (query.length > 2) {
        fetchMovies(query);
    }
});

async function fetchMovies(query) {
    try {
        const response = await fetch(API_URL + query);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

async function fetchMovieDetails(movieId) {
    try {
        const response = await fetch(`${MOVIE_DETAILS_URL}${movieId}?api_key=${API_KEY}&append_to_response=credits`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
}

async function fetchWatchProviders(movieId) {
    try {
        const response = await fetch(`${MOVIE_DETAILS_URL}${movieId}/watch/providers?api_key=${API_KEY}`);
        const data = await response.json();
        const us = data.results?.US;
        if (us && us.flatrate) {
            return us.flatrate.map(p => p.provider_name);
        }
        return [];
    } catch (error) {
        console.error('Error fetching watch providers:', error);
        return [];
    }
}

async function fetchUpcomingMovies() {
    try {
        const response = await fetch(UPCOMING_URL);
        const data = await response.json();
        displayUpcomingMovies(data.results);
    } catch (error) {
        console.error('Error fetching upcoming movies:', error);
    }
}

async function fetchTrendingMovies() {
    try {
        const response = await fetch(TRENDING_URL);
        const data = await response.json();
        displayTrendingMovies(data.results.slice(0, 6));
    } catch (error) {
        console.error('Error fetching trending movies:', error);
    }
}

async function displayUpcomingMovies(movies) {
    const container = document.getElementById('upcoming-movies');
    container.innerHTML = '';

    if (!movies || movies.length === 0) {
        container.innerHTML = '<p>No upcoming movies.</p>';
        return;
    }

    for (const movie of movies) {
        const movieDetails = await fetchMovieDetails(movie.id);
        const providers = await fetchWatchProviders(movie.id);

        const director = movieDetails?.credits?.crew?.find(person => person.job === 'Director')?.name || 'Unknown';
        const description = movieDetails?.overview || 'No description available.';
        const ratingValue = ratings[movie.id] || '';
        const providerText = providers.length ? `Available on: ${providers.join(', ')}` : '';

        const card = createMovieCard(
            movie,
            director,
            description,
            providerText,
            ratingValue,
            `<button onclick="addToMyList(${movie.id}, '${movie.title}', '${movie.poster_path}')">➕ Add to My List</button>\n            <button onclick="showDetails(${movie.id})">ℹ️ More Info</button>`
        );
        container.appendChild(card);
    }
}

async function displayTrendingMovies(movies) {
    const container = document.getElementById('trending-movies');
    if (!container) return;
    container.innerHTML = '';

    if (!movies || movies.length === 0) {
        container.innerHTML = '<p>No trending movies right now.</p>';
        return;
    }

    for (const movie of movies) {
        const movieDetails = await fetchMovieDetails(movie.id);
        const providers = await fetchWatchProviders(movie.id);

        const director = movieDetails?.credits?.crew?.find(person => person.job === 'Director')?.name || 'Unknown';
        const description = movieDetails?.overview || 'No description available.';
        const ratingValue = ratings[movie.id] || '';
        const providerText = providers.length ? `Available on: ${providers.join(', ')}` : '';

        const card = createMovieCard(
            movie,
            director,
            description,
            providerText,
            ratingValue,
            `<button onclick="addToMyList(${movie.id}, '${movie.title}', '${movie.poster_path}')">➕ Add to My List</button>\n            <button onclick="showDetails(${movie.id})">ℹ️ More Info</button>`
        );
        container.appendChild(card);
    }
}

async function displayMovies(movies) {
    const moviesList = document.getElementById('movies');
    moviesList.innerHTML = '';
    
    if (movies.length === 0) {
        moviesList.innerHTML = '<p>No results found.</p>';
        return;
    }

    for (const movie of movies) {
        const movieDetails = await fetchMovieDetails(movie.id);
        const providers = await fetchWatchProviders(movie.id);

        const director = movieDetails?.credits?.crew?.find(person => person.job === 'Director')?.name || 'Unknown';
        const description = movieDetails?.overview || 'No description available.';
        const ratingValue = ratings[movie.id] || '';
        const providerText = providers.length ? `Available on: ${providers.join(', ')}` : '';

        const card = createMovieCard(
            movie,
            director,
            description,
            providerText,
            ratingValue,
            `<button onclick="addToMyList(${movie.id}, '${movie.title}', '${movie.poster_path}')">➕ Add to My List</button>\n            <button onclick="showDetails(${movie.id})">ℹ️ More Info</button>`
        );

        moviesList.appendChild(card);
    }
}

function addToMyList(id, title, poster) {
    if (!myList.some(movie => movie.id === id)) {
        myList.push({ id, title, poster, isFavorite: false });
        localStorage.setItem('myList', JSON.stringify(myList));
        alert(`${title} added to My List!`);
    } else {
        alert(`${title} is already in My List!`);
    }
}

function displayMyList() {
    const watchContainer = document.getElementById('to-watch');
    const favoriteContainer = document.getElementById('favorites');
    watchContainer.innerHTML = '';
    favoriteContainer.innerHTML = '';

    if (myList.length === 0) {
        watchContainer.innerHTML = '<p>Your list is empty.</p>';
        favoriteContainer.innerHTML = '';
        return;
    }

    myList.forEach(movie => {
        const container = movie.isFavorite ? favoriteContainer : watchContainer;
        const ratingValue = ratings[movie.id] || '';

        const buttons = `
            <button onclick="toggleFavorite(${movie.id})">${movie.isFavorite ? '💔 Unfavorite' : '❤️ Favorite'}</button>
            <button onclick="removeFromMyList(${movie.id})">❌ Remove</button>
            <button onclick="showDetails(${movie.id})">ℹ️ More Info</button>
        `;
        const card = createMovieCard(
            movie,
            'Unknown',
            '',
            '',
            ratingValue,
            buttons
        );

        container.appendChild(card);
    });
}

function removeFromMyList(id) {
    myList = myList.filter(movie => movie.id !== id);
    localStorage.setItem('myList', JSON.stringify(myList));
    displayMyList();
}

function toggleFavorite(id) {
    const movie = myList.find(m => m.id === id);
    if (movie) {
        movie.isFavorite = !movie.isFavorite;
        localStorage.setItem('myList', JSON.stringify(myList));
        displayMyList();
    }
}

function rateMovie(id, rating) {
    rating = Number(rating);
    if (ratings[id] === rating) {
        delete ratings[id];
    } else {
        ratings[id] = rating;
    }
    localStorage.setItem('ratings', JSON.stringify(ratings));
    updateStarDisplay(id);
}

function updateStarDisplay(id) {
    const ratingValue = ratings[id] || 0;
    const container = document.getElementById(`rating-${id}`);
    if (!container) return;
    const stars = container.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < ratingValue) {
            star.textContent = '★';
            star.classList.add('filled');
        } else {
            star.textContent = '☆';
            star.classList.remove('filled');
        }
    });
}

async function showDetails(movieId) {
    const modal = document.getElementById('details-modal');
    const modalDetails = document.getElementById('modal-details');
    modalDetails.innerHTML = '<p>Loading...</p>';
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');

    const movieDetails = await fetchMovieDetails(movieId);
    if (!movieDetails) {
        modalDetails.innerHTML = '<p>Error loading details.</p>';
        return;
    }

    const providers = await fetchWatchProviders(movieId);
    const director = movieDetails.credits?.crew?.find(p => p.job === 'Director')?.name || 'Unknown';
    const cast = movieDetails.credits?.cast?.slice(0, 5).map(c => c.name).join(', ') || 'Unknown';
    const ratingValue = ratings[movieId] || 0;
    const inList = myList.some(m => m.id === movieId);
    const movie = myList.find(m => m.id === movieId);
    const isFav = movie?.isFavorite;

    const listButton = inList
        ? `<button onclick="removeFromMyList(${movieId}); showDetails(${movieId})">❌ Remove from My List</button>`
        : `<button onclick="addToMyList(${movieId}, '${movieDetails.title}', '${movieDetails.poster_path}'); showDetails(${movieId})">➕ Add to My List</button>`;

    const favButton = inList
        ? `<button onclick="toggleFavorite(${movieId}); showDetails(${movieId})">${isFav ? '💔 Unfavorite' : '❤️ Favorite'}</button>`
        : '';

    modalDetails.innerHTML = `
        <h2>${movieDetails.title}</h2>
        <img src="https://image.tmdb.org/t/p/w500${movieDetails.poster_path}" alt="${movieDetails.title}">
        <p><strong>Release Date:</strong> ${movieDetails.release_date || 'Unknown'}</p>
        <p><strong>Runtime:</strong> ${movieDetails.runtime ? movieDetails.runtime + ' min' : 'Unknown'}</p>
        <p><strong>Director:</strong> ${director}</p>
        <p><strong>Cast:</strong> ${cast}</p>
        <p>${movieDetails.overview || 'No description available.'}</p>
        ${providers.length ? `<p><strong>Available on:</strong> ${providers.join(', ')}</p>` : ''}
        <div class="modal-buttons">${listButton} ${favButton}</div>
        ${ratingStars(movieId, ratingValue)}
    `;
}

function closeModal() {
    document.getElementById('details-modal').classList.add('hidden');
    document.body.classList.remove('modal-open');
}

function navigateTo(page) {
    document.getElementById('start-page').classList.add('hidden');
    document.getElementById('search-page').classList.add('hidden');
    document.getElementById('my-list-page').classList.add('hidden');
    document.getElementById('upcoming-page').classList.add('hidden');

    if (page === 'search') {
        document.getElementById('search-page').classList.remove('hidden');
    } else if (page === 'my-list') {
        document.getElementById('my-list-page').classList.remove('hidden');
        displayMyList();
    } else if (page === 'upcoming') {
        document.getElementById('upcoming-page').classList.remove('hidden');
        fetchUpcomingMovies();
    } else {
        document.getElementById('start-page').classList.remove('hidden');
        fetchTrendingMovies();
    }
}

// Initial load
fetchTrendingMovies();

// Modal interactions
document.getElementById('details-modal').addEventListener('click', (e) => {
    if (e.target.id === 'details-modal') {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});
