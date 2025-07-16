// TMDb API integration for SeriesHub
const TMDB_API = {
    BASE_URL: 'https://api.themoviedb.org/3',
    API_KEY: '0d0b7ae732c613914eb370d682439b37',
    ENDPOINTS: {
        TV_POPULAR: '/tv/popular',
        TV_TOP_RATED: '/tv/top_rated',
        TV_ON_THE_AIR: '/tv/on_the_air',
        TV_TRENDING: '/trending/tv/week',
        TV_SEARCH: '/search/tv',
        TV_DETAILS: '/tv/',
        TV_EXTERNAL_IDS: '/tv/{id}/external_ids',
        TV_CREDITS: '/tv/{id}/credits',
        TV_SEASON: '/tv/{id}/season/{season_number}',
        TV_PROVIDERS: '/tv/{id}/watch/providers',
        GENRES: '/genre/tv/list'
    }
};

async function tmdbFetch(endpoint, params = {}) {
    const url = new URL(TMDB_API.BASE_URL + endpoint);
    url.searchParams.set('api_key', TMDB_API.API_KEY);
    url.searchParams.set('language', 'it-IT');
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Errore TMDb: ' + res.status);
    return await res.json();
}

// Ottieni tutte le serie popolari (paginazione TMDb: 1-500)
async function getAllShows(page = 1) {
    const data = await tmdbFetch(TMDB_API.ENDPOINTS.TV_POPULAR, { page });
    return data.results;
}

// Nuove uscite/attualmente in onda
async function getOnTheAirShows(page = 1) {
    const data = await tmdbFetch(TMDB_API.ENDPOINTS.TV_ON_THE_AIR, { page });
    return data.results;
}

// Ricerca serie TV
async function searchShows(query, page = 1) {
    const data = await tmdbFetch(TMDB_API.ENDPOINTS.TV_SEARCH, { query, page });
    return data.results;
}

// Dettagli serie TV
async function getShowDetails(id) {
    return await tmdbFetch(TMDB_API.ENDPOINTS.TV_DETAILS + id);
}

// Cast e crew
async function getShowCast(id) {
    const data = await tmdbFetch(TMDB_API.ENDPOINTS.TV_CREDITS.replace('{id}', id));
    return data.cast;
}

// Stagioni
async function getShowSeasons(id) {
    const details = await getShowDetails(id);
    return details.seasons || [];
}

// Generi
async function getGenres() {
    const data = await tmdbFetch(TMDB_API.ENDPOINTS.GENRES);
    return data.genres;
}

// Providers (piattaforme streaming)
async function getShowProviders(id) {
    const data = await tmdbFetch(TMDB_API.ENDPOINTS.TV_PROVIDERS.replace('{id}', id));
    return data.results?.IT || null;
}

// Trending (tendenza)
async function getTrendingShows(page = 1) {
    const data = await tmdbFetch(TMDB_API.ENDPOINTS.TV_TRENDING, { page });
    return data.results;
}

// Recupera gli external_ids (tra cui Netflix)
async function getExternalIds(id) {
    return await tmdbFetch(TMDB_API.ENDPOINTS.TV_EXTERNAL_IDS.replace('{id}', id));
}

// Ottieni serie TV per genere (usando /discover/tv). Se genreId è null, mostra tutte le popolari.
async function getShowsByGenre(genreId, page = 1) {
    const params = {
        sort_by: 'popularity.desc',
        page
    };
    if (genreId) params.with_genres = genreId;
    const data = await tmdbFetch('/discover/tv', params);
    return data.results;
}

// Funzione per aggiornare il catalogo (unisce tutte le trending e tutte le popolari, rimuove duplicati e ordina per popolarità)
async function updateCatalog() {
        let allShows = [];
    // Trending (tendenza, tutte le pagine)
    for (let page = 1; page <= 500; page++) {
        const trending = await getTrendingShows(page);
        allShows = allShows.concat(trending);
            }
    // Popolari (tutte le pagine)
    for (let page = 1; page <= 500; page++) {
        const shows = await getAllShows(page);
            allShows = allShows.concat(shows);
    }
    // Rimuovi duplicati per id
    const unique = {};
    allShows.forEach(show => { unique[show.id] = show; });
    // Ordina per popolarità decrescente
    return Object.values(unique).sort((a, b) => b.popularity - a.popularity);
}

// Ottieni solo le nuove uscite (oggi) da TMDB
async function getLatestShows(page = 1) {
    const data = await tmdbFetch('/tv/airing_today', { page });
    return data.results;
}

// Ottieni le serie TV più popolari in assoluto (senza filtro genere)
async function getMostPopularShows(page = 1) {
    const data = await tmdbFetch('/discover/tv', {
        sort_by: 'popularity.desc',
        page
    });
    return data.results;
}

// Ottieni le serie TV uscite negli ultimi 30 giorni
async function getRecentShows(page = 1) {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(today.getDate() - 30);
    const to = today.toISOString().slice(0, 10);
    const from = lastMonth.toISOString().slice(0, 10);
    const data = await tmdbFetch('/discover/tv', {
        'first_air_date.gte': from,
        'first_air_date.lte': to,
        sort_by: 'popularity.desc',
        page
    });
    return data.results;
}

window.TMDBAPI = {
    getAllShows,
    getTrendingShows,
    searchShows,
    getShowDetails,
    getExternalIds,
    getShowCast,
    getShowSeasons,
    getGenres,
    getShowProviders,
    updateCatalog,
    getOnTheAirShows,
    getShowsByGenre,
    getMostPopularShows,
    getLatestShows,
    getRecentShows
};