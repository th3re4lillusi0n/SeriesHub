// Configurazione base
const config = {
    itemsPerPage: 20,
    debounceDelay: 300,
    loadingThreshold: 0.8 // Soglia per il caricamento progressivo (80% dello scroll)
};

// Assicurato che const config sia dichiarato una sola volta

// Stato dell'interfaccia
const uiState = {
    shows: [],
    currentPage: 1,
    filters: {
        search: '',
        type: '',
        genre: '',
        status: '',
        language: '',
        rating: 0,
        year: '',
        lang: ''
    }
};

// Security utility functions
const security = {
    sanitizeInput: function(input) {
        if (typeof input !== 'string') return '';
        return input.replace(/[&<>"']/g, function(match) {
            const escape = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };
            return escape[match];
        });
    },
    
    secureStorage: {
        get: function(key) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                console.error('Error accessing localStorage:', e);
                return null;
            }
        },
        set: function(key, value) {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                console.error('Error setting localStorage:', e);
            }
        }
    }
};

// Funzioni di utilità
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Gestione del tema
function initializeTheme() {
    const savedTheme = security.secureStorage.get('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    security.secureStorage.set('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const lightIcon = document.querySelector('.theme-toggle-light');
    const darkIcon = document.querySelector('.theme-toggle-dark');
    if (lightIcon && darkIcon) {
        lightIcon.style.display = theme === 'light' ? 'none' : 'block';
        darkIcon.style.display = theme === 'dark' ? 'none' : 'block';
    }
}

// Stato avanzato per caricamento progressivo
const PAGE_SIZE = 20;
const TOTAL_PAGES = 1000; // 500 trending + 500 popolari
let loadedPages = 10; // quante pagine sono già caricate subito
let allShows = [];
let loadingAll = false;

// --- MAIN PAGE: SOLO SERIE PIÙ FAMOSE/TRENDING ORDINATE PER POPOLARITÀ ---
async function loadSeries() {
    try {
        showLoadingBar(0, TOTAL_PAGES);
        allShows = [];
        // Carica subito le prime 10 pagine (trending + popolari)
        for (let page = 1; page <= 10; page++) {
            const trending = await TMDBAPI.getTrendingShows(page);
            const popular = await TMDBAPI.getAllShows(page);
            allShows = allShows.concat(trending, popular);
            showLoadingBar(page, TOTAL_PAGES);
        }
        hideLoadingBar();
        loadedPages = 10;
        setAndSortShows(allShows); // deduplica e ordina per popolarità
        updateFilterOptions(uiState.shows);
        renderSeries(uiState.shows);
        updatePagination(TOTAL_PAGES * PAGE_SIZE);
        // Carica il resto in background
        if (!loadingAll) {
            loadingAll = true;
            setTimeout(loadAllPagesInBackground, 100);
        }
    } catch (error) {
        hideLoadingBar();
        console.error('Error loading series:', error);
        showError('Errore nel caricamento delle serie TV: ' + error.message);
    }
}

// Caricamento background di tutte le pagine (senza barra)
async function loadAllPagesInBackground() {
    for (let page = 11; page <= 500; page++) {
        const trending = await TMDBAPI.getTrendingShows(page);
        const popular = await TMDBAPI.getAllShows(page);
        allShows = allShows.concat(trending, popular);
        loadedPages = page;
    }
    setAndSortShows(allShows);
    updateFilterOptions(uiState.shows);
    renderSeries(uiState.shows);
    updatePagination(TOTAL_PAGES * PAGE_SIZE);
}

// Funzione per deduplicare e ordinare per popolarità
function dedupeAndSort(shows) {
    const unique = {};
    shows.forEach(show => { if (show && show.id) unique[show.id] = show; });
    return Object.values(unique).sort((a, b) => b.popularity - a.popularity);
}

// Traduzioni complete per TVMaze
const translations = {
    // Stati delle serie
    status: {
        'Running': 'In corso',
        'Ended': 'Terminata',
        'To Be Determined': 'Da determinare',
        'In Development': 'In sviluppo',
        'Canceled': 'Cancellata',
        'Pilot': 'Pilot'
    },
    
    // Generi
    genres: {
        'Action': 'Azione',
        'Adventure': 'Avventura',
        'Animation': 'Animazione',
        'Anime': 'Anime',
        'Comedy': 'Commedia',
        'Crime': 'Crime',
        'Documentary': 'Documentario',
        'Drama': 'Dramma',
        'Family': 'Famiglia',
        'Fantasy': 'Fantasy',
        'Game Show': 'Game Show',
        'History': 'Storico',
        'Horror': 'Horror',
        'Kids': 'Bambini',
        'Music': 'Musica',
        'Mystery': 'Mistero',
        'News': 'Notizie',
        'Reality': 'Reality',
        'Romance': 'Romantico',
        'Science-Fiction': 'Fantascienza',
        'Soap': 'Soap Opera',
        'Sports': 'Sport',
        'Supernatural': 'Soprannaturale',
        'Talk Show': 'Talk Show',
        'Thriller': 'Thriller',
        'War': 'Guerra',
        'Western': 'Western'
    },
    
    // Messaggi di sistema
    messages: {
        'loading': 'Caricamento del catalogo in corso...',
        'noResults': 'Nessun risultato trovato',
        'error': 'Si è verificato un errore',
        'clearFilters': 'Cancella filtri',
        'allGenres': 'Tutti i generi',
        'allStatus': 'Tutti gli stati',
        'allYears': 'Tutti gli anni',
        'allRatings': 'Tutte le valutazioni',
        'streaming': 'Streaming',
        'rent': 'Noleggio',
        'buy': 'Acquisto',
        'whereToWatch': 'Dove guardare',
        'plot': 'Trama',
        'rating': 'Valutazione',
        'premiered': 'Prima TV',
        'status': 'Stato',
        'genres': 'Generi',
        'noStreamingInfo': 'Informazioni sulla disponibilità non disponibili'
    }
};

// --- FILTRI ADATTATI E MIGLIORATI ---
function updateFilterOptions(shows) {
    // Raccogli tutti i generi unici (ID)
    const genreIds = new Set();
    const years = new Set();
    const langs = new Set();
    shows.forEach(show => {
        if (show.genre_ids && Array.isArray(show.genre_ids)) {
            show.genre_ids.forEach(id => genreIds.add(id));
        }
        if (show.first_air_date) {
            years.add(show.first_air_date.slice(0, 4));
        }
        if (show.original_language) {
            langs.add(show.original_language);
        }
    });
    const genreOptions = Array.from(genreIds)
        .filter(id => typeof id === 'number' || !isNaN(Number(id)))
        .map(id => ({ id, name: tmdbGenres[id] ? String(tmdbGenres[id]) : `Genere #${id}` }))
        .sort((a, b) => a.name.localeCompare(b.name));
    updateGenreSelect('genreFilter', genreOptions);
    updateFilterSelect('yearFilter', Array.from(years).sort((a, b) => b - a));
    updateFilterSelect('langFilter', Array.from(langs).sort());
}

function updateFilterSelect(id, options, translations = null) {
    const select = document.getElementById(id);
    if (select) {
        const currentValue = select.value;
        let defaultOption = '';
        
        switch(id) {
            case 'genreFilter':
                defaultOption = 'Tutti i generi';
                break;
            case 'statusFilter':
                defaultOption = 'Tutti gli stati';
                break;
            case 'yearFilter':
                defaultOption = 'Tutti gli anni';
                break;
            default:
                defaultOption = 'Tutti';
        }
        
        select.innerHTML = `<option value="">${defaultOption}</option>` +
            options.map(option => {
                const displayValue = translations ? (translations[option] || option) : option;
                return `<option value="${option}" ${option === currentValue ? 'selected' : ''}>
                    ${displayValue}
                </option>`;
            }).join('');
    }
}

function normalizeString(str) {
    return str.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Rimuove caratteri speciali
        .replace(/\s+/g, ' ') // Normalizza gli spazi
        .trim();
}

function getAcronym(str) {
    return str.split(/\s+/).map(word => word[0]).join('').toLowerCase();
}

function calculateLevenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
        } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

