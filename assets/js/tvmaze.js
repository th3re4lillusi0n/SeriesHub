// Configurazione TVMaze
const TVMAZE_API = {
    BASE_URL: 'https://api.tvmaze.com',
    ENDPOINTS: {
        SHOWS: '/shows',
        SEARCH: '/search/shows',
        SINGLE_SHOW: '/shows/',
        SHOW_EPISODES: '/shows/{id}/episodes',
        SHOW_CAST: '/shows/{id}/cast',
        SHOW_SEASONS: '/shows/{id}/seasons'
    }
};

// Cache per le richieste
const cache = {
    shows: new Map(),
    episodes: new Map(),
    cast: new Map(),
    lastUpdate: null,
    CACHE_DURATION: 24 * 60 * 60 * 1000 // 24 ore
};

// Funzione per mostrare il messaggio di caricamento
function showLoadingMessage() {
    // Verifica se il messaggio è già presente
    if (document.getElementById('loading-message')) {
        return;
    }
    
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-message';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        z-index: 9999;
    `;
    loadingDiv.innerHTML = `
        <h3>Caricamento del catalogo in corso...</h3>
        <p>Attendi qualche istante per una migliore esperienza.</p>
        <div class="loading-spinner"></div>
    `;
    document.body.appendChild(loadingDiv);
}

// Funzione per rimuovere il messaggio di caricamento
function hideLoadingMessage() {
    const loadingDiv = document.getElementById('loading-message');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Funzione per gestire le richieste API
async function fetchFromTVMaze(endpoint, params = {}) {
    try {
        const url = new URL(`${TVMAZE_API.BASE_URL}${endpoint}`);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        
        console.log('Fetching from:', url.toString());
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Data received:', data.length || 'single item');
        return data;
    } catch (error) {
        console.error('Error fetching from TVMaze:', error);
        throw error;
    }
}

// Funzione per ottenere tutte le serie TV
async function getAllShows(page = 0) {
    try {
        const shows = await fetchFromTVMaze(TVMAZE_API.ENDPOINTS.SHOWS, { page });
        return shows;
    } catch (error) {
        console.error('Error fetching shows:', error);
        return [];
    }
}

// Funzione per cercare serie TV
async function searchShows(query) {
    try {
        const results = await fetchFromTVMaze(TVMAZE_API.ENDPOINTS.SEARCH, { q: query });
        return results.map(result => result.show);
    } catch (error) {
        console.error('Error searching shows:', error);
        return [];
    }
}

// Funzione per ottenere i dettagli di una serie specifica
async function getShowDetails(showId) {
    try {
        const show = await fetchFromTVMaze(`${TVMAZE_API.ENDPOINTS.SINGLE_SHOW}${showId}`);
        return show;
    } catch (error) {
        console.error('Error fetching show details:', error);
        return null;
    }
}

// Funzione per ottenere gli episodi di una serie
async function getShowEpisodes(showId) {
    try {
        const episodes = await fetchFromTVMaze(
            TVMAZE_API.ENDPOINTS.SHOW_EPISODES.replace('{id}', showId)
        );
        return episodes;
    } catch (error) {
        console.error('Error fetching episodes:', error);
        return [];
    }
}

// Funzione per ottenere il cast di una serie
async function getShowCast(showId) {
    try {
        const cast = await fetchFromTVMaze(
            TVMAZE_API.ENDPOINTS.SHOW_CAST.replace('{id}', showId)
        );
        return cast;
    } catch (error) {
        console.error('Error fetching cast:', error);
        return [];
    }
}

// Funzione per ottenere le stagioni di una serie
async function getShowSeasons(showId) {
    try {
        const seasons = await fetchFromTVMaze(
            TVMAZE_API.ENDPOINTS.SHOW_SEASONS.replace('{id}', showId)
        );
        return seasons;
    } catch (error) {
        console.error('Error fetching seasons:', error);
        return [];
    }
}

// Funzione per aggiornare il catalogo
async function updateCatalog() {
    try {
        // Verifica se c'è già un caricamento in corso
        if (document.getElementById('loading-message')) {
            return Array.from(cache.shows.values());
        }
        
        showLoadingMessage(); // Mostra il messaggio di caricamento
        
        const currentTime = Date.now();
        console.log('Current time:', currentTime);
        console.log('Last update:', cache.lastUpdate);
        console.log('Cache duration:', cache.CACHE_DURATION);
        
        if (cache.lastUpdate && (currentTime - cache.lastUpdate) < cache.CACHE_DURATION) {
            console.log('Using cached data');
            const cachedShows = Array.from(cache.shows.values());
            console.log('Cached shows count:', cachedShows.length);
            hideLoadingMessage(); // Nascondi il messaggio se usiamo la cache
            return cachedShows;
        }

        console.log('Updating catalog...');
        let page = 0;
        let allShows = [];
        let hasMore = true;
        let retryCount = 0;
        const MAX_RETRIES = 3;

        while (hasMore && retryCount < MAX_RETRIES) {
            try {
                console.log(`Fetching page ${page}...`);
                const shows = await getAllShows(page);
                console.log(`Received ${shows.length} shows for page ${page}`);
                
                if (shows.length === 0) {
                    console.log('No more shows to fetch');
                    hasMore = false;
                } else {
                    // Filtra solo le serie TV (esclude i film)
                    const seriesOnly = shows.filter(show => {
                        // Verifica che sia una serie TV basandosi su vari criteri
                        return show.type === 'Scripted' && // Serie sceneggiate
                               show.status !== 'Movie' && // Non è un film
                               (show.runtime || 0) <= 120 && // Durata tipica di un episodio (non di un film)
                               !show.name.toLowerCase().includes('movie') && // Nome non contiene "movie"
                               show._links && show._links.previousepisode; // Ha episodi precedenti (è una serie)
                    });

                    allShows = allShows.concat(seriesOnly);
                    console.log(`Total series so far: ${allShows.length}`);
                    page++;
                    retryCount = 0;
                }
            } catch (error) {
                console.error(`Error fetching page ${page}:`, error);
                retryCount++;
                if (retryCount >= MAX_RETRIES) {
                    console.error('Max retries reached, stopping catalog update');
                    break;
                }
                console.log(`Retrying in ${retryCount} seconds...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
        }

        if (allShows.length > 0) {
            console.log(`Caching ${allShows.length} series`);
            cache.shows = new Map(allShows.map(show => [show.id, show]));
            cache.lastUpdate = currentTime;
            console.log('Catalog updated successfully');
            hideLoadingMessage(); // Nascondi il messaggio dopo il caricamento
            return allShows;
        } else {
            hideLoadingMessage(); // Nascondi il messaggio in caso di errore
            throw new Error('No series were fetched successfully');
        }
    } catch (error) {
        hideLoadingMessage(); // Nascondi il messaggio in caso di errore
        console.error('Error updating catalog:', error);
        throw error;
    }
}

// Esporta le funzioni
window.TVMazeAPI = {
    getAllShows,
    searchShows,
    getShowDetails,
    getShowEpisodes,
    getShowCast,
    getShowSeasons,
    updateCatalog
};

console.log('TVMazeAPI initialized');

// Aggiungi stile CSS per lo spinner
const style = document.createElement('style');
style.textContent = `
    .loading-spinner {
        width: 40px;
        height: 40px;
        margin: 20px auto;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style); 