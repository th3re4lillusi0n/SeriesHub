// Configurazione
const config = {
    itemsPerPage: 24,
    debounceDelay: 300,
    maxPagesShown: 5
};

// Cache per i dati e lo stato
const cache = {
    allSeries: [],
    filteredSeries: [],
    genres: new Set(),
    platforms: new Set(),
    currentPage: 1,
    filters: {
        search: '',
        genre: '',
        platform: '',
        rating: 0
    }
};

// Security utility functions
const security = {
    // Sanitize user input to prevent XSS
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
    
    // Secure localStorage operations with try-catch
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
                return true;
            } catch (e) {
                console.error('Error writing to localStorage:', e);
                return false;
            }
        }
    },
    
    // Validate data before processing
    validateData: function(data) {
        if (!data || typeof data !== 'object') return false;
        return true;
    }
};

// Dati delle serie TV
const seriesData = [
    {
        title: "Breaking Bad",
        description: "Un professore di chimica diventa un signore della droga",
        platforms: ["netflix"],
        genre: "Crime/Drama",
        rating: 9.5
    },
    {
        title: "Game of Thrones",
        description: "Lotte di potere in un mondo fantasy",
        platforms: ["max"],
        genre: "Fantasy/Drama",
        rating: 9.2
    },
    {
        title: "The Mandalorian",
        description: "Un cacciatore di taglie galattico protegge un bambino speciale",
        platforms: ["disney"],
        genre: "Sci-Fi/Action",
        rating: 8.7
    },
    {
        title: "Stranger Things",
        description: "Misteriosi eventi soprannaturali in una piccola città dell'Indiana",
        platforms: ["netflix"],
        genre: "Horror/Sci-Fi",
        rating: 8.7
    },
    {
        title: "The Last of Us",
        description: "Un contrabbandiere e una ragazza attraversano un'America post-apocalittica",
        platforms: ["max"],
        genre: "Drama/Horror",
        rating: 8.8
    },
    {
        title: "House of the Dragon",
        description: "La storia della casa Targaryen, 200 anni prima di Game of Thrones",
        platforms: ["max"],
        genre: "Fantasy/Drama",
        rating: 8.5
    },
    {
        title: "Succession",
        description: "Lotte di potere in una famiglia mediatica",
        platforms: ["max"],
        genre: "Drama",
        rating: 9.0
    },
    {
        title: "Ted Lasso",
        description: "Un allenatore americano di football allena una squadra di calcio inglese",
        platforms: ["apple"],
        genre: "Comedy/Drama",
        rating: 8.9
    },
    {
        title: "The Bear",
        description: "Un chef torna a gestire il ristorante di famiglia",
        platforms: ["disney"],
        genre: "Drama/Comedy",
        rating: 8.8
    },
    {
        title: "Better Call Saul",
        description: "L'origine dell'avvocato Saul Goodman",
        platforms: ["netflix"],
        genre: "Crime/Drama",
        rating: 9.0
    },
    {
        title: "The Crown",
        description: "La storia della famiglia reale britannica",
        platforms: ["netflix"],
        genre: "Drama/History",
        rating: 8.7
    },
    {
        title: "Andor",
        description: "Prequel di Rogue One nell'universo di Star Wars",
        platforms: ["disney"],
        genre: "Sci-Fi/Action",
        rating: 8.7
    },
    {
        title: "The Boys",
        description: "Supereroi corrotti contro vigilanti",
        platforms: ["prime"],
        genre: "Action/Drama",
        rating: 8.7
    },
    {
        title: "Wednesday",
        description: "Le avventure di Mercoledì Addams alla Nevermore Academy",
        platforms: ["netflix"],
        genre: "Fantasy/Comedy",
        rating: 8.2
    },
    {
        title: "The White Lotus",
        description: "Intrighi e drammi in un resort di lusso",
        platforms: ["max"],
        genre: "Drama/Comedy",
        rating: 8.2
    },
    {
        title: "Only Murders in the Building",
        description: "Tre vicini indagano su un omicidio nel loro palazzo",
        platforms: ["disney"],
        genre: "Comedy/Mystery",
        rating: 8.1
    },
    {
        title: "Severance",
        description: "Impiegati con memoria divisa tra lavoro e vita privata",
        platforms: ["apple"],
        genre: "Sci-Fi/Thriller",
        rating: 8.7
    },
    {
        title: "The Morning Show",
        description: "Drama ambientato nel mondo del giornalismo televisivo",
        platforms: ["apple"],
        genre: "Drama",
        rating: 8.2
    },
    {
        title: "Hijack",
        description: "Un negoziatore affronta un dirottamento aereo in tempo reale",
        platforms: ["apple"],
        genre: "Thriller/Drama",
        rating: 7.9
    },
    {
        title: "Slow Horses",
        description: "Agenti dell'MI5 caduti in disgrazia gestiscono casi complessi",
        platforms: ["apple"],
        genre: "Thriller/Drama",
        rating: 8.2
    },
    {
        title: "The Witcher",
        description: "Le avventure dello strigo Geralt di Rivia",
        platforms: ["netflix"],
        genre: "Fantasy/Action",
        rating: 8.1
    },
    {
        title: "The Last Kingdom",
        description: "Guerre e politica nell'Inghilterra medievale",
        platforms: ["netflix"],
        genre: "Action/Drama",
        rating: 8.5
    },
    {
        title: "The Umbrella Academy",
        description: "Fratelli supereroi riuniti per salvare il mondo",
        platforms: ["netflix"],
        genre: "Sci-Fi/Action",
        rating: 7.9
    },
    {
        title: "Queen's Gambit",
        description: "Una giovane prodigio degli scacchi",
        platforms: ["netflix"],
        genre: "Drama",
        rating: 8.6
    },
    {
        title: "The Haunting of Hill House",
        description: "Una famiglia perseguitata da ricordi soprannaturali",
        platforms: ["netflix"],
        genre: "Horror/Drama",
        rating: 8.6
    },
    {
        title: "Sex Education",
        description: "Le avventure di studenti alle prese con la sessualità",
        platforms: ["netflix"],
        genre: "Comedy/Drama",
        rating: 8.3
    },
    {
        title: "The Sopranos",
        description: "Un boss mafioso in terapia",
        platforms: ["max"],
        genre: "Crime/Drama",
        rating: 9.2
    },
    {
        title: "Westworld",
        description: "Un parco a tema futuristico con robot senzienti",
        platforms: ["max"],
        genre: "Sci-Fi/Drama",
        rating: 8.6
    },
    {
        title: "Barry",
        description: "Un sicario che sogna di diventare attore",
        platforms: ["max"],
        genre: "Comedy/Drama",
        rating: 8.4
    },
    {
        title: "Euphoria",
        description: "Le difficoltà dell'adolescenza moderna",
        platforms: ["max"],
        genre: "Drama",
        rating: 8.4
    },
    {
        title: "The Book of Boba Fett",
        description: "Le avventure del cacciatore di taglie di Star Wars",
        platforms: ["disney"],
        genre: "Sci-Fi/Action",
        rating: 7.3
    },
    {
        title: "Ms. Marvel",
        description: "Le avventure della giovane supereroina Kamala Khan",
        platforms: ["disney"],
        genre: "Action/Adventure",
        rating: 7.5
    },
    {
        title: "Secret Invasion",
        description: "Nick Fury combatte un'invasione aliena segreta",
        platforms: ["disney"],
        genre: "Sci-Fi/Action",
        rating: 7.0
    },
    {
        title: "What If...?",
        description: "Storie alternative dell'universo Marvel",
        platforms: ["disney"],
        genre: "Animation/Sci-Fi",
        rating: 7.4
    },
    {
        title: "The Falcon and the Winter Soldier",
        description: "Sam Wilson e Bucky Barnes affrontano nuove minacce",
        platforms: ["disney"],
        genre: "Action/Adventure",
        rating: 7.8
    },
    {
        title: "Hawkeye",
        description: "Le avventure natalizie di Clint Barton",
        platforms: ["disney"],
        genre: "Action/Adventure",
        rating: 7.6
    },
    {
        title: "Daredevil",
        description: "Un avvocato cieco combatte il crimine",
        platforms: ["disney"],
        genre: "Action/Crime",
        rating: 8.6
    },
    {
        title: "The Night Agent",
        description: "Un agente FBI scopre una cospirazione che arriva fino alla Casa Bianca",
        platforms: ["netflix"],
        genre: "Action/Thriller",
        rating: 7.7
    },
    {
        title: "Berlino",
        description: "Spin-off de La Casa di Carta incentrato sul personaggio di Berlino",
        platforms: ["netflix"],
        genre: "Crime/Drama",
        rating: 7.2
    },
    {
        title: "Griselda",
        description: "La storia vera della 'Madrina della Cocaina' Griselda Blanco",
        platforms: ["netflix"],
        genre: "Crime/Drama",
        rating: 7.8
    },
    {
        title: "Tutta la luce che non vediamo",
        description: "Adattamento del romanzo premio Pulitzer durante la Seconda Guerra Mondiale",
        platforms: ["netflix"],
        genre: "Drama/War",
        rating: 7.6
    },
    {
        title: "Bodies",
        description: "Quattro detective in diverse epoche indagano sullo stesso omicidio",
        platforms: ["netflix"],
        genre: "Mystery/Thriller",
        rating: 7.7
    },
    {
        title: "The Fall of the House of Usher",
        description: "Adattamento moderno di Edgar Allan Poe",
        platforms: ["netflix"],
        genre: "Horror/Drama",
        rating: 7.8
    },
    {
        title: "Kaleidoscope",
        description: "Serie non lineare su una rapina elaborata",
        platforms: ["netflix"],
        genre: "Crime/Thriller",
        rating: 7.1
    },
    {
        title: "The Sandman",
        description: "Adattamento del fumetto di Neil Gaiman sul Signore dei Sogni",
        platforms: ["netflix"],
        genre: "Fantasy/Drama",
        rating: 7.8
    },
    {
        title: "Heartstopper",
        description: "Storia d'amore tra due studenti delle superiori",
        platforms: ["netflix"],
        genre: "Drama/Romance",
        rating: 8.7
    },
    {
        title: "The Lincoln Lawyer",
        description: "Un avvocato di Los Angeles gestisce il suo studio legale da una Lincoln",
        platforms: ["netflix"],
        genre: "Drama/Legal",
        rating: 7.7
    },
    {
        title: "Outer Banks",
        description: "Un gruppo di adolescenti cerca un tesoro leggendario",
        platforms: ["netflix"],
        genre: "Adventure/Drama",
        rating: 7.6
    },
    {
        title: "Vikings: Valhalla",
        description: "Spin-off di Vikings ambientato 100 anni dopo",
        platforms: ["netflix"],
        genre: "Action/Drama",
        rating: 7.8
    },
    {
        title: "The Witcher: Blood Origin",
        description: "Prequel di The Witcher sulla creazione del primo Witcher",
        platforms: ["netflix"],
        genre: "Fantasy/Action",
        rating: 7.0
    },
    {
        title: "Gen V",
        description: "Spin-off di The Boys ambientato in un'università per supereroi",
        platforms: ["prime"],
        genre: "Action/Drama",
        rating: 7.8
    },
    {
        title: "Citadel",
        description: "Spie con memoria cancellata devono ricordare il loro passato",
        platforms: ["prime"],
        genre: "Action/Thriller",
        rating: 7.2
    },
    {
        title: "The Continental",
        description: "Prequel di John Wick sul famoso hotel per assassini",
        platforms: ["prime"],
        genre: "Action/Crime",
        rating: 7.4
    },
    {
        title: "Fallout",
        description: "Adattamento della famosa serie di videogiochi post-apocalittici",
        platforms: ["prime"],
        genre: "Sci-Fi/Adventure",
        rating: 8.5
    },
    {
        title: "Mr. & Mrs. Smith",
        description: "Due spie sotto copertura come coppia sposata",
        platforms: ["prime"],
        genre: "Action/Comedy",
        rating: 7.5
    },
    {
        title: "Survivor",
        description: "Reality show di sopravvivenza",
        platforms: ["paramount"],
        genre: "Reality/Adventure",
        rating: 7.7
    },
    {
        title: "Transformers: Prime",
        description: "La guerra tra Autobot e Decepticon continua sulla Terra",
        platforms: ["paramount"],
        genre: "Animation/Action",
        rating: 8.0
    },
    {
        title: "Transformers: EarthSpark",
        description: "Nuova generazione di Transformers nati sulla Terra",
        platforms: ["paramount"],
        genre: "Animation/Adventure",
        rating: 7.2
    },
    {
        title: "Transformers: Cyberverse",
        description: "Bumblebee cerca di recuperare la memoria e salvare i suoi amici",
        platforms: ["paramount"],
        genre: "Animation/Action",
        rating: 7.0
    },
    {
        title: "Transformers: Robots in Disguise",
        description: "Bumblebee guida una nuova squadra di Autobot sulla Terra",
        platforms: ["paramount"],
        genre: "Animation/Action",
        rating: 6.9
    },
    {
        title: "Transformers: Animated",
        description: "Gli Autobot proteggono Detroit nel futuro",
        platforms: ["paramount"],
        genre: "Animation/Action",
        rating: 7.5
    },
    {
        title: "Transformers: Beast Wars",
        description: "Maximals e Predacons combattono sulla Terra preistorica",
        platforms: ["paramount"],
        genre: "Animation/Action",
        rating: 8.2
    },
    {
        title: "Transformers: Beast Machines",
        description: "Il seguito di Beast Wars ambientato su Cybertron",
        platforms: ["paramount"],
        genre: "Animation/Action",
        rating: 7.1
    },
    {
        title: "Transformers: Generation 1",
        description: "La serie originale che ha dato inizio alla saga dei Transformers",
        platforms: ["paramount"],
        genre: "Animation/Action",
        rating: 8.0
    },
    {
        title: "Transformers: Rescue Bots",
        description: "Autobot specializzati in operazioni di soccorso collaborano con gli umani",
        platforms: ["paramount"],
        genre: "Animation/Adventure",
        rating: 7.0
    },
    {
        title: "Transformers: War for Cybertron Trilogy",
        description: "La guerra civile su Cybertron che porta all'esodo verso la Terra",
        platforms: ["netflix"],
        genre: "Animation/Action",
        rating: 7.8
    },
    {
        title: "Yellowstone",
        description: "La famiglia Dutton difende il proprio ranch nel Montana",
        platforms: ["paramount"],
        genre: "Drama/Western",
        rating: 8.7
    },
    {
        title: "South Park",
        description: "Serie animata satirica ambientata in Colorado",
        platforms: ["paramount"],
        genre: "Animation/Comedy",
        rating: 8.7
    },
    {
        title: "Special Ops: Lioness",
        description: "Un'agente della CIA si infiltra in un'organizzazione terroristica",
        platforms: ["paramount"],
        genre: "Action/Drama",
        rating: 7.5
    },
    {
        title: "Star Trek: Lower Decks",
        description: "Serie animata comica ambientata nell'universo di Star Trek",
        platforms: ["paramount"],
        genre: "Animation/Comedy",
        rating: 8.0
    },
    {
        title: "Star Trek: Prodigy",
        description: "Giovani alieni scoprono una nave abbandonata della Flotta Stellare",
        platforms: ["paramount"],
        genre: "Animation/Adventure",
        rating: 7.8
    },
    {
        title: "Teen Wolf",
        description: "Un adolescente viene morso da un lupo mannaro",
        platforms: ["paramount"],
        genre: "Drama/Fantasy",
        rating: 7.6
    },
    {
        title: "Wolf Pack",
        description: "Adolescenti uniti da un misterioso incendio e un lupo mannaro",
        platforms: ["paramount"],
        genre: "Drama/Fantasy",
        rating: 6.4
    },
    {
        title: "School Spirits",
        description: "Una studentessa indaga sulla propria morte",
        platforms: ["paramount"],
        genre: "Drama/Mystery",
        rating: 7.4
    },
    {
        title: "Rabbit Hole",
        description: "Un esperto di spionaggio aziendale viene incastrato per omicidio",
        platforms: ["paramount"],
        genre: "Thriller/Drama",
        rating: 7.1
    },
    {
        title: "Fatal Attraction",
        description: "Remake della serie basata sul film 'Attrazione Fatale'",
        platforms: ["paramount"],
        genre: "Thriller/Drama",
        rating: 6.9
    },
    {
        title: "Grease: Rise of the Pink Ladies",
        description: "Prequel del musical Grease",
        platforms: ["paramount"],
        genre: "Musical/Drama",
        rating: 6.2
    },
    {
        title: "Fire Country",
        description: "Un detenuto partecipa a un programma di riabilitazione come vigile del fuoco",
        platforms: ["paramount"],
        genre: "Drama/Action",
        rating: 7.4
    },
    {
        title: "CSI: Vegas",
        description: "Reboot della serie CSI ambientato a Las Vegas",
        platforms: ["paramount"],
        genre: "Crime/Drama",
        rating: 7.4
    },
    {
        title: "SWAT",
        description: "Le operazioni di una squadra SWAT a Los Angeles",
        platforms: ["paramount"],
        genre: "Action/Crime",
        rating: 7.6
    },
    {
        title: "The Wire",
        description: "Indagine sulla criminalità organizzata a Baltimora",
        platforms: ["max"],
        genre: "Crime/Drama",
        rating: 9.3
    },
    {
        title: "The Shield",
        description: "Un detective corrotto guida una squadra speciale di poliziotti",
        platforms: ["prime"],
        genre: "Crime/Drama",
        rating: 8.7
    },
    {
        title: "Deadwood",
        description: "La vita violenta in una città mineraria del Dakota del Sud",
        platforms: ["max"],
        genre: "Western/Drama",
        rating: 8.7
    },
    {
        title: "Six Feet Under",
        description: "La vita di una famiglia che gestisce un'impresa di pompe funebri",
        platforms: ["max"],
        genre: "Drama",
        rating: 8.8
    },
    {
        title: "The Leftovers",
        description: "Il mondo dopo la misteriosa scomparsa del 2% della popolazione",
        platforms: ["max"],
        genre: "Drama/Mystery",
        rating: 8.3
    },
    {
        title: "Chernobyl",
        description: "La storia del disastro nucleare di Chernobyl del 1986",
        platforms: ["max"],
        genre: "Drama/History",
        rating: 9.4
    },
    {
        title: "Band of Brothers",
        description: "La storia della Easy Company durante la Seconda Guerra Mondiale",
        platforms: ["max"],
        genre: "War/Drama",
        rating: 9.5
    },
    {
        title: "The Pacific",
        description: "La guerra nel Pacifico durante la Seconda Guerra Mondiale",
        platforms: ["max"],
        genre: "War/Drama",
        rating: 8.5
    },
    {
        title: "Rome",
        description: "La storia dell'ascesa e caduta dell'impero romano",
        platforms: ["max"],
        genre: "Drama/History",
        rating: 8.7
    },
    {
        title: "Boardwalk Empire",
        description: "La vita del gangster Nucky Thompson durante il proibizionismo",
        platforms: ["max"],
        genre: "Crime/Drama",
        rating: 8.5
    },
    {
        title: "True Blood",
        description: "Vampiri e altre creature soprannaturali vivono tra gli umani",
        platforms: ["max"],
        genre: "Fantasy/Horror",
        rating: 7.9
    },
    {
        title: "Big Love",
        description: "La vita di una famiglia poligama nello Utah",
        platforms: ["max"],
        genre: "Drama",
        rating: 7.8
    },
    {
        title: "In Treatment",
        description: "Le sessioni di terapia di uno psichiatra",
        platforms: ["max"],
        genre: "Drama",
        rating: 8.0
    },
    {
        title: "Treme",
        description: "La vita a New Orleans dopo l'uragano Katrina",
        platforms: ["max"],
        genre: "Drama",
        rating: 8.2
    },
    {
        title: "Generation Kill",
        description: "La prima fase dell'invasione dell'Iraq nel 2003",
        platforms: ["max"],
        genre: "War/Drama",
        rating: 8.5
    },
    {
        title: "The Deuce",
        description: "La nascita dell'industria pornografica a New York negli anni '70",
        platforms: ["max"],
        genre: "Drama",
        rating: 8.2
    },
    {
        title: "The Night Of",
        description: "Un giovane viene accusato di omicidio",
        platforms: ["max"],
        genre: "Crime/Drama",
        rating: 8.5
    },
    {
        title: "Veep",
        description: "Le vicende di una vicepresidente degli Stati Uniti",
        platforms: ["max"],
        genre: "Comedy",
        rating: 8.3
    },
    {
        title: "Silicon Valley",
        description: "Un gruppo di programmatori cerca di creare una startup di successo",
        platforms: ["max"],
        genre: "Comedy",
        rating: 8.5
    },
    {
        title: "Curb Your Enthusiasm",
        description: "Le vicende comiche di Larry David",
        platforms: ["max"],
        genre: "Comedy",
        rating: 8.7
    },
    {
        title: "Entourage",
        description: "La vita di un giovane attore a Hollywood",
        platforms: ["max"],
        genre: "Comedy/Drama",
        rating: 8.2
    },
    {
        title: "Girls",
        description: "Le vicende di quattro amiche a New York",
        platforms: ["max"],
        genre: "Comedy/Drama",
        rating: 7.3
    },
    {
        title: "Looking",
        description: "La vita di tre amici gay a San Francisco",
        platforms: ["max"],
        genre: "Comedy/Drama",
        rating: 7.5
    },
    {
        title: "Divorce",
        description: "Una donna cerca di ricostruire la sua vita dopo il divorzio",
        platforms: ["max"],
        genre: "Comedy/Drama",
        rating: 7.2
    },
    {
        title: "Insecure",
        description: "Le vicende di due amiche afroamericane a Los Angeles",
        platforms: ["max"],
        genre: "Comedy/Drama",
        rating: 7.8
    },
    {
        title: "Ballers",
        description: "Un ex giocatore di football diventa agente sportivo",
        platforms: ["max"],
        genre: "Comedy/Drama",
        rating: 7.5
    },
    {
        title: "Vice Principals",
        description: "Due vice presidi competono per il ruolo di preside",
        platforms: ["max"],
        genre: "Comedy",
        rating: 7.4
    },
    {
        title: "Eastbound & Down",
        description: "Un ex campione di baseball torna nella sua città natale",
        platforms: ["max"],
        genre: "Comedy",
        rating: 7.6
    },
    {
        title: "Flight of the Conchords",
        description: "Due musicisti neozelandesi cercano di sfondare a New York",
        platforms: ["max"],
        genre: "Comedy/Musical",
        rating: 8.2
    },
    {
        title: "Bored to Death",
        description: "Uno scrittore diventa detective privato per caso",
        platforms: ["max"],
        genre: "Comedy",
        rating: 7.5
    },
    {
        title: "Enlightened",
        description: "Una donna torna al lavoro dopo un esaurimento nervoso",
        platforms: ["max"],
        genre: "Comedy/Drama",
        rating: 7.7
    },
    {
        title: "Togetherness",
        description: "Quattro amici cercano di mantenere viva la loro amicizia",
        platforms: ["max"],
        genre: "Comedy/Drama",
        rating: 7.3
    },
    {
        title: "Getting On",
        description: "La vita in un reparto di geriatria",
        platforms: ["max"],
        genre: "Comedy/Drama",
        rating: 7.2
    },
    {
        title: "The Brink",
        description: "Una crisi internazionale vista da diversi punti di vista",
        platforms: ["max"],
        genre: "Comedy/Drama",
        rating: 7.1
    },
    {
        title: "The Comeback",
        description: "Un'ex star della TV cerca di tornare alla fama",
        platforms: ["max"],
        genre: "Comedy",
        rating: 7.4
    },
    {
        title: "Hello Ladies",
        description: "Un inglese goffo cerca l'amore a Los Angeles",
        platforms: ["max"],
        genre: "Comedy",
        rating: 7.2
    },
    {
        title: "Family Tree",
        description: "Un uomo inizia a indagare sulla sua famiglia",
        platforms: ["max"],
        genre: "Comedy",
        rating: 7.3
    },
    {
        title: "The Ricky Gervais Show",
        description: "Serie animata basata sui podcast di Ricky Gervais",
        platforms: ["max"],
        genre: "Comedy",
        rating: 7.5
    },
    {
        title: "Life's Too Short",
        description: "Le vicende di un nano attore che cerca di sfondare",
        platforms: ["max"],
        genre: "Comedy",
        rating: 7.4
    },
    {
        title: "Extras",
        description: "Un comparsa cerca di diventare attore",
        platforms: ["max"],
        genre: "Comedy",
        rating: 7.8
    },
    {
        title: "The Office (UK)",
        description: "La versione originale britannica di The Office",
        platforms: ["max"],
        genre: "Comedy",
        rating: 8.2
    },
    {
        title: "Peep Show",
        description: "La vita di due coinquilini attraverso i loro pensieri",
        platforms: ["max"],
        genre: "Comedy",
        rating: 8.7
    },
    {
        title: "The Thick of It",
        description: "La vita caotica in un ministero britannico",
        platforms: ["max"],
        genre: "Comedy",
        rating: 8.5
    },
    {
        title: "The IT Crowd",
        description: "Le vicende del reparto IT di un'azienda",
        platforms: ["netflix"],
        genre: "Comedy",
        rating: 8.5
    },
    {
        title: "Black Books",
        description: "Un libraio misantropo e i suoi amici",
        platforms: ["netflix"],
        genre: "Comedy",
        rating: 8.3
    },
    {
        title: "Spaced",
        description: "Due amici fingono di essere una coppia per affittare un appartamento",
        platforms: ["netflix"],
        genre: "Comedy",
        rating: 8.4
    },
    {
        title: "Father Ted",
        description: "Le vicende di tre preti irlandesi su un'isola remota",
        platforms: ["netflix"],
        genre: "Comedy",
        rating: 8.6
    },
    {
        title: "Fawlty Towers",
        description: "Le vicende di un albergatore goffo e sua moglie",
        platforms: ["netflix"],
        genre: "Comedy",
        rating: 8.7
    },
    {
        title: "Monty Python's Flying Circus",
        description: "Serie comica rivoluzionaria con sketch surreali",
        platforms: ["netflix"],
        genre: "Comedy",
        rating: 8.8
    },
    {
        title: "Absolutely Fabulous",
        description: "Le vicende di due amiche che cercano di rimanere giovani",
        platforms: ["netflix"],
        genre: "Comedy",
        rating: 7.9
    },
    {
        title: "The Young Ones",
        description: "La vita di quattro studenti universitari in una casa condivisa",
        platforms: ["netflix"],
        genre: "Comedy",
        rating: 7.8
    },
    {
        title: "Red Dwarf",
        description: "Un uomo si sveglia tre milioni di anni nel futuro",
        platforms: ["netflix"],
        genre: "Comedy/Sci-Fi",
        rating: 8.2
    },
    {
        title: "Blackadder",
        description: "Le vicende di Edmund Blackadder in diverse epoche storiche",
        platforms: ["netflix"],
        genre: "Comedy/History",
        rating: 8.6
    },
    {
        title: "The Mighty Boosh",
        description: "Le avventure surreali di due amici che lavorano in un negozio di dischi",
        platforms: ["netflix"],
        genre: "Comedy/Fantasy",
        rating: 8.1
    },
    {
        title: "Garth Marenghi's Darkplace",
        description: "Una parodia di serie horror degli anni '80",
        platforms: ["netflix"],
        genre: "Comedy/Horror",
        rating: 7.9
    },
    {
        title: "The League of Gentlemen",
        description: "Serie comica dark ambientata in una città remota",
        platforms: ["netflix"],
        genre: "Comedy/Horror",
        rating: 8.3
    },
    {
        title: "Green Wing",
        description: "La vita in un ospedale britannico",
        platforms: ["netflix"],
        genre: "Comedy",
        rating: 8.0
    },
    {
        title: "The Inbetweeners",
        description: "Le vicende di quattro amici adolescenti goffi",
        platforms: ["netflix"],
        genre: "Comedy",
        rating: 8.2
    },
    {
        title: "Gavin & Stacey",
        description: "La storia d'amore tra un gallese e un'inglese",
        platforms: ["netflix"],
        genre: "Comedy/Romance",
        rating: 8.4
    },
    {
        title: "The Expanse",
        description: "Umanità colonizza il sistema solare in un futuro non troppo lontano",
        platforms: ["prime"],
        genre: "Sci-Fi/Drama",
        rating: 8.5
    },
    {
        title: "The Man in the High Castle",
        description: "Storia alternativa in cui le potenze dell'Asse hanno vinto la Seconda Guerra Mondiale",
        platforms: ["prime"],
        genre: "Sci-Fi/Drama",
        rating: 8.1
    },
    {
        title: "The Marvelous Mrs. Maisel",
        description: "Una casalinga degli anni '50 diventa una comica stand-up",
        platforms: ["prime"],
        genre: "Comedy/Drama",
        rating: 8.7
    },
    {
        title: "The Wheel of Time",
        description: "Una giovane donna scopre di essere la prescelta in un mondo di magia",
        platforms: ["prime"],
        genre: "Fantasy/Adventure",
        rating: 7.5
    },
    {
        title: "The Rings of Power",
        description: "Serie ambientata nella Seconda Era della Terra di Mezzo",
        platforms: ["prime"],
        genre: "Fantasy/Adventure",
        rating: 7.0
    },
    {
        title: "The Handmaid's Tale",
        description: "Distopia in cui le donne sono private dei diritti",
        platforms: ["paramount"],
        genre: "Drama/Sci-Fi",
        rating: 8.4
    },
    {
        title: "Fargo",
        description: "Antologia crime ispirata al film dei fratelli Coen",
        platforms: ["netflix"],
        genre: "Crime/Drama",
        rating: 8.9
    },
    {
        title: "The Great",
        description: "Storia satirica dell'ascesa di Caterina la Grande",
        platforms: ["disney"],
        genre: "Comedy/Drama",
        rating: 8.2
    },
    {
        title: "Squid Game",
        description: "Giochi mortali per un premio in denaro",
        platforms: ["netflix"],
        genre: "Drama/Thriller",
        rating: 8.7
    },
    {
        title: "Dark",
        description: "Misteri e viaggi nel tempo in una piccola città tedesca",
        platforms: ["netflix"],
        genre: "Sci-Fi/Mystery",
        rating: 8.8
    },
    {
        title: "Money Heist",
        description: "Un gruppo di rapinatori pianifica colpi elaborati",
        platforms: ["netflix"],
        genre: "Crime/Thriller",
        rating: 8.3
    },
    {
        title: "The Office (US)",
        description: "La vita quotidiana in un ufficio di Scranton",
        platforms: ["netflix"],
        genre: "Comedy",
        rating: 8.9
    },
    {
        title: "Friends",
        description: "Le avventure di sei amici a New York",
        platforms: ["max"],
        genre: "Comedy",
        rating: 8.9
    },
    {
        title: "WandaVision",
        description: "Wanda e Visione vivono in una realtà alternativa di sitcom",
        platforms: ["disney"],
        genre: "Sci-Fi/Drama",
        rating: 8.0
    },
    {
        title: "Moon Knight",
        description: "Un vigilante con disturbo dissociativo dell'identità",
        platforms: ["disney"],
        genre: "Action/Fantasy",
        rating: 7.9
    },
    {
        title: "Arcane",
        description: "Serie animata basata sul gioco League of Legends",
        platforms: ["netflix"],
        genre: "Animation/Fantasy",
        rating: 9.0
    },
    {
        title: "Shadow and Bone",
        description: "Fantasy basato sui romanzi di Leigh Bardugo",
        platforms: ["netflix"],
        genre: "Fantasy/Adventure",
        rating: 7.7
    },
    {
        title: "Ozark",
        description: "Una famiglia coinvolta nel riciclaggio di denaro",
        platforms: ["netflix"],
        genre: "Crime/Drama",
        rating: 8.5
    },
    {
        title: "RuPaul's Drag Race",
        description: "Competizione tra drag queen",
        platforms: ["paramount"],
        genre: "Reality/Entertainment",
        rating: 8.5
    },
    {
        title: "The Challenge",
        description: "Reality show di competizione fisica",
        platforms: ["paramount"],
        genre: "Reality/Competition",
        rating: 7.5
    },
    {
        title: "The Good Wife",
        description: "Una moglie torna alla sua carriera legale dopo uno scandalo",
        platforms: ["paramount"],
        genre: "Drama/Legal",
        rating: 8.3
    },
    {
        title: "Frasier (2023)",
        description: "Revival della famosa sitcom con Kelsey Grammer",
        platforms: ["paramount"],
        genre: "Comedy",
        rating: 7.4
    },
    {
        title: "Lawmen: Bass Reeves",
        description: "La storia vera del primo marshal nero del West",
        platforms: ["paramount"],
        genre: "Western/Drama",
        rating: 8.2
    },
    {
        title: "Star Trek: Lower Decks",
        description: "Serie animata comica ambientata nell'universo di Star Trek",
        platforms: ["paramount"],
        genre: "Animation/Comedy",
        rating: 8.0
    },
    {
        title: "Star Trek: Prodigy",
        description: "Giovani alieni scoprono una nave abbandonata della Flotta Stellare",
        platforms: ["paramount"],
        genre: "Animation/Adventure",
        rating: 7.8
    },
    {
        title: "Teen Wolf",
        description: "Un adolescente viene morso da un lupo mannaro",
        platforms: ["paramount"],
        genre: "Drama/Fantasy",
        rating: 7.6
    },
    {
        title: "Wolf Pack",
        description: "Adolescenti uniti da un misterioso incendio e un lupo mannaro",
        platforms: ["paramount"],
        genre: "Drama/Fantasy",
        rating: 6.4
    },
    {
        title: "School Spirits",
        description: "Una studentessa indaga sulla propria morte",
        platforms: ["paramount"],
        genre: "Drama/Mystery",
        rating: 7.4
    },
    {
        title: "Rabbit Hole",
        description: "Un esperto di spionaggio aziendale viene incastrato per omicidio",
        platforms: ["paramount"],
        genre: "Thriller/Drama",
        rating: 7.1
    },
    {
        title: "Fatal Attraction",
        description: "Remake della serie basata sul film 'Attrazione Fatale'",
        platforms: ["paramount"],
        genre: "Thriller/Drama",
        rating: 6.9
    },
    {
        title: "Grease: Rise of the Pink Ladies",
        description: "Prequel del musical Grease",
        platforms: ["paramount"],
        genre: "Musical/Drama",
        rating: 6.2
    },
    {
        title: "Fire Country",
        description: "Un detenuto partecipa a un programma di riabilitazione come vigile del fuoco",
        platforms: ["paramount"],
        genre: "Drama/Action",
        rating: 7.4
    },
    {
        title: "CSI: Vegas",
        description: "Reboot della serie CSI ambientato a Las Vegas",
        platforms: ["paramount"],
        genre: "Crime/Drama",
        rating: 7.4
    },
    {
        title: "SWAT",
        description: "Le operazioni di una squadra SWAT a Los Angeles",
        platforms: ["paramount"],
        genre: "Action/Crime",
        rating: 7.6
    }
];