function calculateSimilarity(str1, str2) {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1.0;
    const distance = calculateLevenshteinDistance(str1, str2);
    return 1 - (distance / maxLength);
}

// --- FILTRAGGIO AVANZATO ---
const TOP_TITLES = [
  'Stranger Things',
  'Arcane',
  'Loki',
  'Breaking Bad',
  'Game of Thrones',
  'The Witcher',
  'The Mandalorian',
  'The Boys',
  'La Casa di Carta',
  'Dark',
  'The Crown',
  'Peaky Blinders',
  'Squid Game',
  'The Last of Us',
  'Wednesday',
  'House of the Dragon',
  'The Umbrella Academy',
  'Better Call Saul',
  'Black Mirror',
  'Westworld',
  'The Queen\'s Gambit',
  'Lost',
  'Sherlock',
  'Friends',
  'How I Met Your Mother',
  'The Office',
  'Prison Break',
  'Vikings',
  'Narcos',
  'Dexter',
  'True Detective',
  'Fargo',
  'Chernobyl',
  'Mindhunter',
  'Stranger',
  'The Handmaid\'s Tale',
  'Ozark',
  'Succession',
  'The Expanse',
  'Rick and Morty',
  'BoJack Horseman',
  'The Good Place',
  'Brooklyn Nine-Nine',
  'The Big Bang Theory',
  'Modern Family',
  'Gomorra',
  'Romanzo Criminale',
  'Suburra',
  'SKAM Italia',
  'Mare Fuori'
];

function filterSeries(series) {
    const searchTerm = uiState.filters.search.toLowerCase();
    const normalizedSearchTerm = normalizeString(searchTerm);
    const searchTermWords = normalizedSearchTerm.split(' ').filter(word => word.length > 1);
    const searchAcronym = getAcronym(uiState.filters.search);
    const selectedGenre = uiState.filters.genre;
    const selectedYear = uiState.filters.year;
    const selectedRating = parseFloat(uiState.filters.rating) || 0;
    const selectedLang = uiState.filters.lang || '';
    const onlyHighRated = document.getElementById('onlyHighRated')?.checked;
    // Filtro avanzato
    let filtered = series.filter(show => {
        // Ricerca testuale
        const normalizedName = normalizeString(show.name || show.title || '');
        const matchesSearch = !searchTerm || normalizedName.includes(normalizedSearchTerm) ||
            (searchAcronym.length > 1 && getAcronym(show.name || show.title || '') === searchAcronym) ||
            searchTermWords.some(word => normalizedName.includes(word));
        // Genere
        const matchesGenre = !selectedGenre || (show.genre_ids && show.genre_ids.includes(Number(selectedGenre)));
        // Anno
        const matchesYear = !selectedYear || (show.first_air_date && show.first_air_date.startsWith(selectedYear));
        // Rating
        const matchesRating = !selectedRating || (show.vote_average && show.vote_average >= selectedRating);
        // Lingua
        const matchesLang = !selectedLang || (show.original_language === selectedLang);
        // Solo serie top
        const matchesTop = !onlyHighRated || (
            show.vote_average >= 7 &&
            show.vote_count >= 5000 &&
            show.poster_path &&
            show.popularity > 100
        );
        return matchesSearch && matchesGenre && matchesYear && matchesRating && matchesLang && matchesTop;
    });
    // Priorità: metti sempre in cima le serie "top" se presenti
    const topSeries = [];
    const rest = [];
    filtered.forEach(show => {
        const name = (show.name || show.title || '').toLowerCase();
        if (TOP_TITLES.some(t => name === t.toLowerCase())) {
            topSeries.push(show);
        } else {
            rest.push(show);
            }
    });
    // Ordina le top per popolarità, poi le altre
    topSeries.sort((a, b) => b.popularity - a.popularity);
    rest.sort((a, b) => b.popularity - a.popularity);
    return [...topSeries, ...rest];
}

