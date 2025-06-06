/* script.js */
const API_KEY = '208efbe611ddf35d1e791a016487f9a4'; // Your TMDB API Key
const API_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`;
const MOVIE_DETAILS_URL = `https://api.themoviedb.org/3/movie/`;
const UPCOMING_URL = `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}`;

let ratings = JSON.parse(localStorage.getItem('ratings')) || {};

let myList = JSON.parse(localStorage.getItem('myList')) || [];

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

        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <span>📅 ${movie.release_date || 'Unknown'}</span>
                <span>🎬 Director: ${director}</span>
                <p>${description}</p>
                <span class="providers">${providerText}</span>
                <label>Your Rating:
                    <select onchange="rateMovie(${movie.id}, this.value)">
                        <option value="" ${ratingValue===''?'selected':''}>--</option>
                        <option value="1" ${ratingValue===1?'selected':''}>1</option>
                        <option value="2" ${ratingValue===2?'selected':''}>2</option>
                        <option value="3" ${ratingValue===3?'selected':''}>3</option>
                        <option value="4" ${ratingValue===4?'selected':''}>4</option>
                        <option value="5" ${ratingValue===5?'selected':''}>5</option>
                    </select>
                </label>
                <button onclick="addToMyList(${movie.id}, '${movie.title}', '${movie.poster_path}')">➕ Add to My List</button>
            </div>
        `;
        container.appendChild(movieCard);
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

        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');

        movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <span>📅 ${movie.release_date || 'Unknown'}</span>
                <span>🎬 Director: ${director}</span>
                <p>${description}</p>
                <span class="providers">${providerText}</span>
                <label>Your Rating:
                    <select onchange="rateMovie(${movie.id}, this.value)">
                        <option value="" ${ratingValue===''?'selected':''}>--</option>
                        <option value="1" ${ratingValue===1?'selected':''}>1</option>
                        <option value="2" ${ratingValue===2?'selected':''}>2</option>
                        <option value="3" ${ratingValue===3?'selected':''}>3</option>
                        <option value="4" ${ratingValue===4?'selected':''}>4</option>
                        <option value="5" ${ratingValue===5?'selected':''}>5</option>
                    </select>
                </label>
                <button onclick="addToMyList(${movie.id}, '${movie.title}', '${movie.poster_path}')">➕ Add to My List</button>
            </div>
        `;
        
        moviesList.appendChild(movieCard);
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
        const movieItem = document.createElement('div');
        movieItem.classList.add('movie-card');

        movieItem.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster}" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <label>Your Rating:
                    <select onchange="rateMovie(${movie.id}, this.value)">
                        <option value="" ${ratingValue===''?'selected':''}>--</option>
                        <option value="1" ${ratingValue===1?'selected':''}>1</option>
                        <option value="2" ${ratingValue===2?'selected':''}>2</option>
                        <option value="3" ${ratingValue===3?'selected':''}>3</option>
                        <option value="4" ${ratingValue===4?'selected':''}>4</option>
                        <option value="5" ${ratingValue===5?'selected':''}>5</option>
                    </select>
                </label>
                <button onclick="toggleFavorite(${movie.id})">${movie.isFavorite ? '💔 Unfavorite' : '❤️ Favorite'}</button>
                <button onclick="removeFromMyList(${movie.id})">❌ Remove</button>
            </div>
        `;

        container.appendChild(movieItem);
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
    if (rating) {
        ratings[id] = Number(rating);
    } else {
        delete ratings[id];
    }
    localStorage.setItem('ratings', JSON.stringify(ratings));
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
    }
}