// Get unique genres and platforms
function getUniqueValues(array, key) {
    if (key === 'platforms') {
        return [...new Set(array.flatMap(item => item[key]))];
    }
    if (key === 'genre') {
        // Estrae tutti i generi base dalle stringhe di genere
        const baseGenres = new Set();
        array.forEach(item => {
            const genres = item[key].split(/[\/\s]+/); // Split su slash e spazi
            genres.forEach(genre => {
                // Esclude generi specifici come "MCU"
                if (!['MCU'].includes(genre)) {
                    baseGenres.add(genre);
                }
            });
        });
        return [...baseGenres].sort();
    }
    return [...new Set(array.map(item => item[key]))];
}

// Populate filter dropdowns
function populateFilters() {
    const genres = getUniqueValues(seriesData, 'genre');
    const platforms = getUniqueValues(seriesData, 'platforms');
    
    const genreFilter = document.getElementById('genreFilter');
    const platformFilter = document.getElementById('platformFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    
    // Clear existing options
    genreFilter.innerHTML = '<option value="">Tutti i Generi</option>';
    platformFilter.innerHTML = '<option value="">Tutte le Piattaforme</option>';
    ratingFilter.innerHTML = `
        <option value="">Tutte le Valutazioni</option>
        <option value="9">Eccezionale (9+)</option>
        <option value="8">Ottimo (8+)</option>
        <option value="7">Buono (7+)</option>
        <option value="6">Sufficiente (6+)</option>
    `;
    
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
    
    platforms.forEach(platform => {
        const option = document.createElement('option');
        option.value = platform;
        if (platform === 'hbo') {
            option.textContent = 'HBO';
        } else {
            option.textContent = platform.charAt(0).toUpperCase() + platform.slice(1);
        }
        platformFilter.appendChild(option);
    });
}

// Debounce utility function
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

// Filter series based on all criteria
function filterAndRenderSeries() {
    const searchTerm = cache.filters.search;
    const selectedGenre = document.getElementById('genreFilter')?.value || '';
    const selectedPlatform = document.getElementById('platformFilter')?.value || '';
    const selectedRating = parseFloat(document.getElementById('ratingFilter')?.value) || 0;

    // Show loading state
    const seriesList = document.getElementById('seriesList');
    if (seriesList) {
        seriesList.innerHTML = '<div class="loading">Ricerca in corso...</div>';
    }

    // Use requestAnimationFrame for smooth UI updates
    requestAnimationFrame(() => {
        const filteredSeries = seriesData.filter(show => {
            if (!show || typeof show !== 'object') return false;
            
            const showTitle = (show.title || '').toLowerCase();
            const showDescription = (show.description || '').toLowerCase();
            const showGenres = (show.genre || '').split(/[\/\s]+/);
            const showPlatforms = Array.isArray(show.platforms) ? show.platforms : [];
            const showRating = parseFloat(show.rating) || 0;
            
            const matchesSearch = !searchTerm || 
                showTitle.includes(searchTerm) ||
                showDescription.includes(searchTerm);
            
            const matchesGenre = !selectedGenre || showGenres.includes(selectedGenre);
            const matchesPlatform = !selectedPlatform || showPlatforms.includes(selectedPlatform);
            const matchesRating = !selectedRating || showRating >= selectedRating;
            
            return matchesSearch && matchesGenre && matchesPlatform && matchesRating;
        });
        
        // Sort and render results
        const sortedSeries = sortSeriesAlphabetically(filteredSeries);
        renderSeries(sortedSeries);
        
        // Update no results message
        const noResults = document.getElementById('noResults');
        if (noResults) {
            noResults.style.display = sortedSeries.length === 0 ? 'block' : 'none';
        }

        // Remove loading state
        const searchContainer = document.querySelector('.search-container');
        searchContainer.classList.remove('searching');
    });
}

// Sort series alphabetically
function sortSeriesAlphabetically(series) {
    return series.sort((a, b) => a.title.localeCompare(b.title));
}

// Get platform icon
function getPlatformIcon(platform) {
    const platformNames = {
        'netflix': 'Netflix',
        'prime': 'Prime Video',
        'hbo': 'HBO',
        'disney': 'Disney+',
        'amc': 'AMC',
        'apple': 'Apple TV+',
        'hulu': 'Hulu',
        'max': 'Max',
        'paramount': 'Paramount+'
    };

    return `
        <div class="platform-icon" title="${platformNames[platform] || platform}">
            <img src="assets/images/${platform}.png" alt="${platformNames[platform] || platform}" loading="lazy">
        </div>
    `;
}

// Render series cards
function renderSeries(series) {
    const seriesList = document.getElementById('seriesList');
    const startIndex = (cache.currentPage - 1) * config.itemsPerPage;
    const endIndex = startIndex + config.itemsPerPage;
    const seriesToShow = series.slice(startIndex, endIndex);
    
    console.log(`Showing series from index ${startIndex} to ${endIndex}`);
    console.log(`Total series: ${series.length}, Current page: ${cache.currentPage}`);
    
    // Aggiungo il contatore delle serie trovate sopra la lista
    const resultsCounter = document.querySelector('.results-counter') || document.createElement('div');
    resultsCounter.className = 'results-counter';
    resultsCounter.innerHTML = `
        <div class="counter-container">
            <h2 class="counter-text">
                <span class="counter-number">${series.length}</span> serie trovate
            </h2>
        </div>
    `;
    
    // Inserisco il contatore prima della lista delle serie
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer && !document.querySelector('.results-counter')) {
        searchContainer.after(resultsCounter);
    }
    
    if (series.length === 0) {
        seriesList.innerHTML = `
            <div class="no-results">
                <h3>Nessuna serie trovata</h3>
                <p>Prova a modificare i filtri di ricerca</p>
            </div>
        `;
        return;
    }
    
    seriesList.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    seriesToShow.forEach((show, index) => {
        const seriesCard = document.createElement('div');
        seriesCard.className = 'series-card';
        seriesCard.style.animationDelay = `${Math.min(index * 0.1, 1)}s`;
        
        // Sostituisce gli slash con il simbolo |
        const formattedGenre = show.genre.replace(/\//g, ' | ');
        
        seriesCard.innerHTML = `
            <div class="series-info">
                <h3>${show.title}</h3>
                <div class="rating">
                    <span class="stars">${"★".repeat(Math.round(show.rating/2))}</span>
                    <span class="rating-number">${show.rating}/10</span>
                </div>
                <p class="description">${show.description}</p>
                <p class="genre">${formattedGenre}</p>
            </div>
            <div class="platforms">
                ${show.platforms.map(platform => getPlatformIcon(platform)).join('')}
            </div>
        `;
        
        fragment.appendChild(seriesCard);
    });
    
    seriesList.appendChild(fragment);
    updatePagination(series.length);
}

// Update pagination
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / config.itemsPerPage);
    const pagination = document.getElementById('pagination');
    
    console.log(`Total items: ${totalItems}, Total pages: ${totalPages}`);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button class="page-btn prev" ${cache.currentPage === 1 ? 'disabled' : ''} 
                onclick="handlePageChange(${cache.currentPage - 1})">
            ←
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || 
            (i >= cache.currentPage - 2 && i <= cache.currentPage + 2)) {
            paginationHTML += `
                <button class="page-btn ${i === cache.currentPage ? 'active' : ''}"
                        onclick="handlePageChange(${i})">
                    ${i}
                </button>
            `;
        } else if (i === cache.currentPage - 3 || i === cache.currentPage + 3) {
            paginationHTML += '<span class="page-dots">...</span>';
        }
    }
    
    // Next button
    paginationHTML += `
        <button class="page-btn next" ${cache.currentPage === totalPages ? 'disabled' : ''} 
                onclick="handlePageChange(${cache.currentPage + 1})">
            →
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Change page
window.handlePageChange = function(page) {
    console.log('Changing to page:', page);
    
    // Mantieni i filtri correnti
    const searchTerm = cache.filters.search;
    const selectedGenre = document.getElementById('genreFilter')?.value || '';
    const selectedPlatform = document.getElementById('platformFilter')?.value || '';
    const selectedRating = parseFloat(document.getElementById('ratingFilter')?.value) || 0;
    
    const filteredSeries = seriesData.filter(show => {
        if (!show || typeof show !== 'object') return false;
        
        const showTitle = (show.title || '').toLowerCase();
        const showDescription = (show.description || '').toLowerCase();
        const showGenres = (show.genre || '').split(/[\/\s]+/);
        const showPlatforms = Array.isArray(show.platforms) ? show.platforms : [];
        const showRating = parseFloat(show.rating) || 0;
        
        const matchesSearch = !searchTerm || 
            showTitle.includes(searchTerm) ||
            showDescription.includes(searchTerm);
        
        const matchesGenre = !selectedGenre || showGenres.includes(selectedGenre);
        const matchesPlatform = !selectedPlatform || showPlatforms.includes(selectedPlatform);
        const matchesRating = !selectedRating || showRating >= selectedRating;
        
        return matchesSearch && matchesGenre && matchesPlatform && matchesRating;
    });
    
    const totalPages = Math.ceil(filteredSeries.length / config.itemsPerPage);
    
    if (page >= 1 && page <= totalPages) {
        cache.currentPage = page;
        renderSeries(sortSeriesAlphabetically(filteredSeries));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Header scroll behavior
function handleHeaderScroll() {
    const header = document.querySelector('.header');
    const scrollY = window.scrollY;
    
    if (scrollY > 50) {
        header.classList.add('compact');
    } else {
        header.classList.remove('compact');
    }
}

// Scroll button behavior
function updateScrollButton() {
    const scrollButton = document.querySelector('.scroll-bottom-btn');
    if (!scrollButton) return;
    
    const footer = document.querySelector('.footer');
    const footerPosition = footer.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    if (footerPosition <= windowHeight) {
        scrollButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 11l-5-5-5 5M17 18l-5-5-5 5"/>
            </svg>
            Torna in alto
        `;
        scrollButton.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        scrollButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
            </svg>
            Scorri in basso
        `;
        scrollButton.onclick = () => footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Theme toggle functionality
function initializeTheme() {
    const savedTheme = security.secureStorage.get('theme') || 'light';
    // Validate theme value to prevent injection
    const validTheme = ['light', 'dark'].includes(savedTheme) ? savedTheme : 'light';
    document.documentElement.setAttribute('data-theme', validTheme);
    updateThemeIcon(validTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    security.secureStorage.set('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;
    
    // Use DOMPurify or similar in production for SVG sanitization
    const darkIcon = `<svg viewBox="0 0 24 24" stroke="currentColor">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>`;
    
    const lightIcon = `<svg viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>`;
    
    themeToggle.innerHTML = theme === 'dark' ? darkIcon : lightIcon;
}

// Secure event handling
function addSecureEventListener(element, event, handler) {
    if (!element) return;
    
    element.addEventListener(event, function(e) {
        // Prevent default only if needed
        // e.preventDefault();
        
        // Call the handler with the event
        handler(e);
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Populate filters
    populateFilters();
    
    // Set up event listeners with security measures
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        // Add immediate search on input with a small debounce
        const debouncedSearch = debounce(() => {
            const searchTerm = security.sanitizeInput(searchInput.value.toLowerCase().trim());
            cache.filters.search = searchTerm;
            cache.currentPage = 1;
            filterAndRenderSeries();
        }, 150); // Reduced debounce time for more responsiveness

        addSecureEventListener(searchInput, 'input', (e) => {
            const searchContainer = document.querySelector('.search-container');
            searchContainer.classList.add('searching');
            debouncedSearch();
        });

        // Add search on form submit
        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            addSecureEventListener(searchForm, 'submit', (e) => {
                e.preventDefault();
                const searchTerm = security.sanitizeInput(searchInput.value.toLowerCase().trim());
                cache.filters.search = searchTerm;
                cache.currentPage = 1;
                filterAndRenderSeries();
            });
        }
    }

    // Set up other event listeners
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        addSecureEventListener(select, 'change', filterAndRenderSeries);
    });

    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        addSecureEventListener(clearFiltersBtn, 'click', () => {
            // Reset all filters
            document.getElementById('searchInput').value = '';
            document.getElementById('genreFilter').value = '';
            document.getElementById('platformFilter').value = '';
            document.getElementById('ratingFilter').value = '';
            
            // Reset cache
            cache.filters = {
                search: '',
                genre: '',
                platform: '',
                rating: 0
            };
            cache.currentPage = 1;
            
            // Update UI
            filterAndRenderSeries();
        });
    }

    // Initial render
    filterAndRenderSeries();

    // Set up scroll handlers
    window.addEventListener('scroll', () => {
        handleHeaderScroll();
        updateScrollButton();
    });
    
    // Initialize theme
    initializeTheme();
    
    // Set up theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        addSecureEventListener(themeToggle, 'click', toggleTheme);
    }
}); 