function clearFilters() {
    // Reset all filter inputs
    document.getElementById('searchInput').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('genreFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('ratingFilter').value = '0';
    document.getElementById('yearFilter').value = '';
    document.getElementById('langFilter').value = '';
    document.getElementById('onlyHighRated').checked = false; // Reset checkbox

    // Ripopola i select con tutte le opzioni e default
    updateFilterOptions(uiState.shows);

    // Aggiorna lo stato dei filtri leggendo dagli input
    uiState.filters = {
        search: document.getElementById('searchInput').value,
        type: document.getElementById('typeFilter').value,
        genre: document.getElementById('genreFilter').value,
        status: document.getElementById('statusFilter').value,
        rating: document.getElementById('ratingFilter').value,
        year: document.getElementById('yearFilter').value,
        lang: document.getElementById('langFilter').value
    };

    // Torna sempre alla prima pagina
    uiState.currentPage = 1;

    // Re-render the series
    renderSeries(uiState.shows);
}
// Rendi la funzione clearFilters globale
window.clearFilters = clearFilters;

// Mappa dei generi TMDb (può essere aggiornata dinamicamente)
const tmdbGenres = {
    10759: 'Action & Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    10762: 'Kids',
    9648: 'Mystery',
    10763: 'News',
    10764: 'Reality',
    10765: 'Sci-Fi & Fantasy',
    10766: 'Soap',
    10767: 'Talk',
    10768: 'War & Politics',
    37: 'Western'
};

function truncate(str, n) {
    return str && str.length > n ? str.substr(0, n - 1) + '…' : str;
}

// Modifica getProviders per restituire logo+link
async function getProviders(showId) {
    try {
        const providers = await TMDBAPI.getShowProviders(showId);
        // Preferisci flatrate (streaming), poi buy, poi rent
        let entries = [];
        if (providers && providers.flatrate) {
            entries = providers.flatrate.map(p => ({
                logo: p.logo_path ? `https://image.tmdb.org/t/p/w45${p.logo_path}` : null,
                name: p.provider_name || p.provider_name || guessProviderName(p.logo_path) || 'la piattaforma',
                link: p.link || providers.link || null
            })).filter(e => e.logo);
        } else if (providers && providers.buy) {
            entries = providers.buy.map(p => ({
                logo: p.logo_path ? `https://image.tmdb.org/t/p/w45${p.logo_path}` : null,
                name: p.provider_name || p.provider_name || guessProviderName(p.logo_path) || 'la piattaforma',
                link: p.link || providers.link || null
            })).filter(e => e.logo);
        } else if (providers && providers.rent) {
            entries = providers.rent.map(p => ({
                logo: p.logo_path ? `https://image.tmdb.org/t/p/w45${p.logo_path}` : null,
                name: p.provider_name || p.provider_name || guessProviderName(p.logo_path) || 'la piattaforma',
                link: p.link || providers.link || null
            })).filter(e => e.logo);
        }
        return entries;
    } catch {
        return [];
    }
}

async function renderSeries(series) {
    const container = document.getElementById('seriesContainer');
    if (!container) return;

    const filteredSeries = filterSeries(series);
    const startIndex = (uiState.currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedSeries = filteredSeries.slice(startIndex, endIndex);

    if (filteredSeries.length === 0) {
        container.classList.remove('has-results');
        container.innerHTML = `
            <div class="loading-container">
            <div class="no-results">
                    <p>Nessun risultato trovato</p>
                    <button id="clearFiltersDynamic" class="clear-filters">Cancella filtri</button>
                </div>
            </div>
        `;
        // Aggiungi event listener anche al bottone creato dinamicamente
        const clearBtn = document.getElementById('clearFiltersDynamic');
        if (clearBtn) clearBtn.addEventListener('click', clearFilters);
        updatePagination(0);
        return;
    }
    container.classList.add('has-results');
    
    container.innerHTML = paginatedSeries.map(show => {
        const posterUrl = show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : 'assets/images/placeholder.png';
        const year = show.first_air_date ? show.first_air_date.slice(0, 4) : 'N/A';
        const genres = show.genre_ids ? show.genre_ids.map(id => tmdbGenres[id] || id).join(', ') : 'N/A';
        const rating = show.vote_average ? show.vote_average.toFixed(1) : 'N/A';
        return `
        <div class="series-card" onclick="showSeriesDetails(${show.id})">
            <div class="series-image">
                <img src="${posterUrl}" alt="${security.sanitizeInput(show.name || show.title)}" loading="lazy">
            </div>
            <div class="series-info">
                <h3 class="series-title">${security.sanitizeInput(show.name || show.title)}</h3>
                <div class="series-meta">
                    <span class="series-rating">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                        ${rating}
                    </span>
                    <span class="series-year">${year}</span>
                    <span class="series-genre">${genres}</span>
                </div>
            </div>
            </div>
        `;
    }).join('');
    updatePagination(filteredSeries.length);
}

// Modifica la paginazione per mostrare tutte le pagine
function updatePagination(totalItems) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    let paginationHTML = '';
    // Pulsante "Precedente"
    paginationHTML += `
        <button class="pagination-button" 
                ${uiState.currentPage === 1 ? 'disabled' : ''} 
                onclick="changePage(${uiState.currentPage - 1})"
                aria-label="Pagina precedente">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m15 18-6-6 6-6"/>
            </svg>
        </button>
    `;
    // Mostra sempre la pagina 1
            paginationHTML += `
        <button class="pagination-button ${uiState.currentPage === 1 ? 'active' : ''}"
                onclick="changePage(1)"
                aria-label="Pagina 1">1</button>
    `;
    // Mostra le pagine vicine a quella attuale (max 2 prima e 2 dopo)
    let start = Math.max(2, uiState.currentPage - 2);
    let end = Math.min(totalPages, uiState.currentPage + 2);
    if (start > 2) paginationHTML += `<span class="pagination-ellipsis">...</span>`;
    for (let i = start; i <= end; i++) {
        paginationHTML += `
            <button class="pagination-button ${uiState.currentPage === i ? 'active' : ''}"
                    onclick="changePage(${i})"
                    aria-label="Pagina ${i}">${i}</button>
            `;
        }
    // Nessun salto diretto all'ultima pagina
    // Pulsante "Successivo"
    paginationHTML += `
        <button class="pagination-button" 
                ${uiState.currentPage === totalPages ? 'disabled' : ''} 
                onclick="changePage(${uiState.currentPage + 1})"
                aria-label="Pagina successiva">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m9 18 6-6-6-6"/>
            </svg>
        </button>
    `;
    paginationContainer.innerHTML = paginationHTML;
}

// Modifica changePage per caricare la pagina al volo se serve
window.changePage = async function(page) {
    const totalPages = Math.ceil((TOTAL_PAGES * PAGE_SIZE) / PAGE_SIZE);
    if (page < 1 || page > totalPages) return;
    uiState.currentPage = page;
    const needed = page * PAGE_SIZE;
    // Se la pagina richiesta non è ancora caricata, carica solo quella
    if (allShows.length < needed) {
        showLoadingBar(loadedPages, TOTAL_PAGES);
        // Calcola quali pagine trending/popolari servono
        const toLoad = [];
        for (let p = loadedPages + 1; p <= page; p++) toLoad.push(p);
        for (const p of toLoad) {
            const trending = await TMDBAPI.getTrendingShows(p);
            const popular = await TMDBAPI.getAllShows(p);
            allShows = allShows.concat(trending, popular);
            loadedPages = Math.max(loadedPages, p);
            showLoadingBar(loadedPages, TOTAL_PAGES);
        }
        hideLoadingBar();
        setAndSortShows(allShows);
        updateFilterOptions(uiState.shows);
    }
    renderSeries(uiState.shows);
    updatePagination(TOTAL_PAGES * PAGE_SIZE);
    // Scroll to top
    const container = document.getElementById('seriesContainer');
    if (container) container.scrollIntoView({ behavior: 'smooth' });
};

async function searchShowOnJustWatch(title) {
    try {
        // Cerca lo show su JustWatch
        const show = await StreamingAPI.searchShow(title);
        if (!show) return null;

        // Ottieni le informazioni di streaming
        const streamingInfo = await StreamingAPI.getStreamingInfo(show.id);
        if (!streamingInfo) return null;

        // Formatta le informazioni per la visualizzazione
        const result = {
            streaming: [],
            rent: [],
            buy: []
        };

        // Processa le offerte di streaming (flatrate)
        if (streamingInfo.offers.flatrate.length > 0) {
            result.streaming = streamingInfo.offers.flatrate.map(offer => ({
                name: StreamingAPI.getProviderName(offer.provider_id),
                logo: StreamingAPI.getProviderLogo(offer.provider_id)
            }));
        }

        // Processa le offerte di noleggio
        if (streamingInfo.offers.rent.length > 0) {
            result.rent = streamingInfo.offers.rent.map(offer => ({
                name: StreamingAPI.getProviderName(offer.provider_id),
                logo: StreamingAPI.getProviderLogo(offer.provider_id)
            }));
        }

        // Processa le offerte di acquisto
        if (streamingInfo.offers.buy.length > 0) {
            result.buy = streamingInfo.offers.buy.map(offer => ({
                name: StreamingAPI.getProviderName(offer.provider_id),
                logo: StreamingAPI.getProviderLogo(offer.provider_id)
            }));
        }

        return result;
    } catch (error) {
        console.error('Error in searchShowOnJustWatch:', error);
        return null;
    }
}

// Utility per mappare logo a nome piattaforma
const PROVIDER_NAMES = {
  'netflix': 'Netflix',
  'prime': 'Prime Video',
  'disney': 'Disney+',
  'hbo': 'HBO',
  'hulu': 'Hulu',
  'apple': 'Apple TV+',
  'paramount': 'Paramount+',
  'showtime': 'Showtime',
  'max': 'Max',
  'amc': 'AMC',
  // fallback generico
};
function guessProviderName(logoUrl) {
  if (!logoUrl) return 'la piattaforma';
  const match = logoUrl.match(/([a-z]+)\.(png|jpg|jpeg)$/i);
  if (match && PROVIDER_NAMES[match[1]]) return PROVIDER_NAMES[match[1]];
  if (match) return match[1].charAt(0).toUpperCase() + match[1].slice(1);
  return 'la piattaforma';
}

// MODALE: mostra tutte le info avanzate
async function showSeriesDetails(showIdOrObject) {
    try {
        const showId = typeof showIdOrObject === 'object' ? showIdOrObject.id : showIdOrObject;
        if (!window.TMDBAPI) throw new Error('TMDBAPI non è disponibile');
        const details = await window.TMDBAPI.getShowDetails(showId);
        const seasons = await window.TMDBAPI.getShowSeasons(showId);
        const providers = await getProviders(showId);
        const externalIds = await window.TMDBAPI.getExternalIds(showId);
        if (!details) throw new Error('Impossibile caricare i dettagli della serie');
        const posterUrl = details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : 'assets/images/placeholder.png';
        const year = details.first_air_date ? details.first_air_date.slice(0, 4) : 'N/A';
        const genres = details.genres ? details.genres.map(g => g.name).join(', ') : 'N/A';
        const rating = details.vote_average ? details.vote_average.toFixed(1) : 'N/A';
        const description = details.overview || 'Nessuna descrizione disponibile.';
        const seasonsCount = seasons.length;
        const modalHTML = `
            <div class="series-modal">
                <div class="modal-content">
                    <button class="modal-close" aria-label="Chiudi">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <div class="modal-header">
                        <div class="modal-image">
                            <img src="${posterUrl}" alt="${details.name || details.title}" loading="lazy">
                        </div>
                        <div class="modal-info">
                            <h2>${details.name || details.title}</h2>
                            <div class="modal-meta">
                                    <span class="rating">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                        </svg>
                                    ${rating}
                                </span>
                                <span class="genres">${genres}</span>
                                <span class="year">${year}</span>
                                <span class="seasons">${seasonsCount} ${seasonsCount === 1 ? 'stagione' : 'stagioni'}</span>
                            </div>
                            <div class="series-description">
                                <h3>Trama</h3>
                                <p>${description}</p>
                                    </div>
                            ${providers.length > 0
                              ? `<div class="series-providers-modal">
                                    <h3>Dove guardare</h3>
                                    <div class="providers-logos-row">
                                        ${providers.map(p => `
                                          <div class="provider-logo-wrapper">
                                            <img src="${p.logo}" class="provider-logo" alt="Provider">
                                            <div class="provider-tooltip" style="display:none"></div>
                                            <div class="provider-name" style="display:none">${p.name}</div>
                                            <div class="provider-name-always">${p.name}</div>
                                          </div>
                                        `).join('')}
                                    </div>
                                </div>`
                              : ''}
                            </div>
                    </div>
                </div>
            </div>`;
        // Rimuovi eventuali modali esistenti
        const existingModal = document.querySelector('.series-modal');
        if (existingModal) existingModal.remove();
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = document.querySelector('.series-modal');
        const closeButton = modal.querySelector('.modal-close');
        closeButton.addEventListener('click', () => { modal.remove(); });
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        document.addEventListener('keydown', function handleEsc(e) {
            if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', handleEsc); }
        });
        // Tooltip/badge su hover/click provider
        setTimeout(() => {
          document.querySelectorAll('.provider-logo-wrapper').forEach(wrapper => {
            const img = wrapper.querySelector('.provider-logo');
            const tooltip = wrapper.querySelector('.provider-tooltip');
            const providerName = wrapper.querySelector('.provider-name')?.textContent || 'la piattaforma';
            function showTip() {
              // Chiudi tutti gli altri tooltip attivi
              document.querySelectorAll('.provider-tooltip.active').forEach(t => t.classList.remove('active'));
              tooltip.textContent = `Serie visibile su ${providerName}`;
              tooltip.style.display = 'block';
              tooltip.classList.add('active');
            }
            function hideTip() {
              tooltip.classList.remove('active');
              setTimeout(() => { tooltip.style.display = 'none'; }, 200);
            }
            // Tooltip solo su desktop (hover/focus/click), non su mobile
            const isMobile = window.matchMedia('(max-width: 600px)').matches;
            if (!isMobile) {
              img.addEventListener('mouseenter', showTip);
              img.addEventListener('mouseleave', hideTip);
              img.addEventListener('focus', showTip);
              img.addEventListener('blur', hideTip);
              img.addEventListener('click', () => {
                showTip();
                setTimeout(hideTip, 2000);
              });
            }
          });
        }, 0);
    } catch (error) {
        console.error('Error showing series details:', error);
        showError('Errore nel caricamento dei dettagli della serie.');
    }
}

function showError(message) {
    const container = document.getElementById('seriesContainer');
    if (container) {
        container.classList.remove('has-results');
        container.innerHTML = `
            <div class="loading-container">
                <div class="error-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="m15 9-6 6"/>
                        <path d="m9 9 6 6"/>
                    </svg>
                    <p>${message}</p>
                </div>
            </div>
        `;
    }
}

// Funzione per mostrare la barra di caricamento
function showLoadingBar(progress, total) {
    let loader = document.getElementById('catalogLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'catalogLoader';
        loader.innerHTML = `
            <div class="loading-bar-container">
                <div class="loading-bar" style="width:0%"></div>
                <span class="loading-text">Caricamento catalogo in corso...</span>
            </div>
        `;
        // Inserisco la barra prima del container delle serie
        const seriesContainer = document.getElementById('seriesContainer');
        if (seriesContainer && seriesContainer.parentNode) {
            seriesContainer.parentNode.insertBefore(loader, seriesContainer);
        } else {
            document.body.appendChild(loader);
        }
    }
    const bar = loader.querySelector('.loading-bar');
    if (bar) bar.style.width = ((progress / total) * 100) + '%';
    const text = loader.querySelector('.loading-text');
    if (text) text.textContent = `Caricamento catalogo in corso... (${progress}/${total})`;
    loader.style.display = 'flex';
}

function hideLoadingBar() {
    const loader = document.getElementById('catalogLoader');
    if (loader) loader.style.display = 'none';
}

// All'avvio, rimuovi forzatamente ogni bottone 'Carica altre' residuo
function removeLoadMoreBtn() {
    const btn = document.getElementById('loadMoreBtn');
    if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
}
document.addEventListener('DOMContentLoaded', removeLoadMoreBtn);

// 5. Inizializza il bottone dopo il primo caricamento
// (dopo loadSeries)
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    loadSeries();
    
    // Search input with debounce
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(async () => {
            const query = searchInput.value.trim();
            uiState.filters.search = query;
            uiState.currentPage = 1;
            if (query.length > 0) {
                // Ricerca live su TMDb
                const results = await TMDBAPI.searchShows(query, 1);
                renderSeries(results);
                updatePagination(results.length); // Mostra paginazione solo per i risultati trovati
            } else {
                // Mostra solo le popolari caricate localmente
            renderSeries(uiState.shows);
                updatePagination(uiState.shows.length);
            }
        }, config.debounceDelay));
    }

    // Filter change handlers
    const filterIds = ['typeFilter', 'genreFilter', 'statusFilter', 'ratingFilter', 'yearFilter', 'langFilter'];
    filterIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => {
                const filterName = id.replace('Filter', '').toLowerCase();
                uiState.filters[filterName] = element.value;
                uiState.currentPage = 1;
                renderSeries(uiState.shows);
            });
        }
    });

    // Clear filters button
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }

    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Solo serie top checkbox
    const onlyHighRatedCheckbox = document.getElementById('onlyHighRated');
    if (onlyHighRatedCheckbox) {
        onlyHighRatedCheckbox.addEventListener('change', () => {
            uiState.filters.onlyHighRated = onlyHighRatedCheckbox.checked;
            uiState.currentPage = 1;
            renderSeries(uiState.shows);
        });
    }
});

