/* script.js */
const API_KEY = '208efbe611ddf35d1e791a016487f9a4'; // Your TMDB API Key
const API_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`;
const MOVIE_DETAILS_URL = `https://api.themoviedb.org/3/movie/`;

document.getElementById('search').addEventListener('input', async function () {
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

async function displayMovies(movies) {
    const moviesList = document.getElementById('movies');
    moviesList.innerHTML = '';
    
    if (movies.length === 0) {
        moviesList.innerHTML = '<p>No results found.</p>';
        return;
    }

    for (const movie of movies) {
        const movieDetails = await fetchMovieDetails(movie.id);
        
        const director = movieDetails?.credits?.crew?.find(person => person.job === 'Director')?.name || 'Unknown';
        const description = movieDetails?.overview || 'No description available.';
        
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        
        movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <span>📅 ${movie.release_date || 'Unknown'}</span>
                <span>🧑‍🎨 Director: ${director}</span>
                <p>${description}</p>
            </div>
        `;
        
        moviesList.appendChild(movieCard);
    }
}