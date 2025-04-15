// Configurazione base
const config = {
    itemsPerPage: 20,
    debounceDelay: 300,
    loadingThreshold: 0.8 // Soglia per il caricamento progressivo (80% dello scroll)
};

// Stato dell'interfaccia
const uiState = {
    shows: [],
    currentPage: 1,
    filters: {
        search: '',
        genre: '',
        status: '',
        language: '',
        rating: 0,
        year: ''
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

// Funzioni per la gestione delle serie TV
async function loadSeries() {
    try {
        const series = await TVMazeAPI.updateCatalog();
        if (series && series.length > 0) {
            uiState.shows = series;
            updateFilterOptions(series);
            renderSeries(series);
            updatePagination(series.length);
        } else {
            showError('Nessuna serie TV trovata');
        }
    } catch (error) {
        console.error('Error loading series:', error);
        showError('Errore nel caricamento delle serie TV: ' + error.message);
    }
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

function updateFilterOptions(shows) {
    // Raccogli tutti i generi unici
    const genres = new Set();
    const statuses = new Set();
    const years = new Set();

    shows.forEach(show => {
        if (show.genres && Array.isArray(show.genres)) {
            show.genres.forEach(genre => {
                genres.add(genre);
            });
        }
        if (show.status) {
            statuses.add(show.status);
        }
        if (show.premiered) {
            const year = new Date(show.premiered).getFullYear();
            years.add(year);
        }
    });

    // Aggiorna i select dei filtri con le traduzioni
    updateFilterSelect('genreFilter', Array.from(genres).sort(), translations.genres);
    updateFilterSelect('statusFilter', Array.from(statuses).sort(), translations.status);
    updateFilterSelect('yearFilter', Array.from(years).sort((a, b) => b - a));
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

function filterSeries(series) {
    const searchTerm = uiState.filters.search.toLowerCase();
    const normalizedSearchTerm = normalizeString(searchTerm);
    const searchTermWords = normalizedSearchTerm.split(' ').filter(word => word.length > 1);
    const searchAcronym = getAcronym(uiState.filters.search);
    
    // Filtra le serie in base ai criteri
    const filteredSeries = series.filter(show => {
        const normalizedName = normalizeString(show.name);
        const normalizedSummary = show.summary ? normalizeString(show.summary) : '';
        const showAcronym = getAcronym(show.name);

        // Logica di ricerca
            const matchesSearch = !searchTerm || 
            normalizedName.includes(normalizedSearchTerm) ||
            normalizedSummary.includes(normalizedSearchTerm) ||
            (searchAcronym.length > 1 && showAcronym === searchAcronym) ||
            searchTermWords.some(word => 
                normalizedName.includes(word) || 
                normalizedSummary.includes(word)
            );
        
        const matchesGenre = !uiState.filters.genre || 
            (show.genres && show.genres.includes(uiState.filters.genre));
        
        const matchesStatus = !uiState.filters.status || 
            show.status === uiState.filters.status;
        
        const matchesRating = !uiState.filters.rating || 
            (show.rating?.average && show.rating.average >= uiState.filters.rating);
        
        const matchesYear = !uiState.filters.year || 
            (show.premiered && show.premiered.startsWith(uiState.filters.year));

        return matchesSearch && matchesGenre && matchesStatus && 
               matchesRating && matchesYear;
    });

    // Calcola il punteggio di rilevanza per ogni serie
    const scoredSeries = filteredSeries.map(show => {
        let score = 0;

        // Punteggio base dalla popolarità (weight)
        score += (show.weight || 0) * 2;

        // Punteggio dal rating
        if (show.rating?.average) {
            score += show.rating.average * 10;
        }

        // Bonus per serie in corso
        if (show.status === 'Running') {
            score += 20;
        }

        // Bonus per serie in inglese
        if (show.language === 'English') {
            score += 10;
        }

        // Bonus per serie recenti
        if (show.premiered) {
            const year = new Date(show.premiered).getFullYear();
            const currentYear = new Date().getFullYear();
            const yearDiff = currentYear - year;
            if (yearDiff <= 1) {
                score += 30;
            } else if (yearDiff <= 3) {
                score += 20;
            } else if (yearDiff <= 5) {
                score += 10;
            }
        }

        // Se c'è una ricerca testuale, aggiungi punteggio di rilevanza
        if (searchTerm) {
            const normalizedName = normalizeString(show.name);
            const normalizedSummary = show.summary ? normalizeString(show.summary) : '';
            const showAcronym = getAcronym(show.name);

            // Match esatto del titolo
            if (normalizedName === normalizedSearchTerm) {
                score += 100;
            }
            // Match dell'acronimo
            else if (searchAcronym.length > 1 && showAcronym === searchAcronym) {
                score += 80;
            }
            // Il titolo inizia con il termine di ricerca
            else if (normalizedName.startsWith(normalizedSearchTerm)) {
                score += 60;
            }
            // Match parziale nel titolo
            else {
                const titleSimilarity = calculateSimilarity(normalizedName, normalizedSearchTerm);
                score += titleSimilarity * 40;
            }

            // Match nella descrizione
            if (normalizedSummary) {
                searchTermWords.forEach(word => {
                    if (normalizedSummary.includes(word)) {
                        score += 5;
                    }
                });
            }
        }

        return { show, score };
    });

    // Ordina per punteggio e restituisci solo le serie
    return scoredSeries
        .sort((a, b) => b.score - a.score)
        .map(({ show }) => show);
}

function clearFilters() {
    uiState.filters = {
        search: '',
        genre: '',
        status: '',
        rating: 0,
        year: ''
    };

    // Reset all filter inputs
    document.getElementById('searchInput').value = '';
    document.getElementById('genreFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('ratingFilter').value = '0';
    document.getElementById('yearFilter').value = '';

    // Re-render the series
    renderSeries(uiState.shows);
}

function renderSeries(series) {
    const container = document.getElementById('seriesContainer');
    if (!container) return;

    const filteredSeries = filterSeries(series);
    const startIndex = (uiState.currentPage - 1) * config.itemsPerPage;
    const endIndex = startIndex + config.itemsPerPage;
    const paginatedSeries = filteredSeries.slice(startIndex, endIndex);

    if (filteredSeries.length === 0) {
        container.classList.remove('has-results');
        container.innerHTML = `
            <div class="loading-container">
            <div class="no-results">
                    <p>Nessun risultato trovato</p>
                    <button onclick="clearFilters()" class="clear-filters">Cancella filtri</button>
                </div>
            </div>
        `;
        updatePagination(0);
        return;
    }
    
    container.classList.add('has-results');
    
    container.innerHTML = paginatedSeries.map(show => `
        <div class="series-card" onclick="showSeriesDetails(${show.id})">
            <div class="series-image">
                <img src="${show.image?.medium || 'assets/images/placeholder.png'}" 
                     alt="${security.sanitizeInput(show.name)}"
                     loading="lazy">
            </div>
            <div class="series-info">
                <h3 class="series-title">${security.sanitizeInput(show.name)}</h3>
                <div class="series-meta">
                    <span class="series-rating">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                        ${show.rating?.average || 'N/A'}
                    </span>
                    <span class="series-genre">${show.genres?.map(genre => translations.genres[genre] || genre).join(', ') || 'N/A'}</span>
                </div>
            </div>
            </div>
    `).join('');

    updatePagination(filteredSeries.length);
}

function updatePagination(totalItems) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(totalItems / config.itemsPerPage);
    
    // Non mostrare la paginazione se c'è una sola pagina
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Pulsante "Precedente" con icona freccia
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
    
    // Calcola quali numeri di pagina mostrare
    let pagesToShow = [];
    if (totalPages <= 7) {
        // Se ci sono 7 o meno pagine, mostra tutte
        pagesToShow = Array.from({length: totalPages}, (_, i) => i + 1);
    } else {
        // Mostra sempre la prima pagina
        pagesToShow.push(1);
        
        if (uiState.currentPage > 3) {
            pagesToShow.push('...');
        }
        
        // Mostra le pagine intorno alla pagina corrente
        for (let i = Math.max(2, uiState.currentPage - 1); 
             i <= Math.min(totalPages - 1, uiState.currentPage + 1); i++) {
            pagesToShow.push(i);
        }
        
        if (uiState.currentPage < totalPages - 2) {
            pagesToShow.push('...');
        }
        
        // Mostra sempre l'ultima pagina
        pagesToShow.push(totalPages);
    }

    // Crea i pulsanti per ogni numero di pagina
    pagesToShow.forEach(page => {
        if (page === '...') {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        } else {
            paginationHTML += `
                <button class="pagination-button ${uiState.currentPage === page ? 'active' : ''}"
                        onclick="changePage(${page})"
                        aria-label="Pagina ${page}">
                    ${page}
                </button>
            `;
        }
    });
    
    // Pulsante "Successivo" con icona freccia
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

function changePage(page) {
    // Verifica che la pagina sia valida
    const totalPages = Math.ceil(filterSeries(uiState.shows).length / config.itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    uiState.currentPage = page;
    renderSeries(uiState.shows);
    
    // Scroll to top of the series container
    const container = document.getElementById('seriesContainer');
    if (container) {
        container.scrollIntoView({ behavior: 'smooth' });
    }
}

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

async function showSeriesDetails(showIdOrObject) {
    try {
        const showId = typeof showIdOrObject === 'object' ? showIdOrObject.id : showIdOrObject;
        
        if (!window.TVMazeAPI) {
            throw new Error('TVMazeAPI non è disponibile');
        }

        const details = await window.TVMazeAPI.getShowDetails(showId);
        if (!details) {
            throw new Error('Impossibile caricare i dettagli della serie');
        }

        // Crea il contenuto del modal
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
                            <img src="${details.image?.original || details.image?.medium || 'assets/images/no-image.png'}" 
                                 alt="${details.name}"
                                 loading="lazy">
                        </div>
                        <div class="modal-info">
                            <h2>${details.name}</h2>
                            <div class="modal-meta">
                                ${details.rating?.average ? `
                                    <span class="rating">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                        </svg>
                                        ${details.rating.average}
                                    </span>` : ''}
                                ${details.genres?.length ? `
                                    <span class="genres">${details.genres.map(genre => translations.genres[genre] || genre).join(', ')}</span>` : ''}
                                ${details.premiered ? `
                                    <span class="year">${new Date(details.premiered).getFullYear()}</span>` : ''}
                                ${details.status ? `
                                    <span class="status ${details.status.toLowerCase()}">${translations.status[details.status] || details.status}</span>` : ''}
                            </div>
                            
                            <div class="streaming-section">
                                <h3>${translations.messages.whereToWatch}</h3>
                                <div class="streaming-info">
                                    <div class="info-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="16" x2="12" y2="12"></line>
                                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                        </svg>
                                    </div>
                                    <div class="info-text">
                                        <p>La sezione delle piattaforme streaming sarà presto disponibile!</p>
                                        <p>Stiamo lavorando per integrare le informazioni su dove guardare questa serie.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-body">
                        ${details.summary ? `
                            <div class="series-description">
                                <h3>${translations.messages.plot}</h3>
                                <div class="description-note">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="16" x2="12" y2="12"></line>
                                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                    </svg>
                                    <span>La descrizione è disponibile solo in inglese</span>
                                </div>
                                ${details.summary}
                            </div>` : ''}
                    </div>
                </div>
            </div>`;

        // Rimuovi eventuali modali esistenti
        const existingModal = document.querySelector('.series-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Aggiungi il nuovo modal al DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Aggiungi gli event listener
        const modal = document.querySelector('.series-modal');
        const closeButton = modal.querySelector('.modal-close');

        closeButton.addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Aggiungi gestione della chiusura con ESC
        document.addEventListener('keydown', function handleEsc(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleEsc);
            }
        });

    } catch (error) {
        console.error('Error showing series details:', error);
        showError(translations.messages.error);
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

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    loadSeries();
    
    // Search input with debounce
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            uiState.filters.search = searchInput.value;
            uiState.currentPage = 1;
            renderSeries(uiState.shows);
        }, config.debounceDelay));
    }

    // Filter change handlers
    const filterIds = ['genreFilter', 'statusFilter', 'ratingFilter', 'yearFilter'];
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
});

// Rendi la funzione changePage globale
window.changePage = changePage;

// Rendi la funzione showSeriesDetails globale
window.showSeriesDetails = showSeriesDetails;

// Funzione per aggiornare l'interfaccia con nuove serie
window.updateUI = function(shows) {
    if (shows && shows.length > 0) {
        uiState.shows = shows;
        updateFilterOptions(shows);
        renderSeries(shows);
        updatePagination(shows.length);
    }
}; 