// Rendi la funzione changePage globale
window.changePage = changePage;

// Rendi la funzione showSeriesDetails globale
window.showSeriesDetails = showSeriesDetails;

// Funzione per aggiornare l'interfaccia con nuove serie
window.updateUI = function(shows) {
    if (shows && shows.length > 0) {
        setAndSortShows(shows);
        updateFilterOptions(uiState.shows);
        renderSeries(uiState.shows);
        updatePagination(uiState.shows.length);
    }
}; 

// Funzione per ordinare e impostare le serie nello stato globale
function setAndSortShows(shows) {
    uiState.shows = dedupeAndSort(shows);
}

// Nuova funzione per il select dei generi (mostra nome, salva id)
function updateGenreSelect(id, options) {
    const select = document.getElementById(id);
    if (select) {
        const currentValue = select.value;
        select.innerHTML = `<option value="">Tutti i generi</option>` +
            options.map(opt => `<option value="${opt.id}" ${String(opt.id) === currentValue ? 'selected' : ''}>${opt.name}</option>`).join('');
    }
} 

// --- Netflix Style Catalog Loader (senza paginazione interna, slider continuo) ---

const MIN_YEAR = 2022;
function filterRecentAndValid(shows) {
  return (shows || [])
    .filter(s => s && s.poster_path && s.first_air_date && s.first_air_date.slice(0,4) >= MIN_YEAR)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
}

