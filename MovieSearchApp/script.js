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
            `<button onclick="addToMyList(${movie.id}, '${movie.title}', '${movie.poster_path}')">➕ Add to My List</button>`
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
            `<button onclick="addToMyList(${movie.id}, '${movie.title}', '${movie.poster_path}')">➕ Add to My List</button>`
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
            `<button onclick="addToMyList(${movie.id}, '${movie.title}', '${movie.poster_path}')">➕ Add to My List</button>`
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