const CATEGORIES = [
  { id: 'tendenza', label: 'Tendenza', fetch: (page=1) => TMDBAPI.getTrendingShows(page) },
  { id: 'popolari', label: 'Popolari', fetch: (page=1) => TMDBAPI.getMostPopularShows(page) },
  { id: 'nuove-uscite', label: 'Nuove Uscite', fetch: (page=1) => TMDBAPI.getRecentShows(page) },
  { id: 'top10', label: 'Top 10', fetch: () => TMDBAPI.getTrendingShows(1).then(list => list.slice(0, 10)) },
  { id: 'azione', label: 'Azione', fetch: (page=1) => TMDBAPI.getShowsByGenre(10759, page) },
  { id: 'commedia', label: 'Commedia', fetch: (page=1) => TMDBAPI.getShowsByGenre(35, page) },
  { id: 'dramma', label: 'Dramma', fetch: (page=1) => TMDBAPI.getShowsByGenre(18, page) },
  { id: 'fantascienza', label: 'Fantascienza', fetch: (page=1) => TMDBAPI.getShowsByGenre(10765, page) },
  { id: 'animazione', label: 'Animazione', fetch: (page=1) => TMDBAPI.getShowsByGenre(16, page) },
  { id: 'crime', label: 'Crime', fetch: (page=1) => TMDBAPI.getShowsByGenre(80, page) }
];

// --- Ricerca avanzata stile Netflix ---
let searchSlider = null;

async function showSearchResults(query) {
  if (!query) {
    if (searchSlider) searchSlider.style.display = 'none';
    return;
  }
  let results = [];
  for (let page = 1; page <= 5 && results.length < 100; page++) {
    const pageResults = await TMDBAPI.searchShows(query, page);
    if (!pageResults || pageResults.length === 0) break;
    results = results.concat(pageResults);
  }
  renderSearchSlider(results);
}

function renderSearchSlider(series) {
  if (!searchSlider) {
    searchSlider = document.createElement('section');
    searchSlider.className = 'search-slider-section';
    searchSlider.innerHTML = `
      <h2>Risultati ricerca</h2>
      <div class="series-slider" id="search-slider"></div>
    `;
    const main = document.querySelector('.catalog-main .container');
    if (main) main.prepend(searchSlider);
  }
  const slider = searchSlider.querySelector('#search-slider');
  slider.innerHTML = '';
  (series || []).forEach(show => {
    const card = document.createElement('div');
    card.className = 'series-card';
    card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${show.poster_path}" alt="${show.name}" loading="lazy">
      <div class="series-info">
        <div class="series-title">${show.name}</div>
        <div class="series-meta">
          <span>${show.first_air_date ? show.first_air_date.slice(0,4) : ''}</span>
          <span class="series-rating">⭐ ${show.vote_average ? show.vote_average.toFixed(1) : '-'}</span>
        </div>
      </div>
    `;
    card.onclick = () => openModal(show.id);
    slider.appendChild(card);
  });
  searchSlider.style.display = (series && series.length) ? '' : 'none';
}

// Hook input ricerca
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', debounce(async () => {
    const query = searchInput.value.trim();
    await showSearchResults(query);
  }, 300));
}

const CATEGORY_MAX_SERIES = 200;
const loadedCategoryData = {};

window.addEventListener('DOMContentLoaded', () => {
  renderAllCategories();
});

// Filtri per categoria stile Netflix
// Nessun filtro: mostra almeno 25 serie per categoria, senza limiti di anno o poster
function filterForCategory(catId, shows) {
  return (shows || [])
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
}

async function renderAllCategories() {
  for (const cat of CATEGORIES) {
    loadedCategoryData[cat.id] = [];
    renderSkeleton(cat.id);
    try {
      let allShows = [];
      let page = 1;
      // Carica fino a 10 pagine o almeno 25 serie
      while (allShows.length < 25 && page <= 10) {
        const shows = await cat.fetch(page);
        if (!shows || shows.length === 0) break;
        allShows = allShows.concat(shows);
        page++;
      }
      // Nessun filtro: solo deduplica e prendi le più popolari
      const filtered = filterForCategory(cat.id, allShows);
      const unique = {};
      filtered.forEach(s => { if (s && s.id) unique[s.id] = s; });
      loadedCategoryData[cat.id] = Object.values(unique).slice(0, CATEGORY_MAX_SERIES);
      renderCategory(cat.id);
    } catch (e) {
      renderCategoryError(cat.id);
    }
  }
}

function renderSkeleton(catId) {
  const slider = document.getElementById('cat-' + catId);
  if (slider) {
    slider.innerHTML = '';
    for (let i = 0; i < 8; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton-card';
      slider.appendChild(skeleton);
    }
  }
}

function renderCategory(catId) {
  const slider = document.getElementById('cat-' + catId);
  if (!slider) return;
  slider.innerHTML = '';
  const shows = loadedCategoryData[catId] || [];
  shows.forEach(show => {
    const card = document.createElement('div');
    card.className = 'series-card';
    card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${show.poster_path}" alt="${show.name}" loading="lazy">
      <div class="series-info">
        <div class="series-title">${show.name}</div>
        <div class="series-meta">
          <span>${show.first_air_date ? show.first_air_date.slice(0,4) : ''}</span>
          <span class="series-rating">⭐ ${show.vote_average ? show.vote_average.toFixed(1) : '-'}</span>
        </div>
      </div>
    `;
    card.onclick = () => openModal(show.id);
    slider.appendChild(card);
  });
  // --- AGGIUNTA: riquadro Carica Altro ---
  if ((shows.length < CATEGORY_MAX_SERIES) && CATEGORIES.find(c => c.id === catId)) {
    const loadMore = document.createElement('div');
    loadMore.className = 'series-card load-more-card';
    loadMore.innerHTML = `
      <div class="load-more-inner">
        <span class="load-more-plus">+</span>
        <span class="load-more-text">Esplora di più</span>
      </div>
    `;
    loadMore.style.display = 'flex';
    loadMore.style.alignItems = 'center';
    loadMore.style.justifyContent = 'center';
    loadMore.style.cursor = 'pointer';
    loadMore.onclick = async () => {
      loadMore.classList.add('loading');
      const cat = CATEGORIES.find(c => c.id === catId);
      const PER_LOAD = 20;
      if (!loadedCategoryData[catId]._lastPageLoaded) loadedCategoryData[catId]._lastPageLoaded = Math.ceil(shows.length / PER_LOAD);
      loadedCategoryData[catId]._lastPageLoaded++;
      const page = loadedCategoryData[catId]._lastPageLoaded;
      const newShows = await cat.fetch(page);
      if (newShows && newShows.length) {
        // Aggiungi solo i primi 20 risultati nuovi
        const existingIds = new Set(loadedCategoryData[catId].map(s => s && s.id));
        let added = 0;
        for (let i = 0; i < newShows.length && added < PER_LOAD; i++) {
          const s = newShows[i];
          if (s && s.id && !existingIds.has(s.id)) {
            loadedCategoryData[catId].push(s);
            added++;
          }
        }
        loadedCategoryData[catId]._lastPageLoaded = page;
        loadedCategoryData[catId] = loadedCategoryData[catId].slice(0, CATEGORY_MAX_SERIES);
        renderCategory(catId);
      } else {
        loadMore.classList.remove('loading');
      }
    };
    slider.appendChild(loadMore);
  }
}

function renderCategoryError(catId) {
  const slider = document.getElementById('cat-' + catId);
  if (slider) slider.innerHTML = '<div style="color:#f55;padding:1rem;">Errore nel caricamento</div>';
}

// --- MODALE DETTAGLIO ---
async function openModal(showId) {
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('series-modal');
  overlay.style.display = 'block';
  modal.style.display = 'block';
  modal.innerHTML = '<div class="skeleton-card" style="width:100%;height:340px;margin-bottom:1rem;"></div>';
  document.body.style.overflow = 'hidden';
  try {
    const show = await TMDBAPI.getShowDetails(showId);
    const seasons = await TMDBAPI.getShowSeasons(showId);
    const seasonsCount = seasons.length;
    // --- AGGIUNTA: badge stagioni ---
    const seasonBadge = `<span class="season-badge">${seasonsCount} ${seasonsCount === 1 ? 'stagione' : 'stagioni'}</span>`;
    // --- FINE AGGIUNTA ---
    // --- AGGIUNTA: recupera providers ---
    let providers = [];
    if (typeof getProviders === 'function') {
      providers = await getProviders(showId);
    }
    // --- FINE AGGIUNTA ---
    modal.innerHTML = `
      <button onclick="closeModal()" style="position:absolute;top:1rem;right:1rem;font-size:2rem;background:none;border:none;color:#fff;cursor:pointer;">&times;</button>
      <div style="display:flex;flex-wrap:wrap;gap:2rem;align-items:flex-start;">
        <img src="https://image.tmdb.org/t/p/w500${show.poster_path}" alt="${show.name}" style="width:200px;border-radius:1rem;">
        <div style="flex:1;min-width:200px;">
          <h2 style="margin-bottom:0.5rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">${show.name} ${seasonBadge}</h2>
          <div style="color:var(--color-accent);font-weight:700;margin-bottom:0.5rem;">⭐ ${show.vote_average ? show.vote_average.toFixed(1) : '-'}</div>
          <div style="margin-bottom:1rem;">${show.overview || ''}</div>
          <div style="color:var(--color-text-secondary);font-size:1rem;">${show.first_air_date ? 'Anno: ' + show.first_air_date.slice(0,4) : ''}</div>
          <div style="color:var(--color-text-secondary);font-size:1rem;">${show.genres && show.genres.length ? 'Generi: ' + show.genres.map(g=>g.name).join(', ') : ''}</div>
          <!-- AGGIUNTA: piattaforme -->
          ${providers.length > 0 ? `
            <div class="series-providers-modal" style="margin-top:1.5rem;">
              <h3 style="margin-bottom:0.5rem;">Dove guardare</h3>
              <div class="providers-logos-row" style="display:flex;gap:1rem;flex-wrap:wrap;">
                ${providers.map(p => `
                  <div class="provider-logo-wrapper" style="position:relative;display:inline-block;">
                    <img src="${p.logo}" class="provider-logo" alt="${p.name}" tabindex="0" style="width:45px;height:45px;object-fit:contain;cursor:pointer;">
                    <div class="provider-tooltip" style="display:none;position:absolute;bottom:110%;left:50%;transform:translateX(-50%);background:rgba(20,20,20,0.97);color:#fff;padding:0.4em 0.8em;border-radius:0.5em;font-size:0.95em;white-space:nowrap;box-shadow:0 2px 8px #0008;z-index:10;pointer-events:none;"></div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          <!-- FINE AGGIUNTA -->
        </div>
      </div>
    `;
    // AGGIUNTA: Tooltip/badge su hover/click provider
    setTimeout(() => {
      document.querySelectorAll('.provider-logo-wrapper').forEach(wrapper => {
        const img = wrapper.querySelector('.provider-logo');
        const tooltip = wrapper.querySelector('.provider-tooltip');
        const providerName = img ? img.alt : 'la piattaforma';
        function showTip() {
          // Chiudi tutti gli altri tooltip attivi
          document.querySelectorAll('.provider-tooltip.active').forEach(t => t.classList.remove('active'));
          // --- MODIFICA: testo diverso mobile/desktop ---
          const isMobile = window.matchMedia('(max-width: 600px)').matches;
          tooltip.textContent = isMobile ? providerName : `Serie visibile su ${providerName}`;
          tooltip.style.display = 'block';
          tooltip.classList.add('active');
          // --- AGGIUNTA: riposizionamento dinamico ---
          setTimeout(() => {
            const rect = tooltip.getBoundingClientRect();
            const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            // Reset
            tooltip.style.left = '50%';
            tooltip.style.right = '';
            tooltip.style.transform = 'translateX(-50%)';
            tooltip.style.maxWidth = '90vw';
            // Se esce a sinistra
            if (rect.left < 8) {
              tooltip.style.left = '8px';
              tooltip.style.transform = 'none';
            }
            // Se esce a destra
            if (rect.right > vw - 8) {
              tooltip.style.left = '';
              tooltip.style.right = '8px';
              tooltip.style.transform = 'none';
            }
            // Migliora padding/dimensione su mobile
            if (isMobile) {
              tooltip.style.fontSize = '1.05em';
              tooltip.style.padding = '0.6em 1em';
            } else {
              tooltip.style.fontSize = '0.95em';
              tooltip.style.padding = '0.4em 0.8em';
            }
          }, 0);
          // --- FINE AGGIUNTA ---
        }
        function hideTip() {
          tooltip.classList.remove('active');
          setTimeout(() => { tooltip.style.display = 'none'; }, 200);
        }
        const isMobile = window.matchMedia('(max-width: 600px)').matches;
        if (!isMobile) {
          img.addEventListener('mouseenter', showTip);
          img.addEventListener('mouseleave', hideTip);
          img.addEventListener('focus', showTip);
          img.addEventListener('blur', hideTip);
          img.addEventListener('click', () => {
            showTip();
            setTimeout(hideTip, 2000);
          });
        } else {
          // Mobile: tap per mostrare/nascondere tooltip
          let tipVisible = false;
          img.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!tipVisible) {
              // Chiudi altri tooltip
              document.querySelectorAll('.provider-tooltip.active').forEach(t => {
                t.classList.remove('active');
                t.style.display = 'none';
              });
              tooltip.textContent = `Serie visibile su ${providerName}`;
              tooltip.style.display = 'block';
              tooltip.classList.add('active');
              tipVisible = true;
              // Chiudi se tocchi fuori
              const closeOnOutside = (ev) => {
                if (!wrapper.contains(ev.target)) {
                  tooltip.classList.remove('active');
                  tooltip.style.display = 'none';
                  tipVisible = false;
                  document.removeEventListener('touchstart', closeOnOutside);
                }
              };
              setTimeout(() => {
                document.addEventListener('touchstart', closeOnOutside);
              }, 0);
            } else {
              tooltip.classList.remove('active');
              tooltip.style.display = 'none';
              tipVisible = false;
            }
          });
        }
      });
    }, 0);
    // FINE AGGIUNTA
  } catch (e) {
    modal.innerHTML = '<div style="color:#f55;padding:2rem;">Errore nel caricamento dettagli</div>';
  }
  overlay.onclick = closeModal;
}
function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  document.getElementById('series-modal').style.display = 'none';
  document.body.style.overflow = '';
} 