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
        platforms: ["netflix", "max"],
        genre: "Crime/Drama",
        rating: 9.5
    },
    {
        title: "Game of Thrones",
        description: "Lotte di potere in un mondo fantasy",
        platforms: ["hbo", "max"],
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
        genre: "Sci-Fi/Horror",
        rating: 8.7
    },
    {
        title: "The Last of Us",
        description: "Un contrabbandiere e una ragazza attraversano un'America post-apocalittica",
        platforms: ["hbo", "max"],
        genre: "Drama/Horror",
        rating: 8.8
    },
    {
        title: "House of the Dragon",
        description: "La storia della casa Targaryen, 200 anni prima di Game of Thrones",
        platforms: ["hbo", "max"],
        genre: "Fantasy/Drama",
        rating: 8.5
    },
    {
        title: "Succession",
        description: "Lotte di potere in una famiglia mediatica",
        platforms: ["hbo", "max"],
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
        platforms: ["disney", "hulu"],
        genre: "Drama/Comedy",
        rating: 8.8
    },
    {
        title: "Better Call Saul",
        description: "L'origine dell'avvocato Saul Goodman",
        platforms: ["netflix", "max"],
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
        genre: "Comedy/Fantasy",
        rating: 8.2
    },
    {
        title: "The White Lotus",
        description: "Intrighi e drammi in un resort di lusso",
        platforms: ["hbo", "max"],
        genre: "Drama/Comedy",
        rating: 8.2
    },
    {
        title: "Only Murders in the Building",
        description: "Tre vicini indagano su un omicidio nel loro palazzo",
        platforms: ["disney", "hulu"],
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
        title: "For All Mankind",
        description: "Storia alternativa della corsa allo spazio",
        platforms: ["apple"],
        genre: "Sci-Fi/Drama",
        rating: 8.1
    },
    {
        title: "Silo",
        description: "La vita in un silo sotterraneo nasconde oscuri segreti",
        platforms: ["apple"],
        genre: "Sci-Fi/Drama",
        rating: 8.1
    },
    {
        title: "Foundation",
        description: "Adattamento della saga di Asimov sul crollo di un impero galattico",
        platforms: ["apple"],
        genre: "Sci-Fi/Drama",
        rating: 7.9
    },
    {
        title: "Monarch: Legacy of Monsters",
        description: "Serie ambientata nel MonsterVerse di Godzilla",
        platforms: ["apple"],
        genre: "Sci-Fi/Action",
        rating: 7.7
    },
    {
        title: "Masters of the Air",
        description: "La storia della 100ª Divisione Bombardieri durante la Seconda Guerra Mondiale",
        platforms: ["apple"],
        genre: "War/Drama",
        rating: 8.5
    },
    {
        title: "True Detective: Night Country",
        description: "Investigatrici indagano su misteriose sparizioni in Alaska",
        platforms: ["hbo", "max"],
        genre: "Crime/Mystery",
        rating: 8.2
    },
    {
        title: "The Gilded Age",
        description: "Drammi e intrighi nella New York di fine '800",
        platforms: ["hbo", "max"],
        genre: "Drama/History",
        rating: 8.0
    },
    {
        title: "House of Cards",
        description: "Intrighi politici a Washington D.C.",
        platforms: ["netflix"],
        genre: "Drama/Political",
        rating: 8.7
    },
    {
        title: "Black Mirror",
        description: "Antologia sulla tecnologia e le sue conseguenze",
        platforms: ["netflix"],
        genre: "Sci-Fi/Drama",
        rating: 8.8
    },
    {
        title: "The Witcher",
        description: "Le avventure dello strigo Geralt di Rivia",
        platforms: ["netflix"],
        genre: "Fantasy/Action",
        rating: 8.1
    },
    {
        title: "Bridgerton",
        description: "Romance e scandali nell'alta società londinese",
        platforms: ["netflix"],
        genre: "Drama/Romance",
        rating: 7.9
    },
    {
        title: "The Diplomat",
        description: "Una diplomatica americana affronta crisi internazionali",
        platforms: ["netflix"],
        genre: "Drama/Political",
        rating: 7.8
    },
    {
        title: "Il problema dei 3 corpi",
        description: "Adattamento del romanzo di fantascienza di Liu Cixin",
        platforms: ["netflix"],
        genre: "Sci-Fi/Drama",
        rating: 8.2
    },
    {
        title: "Avatar: The Last Airbender",
        description: "Adattamento live-action della serie animata sul giovane Avatar Aang",
        platforms: ["netflix"],
        genre: "Fantasy/Adventure",
        rating: 8.1
    },
    {
        title: "One Piece",
        description: "Adattamento live-action del famoso manga sulla ciurma di pirati di Cappello di Paglia",
        platforms: ["netflix"],
        genre: "Adventure/Fantasy",
        rating: 8.4
    },
    {
        title: "Reacher",
        description: "Un ex investigatore militare risolve casi complessi",
        platforms: ["prime"],
        genre: "Action/Crime",
        rating: 8.2
    },
    {
        title: "The Marvelous Mrs. Maisel",
        description: "Una casalinga diventa comica stand-up",
        platforms: ["prime"],
        genre: "Comedy/Drama",
        rating: 8.7
    },
    {
        title: "Fleabag",
        description: "Una donna alle prese con la vita a Londra",
        platforms: ["prime"],
        genre: "Comedy/Drama",
        rating: 8.7
    },
    {
        title: "Good Omens",
        description: "Un angelo e un demone cercano di prevenire l'Apocalisse",
        platforms: ["prime"],
        genre: "Comedy/Fantasy",
        rating: 8.1
    },
    {
        title: "The Wheel of Time",
        description: "Fantasy epico basato sui romanzi di Robert Jordan",
        platforms: ["prime"],
        genre: "Fantasy/Adventure",
        rating: 7.1
    },
    {
        title: "Invincible",
        description: "Serie animata su un giovane supereroe",
        platforms: ["prime"],
        genre: "Animation/Action",
        rating: 8.7
    },
    {
        title: "The Rings of Power",
        description: "Serie ambientata nella Seconda Era della Terra di Mezzo",
        platforms: ["prime"],
        genre: "Fantasy/Adventure",
        rating: 7.0
    },
    {
        title: "Ahsoka",
        description: "Le avventure della Jedi Ahsoka Tano",
        platforms: ["disney"],
        genre: "Sci-Fi/Action",
        rating: 7.8
    },
    {
        title: "Loki",
        description: "Le avventure del dio dell'inganno attraverso il multiverso",
        platforms: ["disney"],
        genre: "Sci-Fi/Fantasy",
        rating: 8.2
    },
    {
        title: "Percy Jackson e gli dei dell'Olimpo",
        description: "Le avventure di un semidio moderno",
        platforms: ["disney"],
        genre: "Fantasy/Adventure",
        rating: 7.6
    },
    {
        title: "The Handmaid's Tale",
        description: "Distopia in cui le donne sono private dei diritti",
        platforms: ["hulu"],
        genre: "Drama/Sci-Fi",
        rating: 8.4
    },
    {
        title: "Fargo",
        description: "Antologia crime ispirata al film dei fratelli Coen",
        platforms: ["hulu", "netflix"],
        genre: "Crime/Drama",
        rating: 8.9
    },
    {
        title: "The Great",
        description: "Storia satirica dell'ascesa di Caterina la Grande",
        platforms: ["hulu"],
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
        platforms: ["netflix", "prime"],
        genre: "Comedy",
        rating: 8.9
    },
    {
        title: "Friends",
        description: "Le avventure di sei amici a New York",
        platforms: ["netflix", "max"],
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
        title: "The Last Kingdom",
        description: "Guerre e politica nell'Inghilterra medievale",
        platforms: ["netflix"],
        genre: "Action/Drama",
        rating: 8.5
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
        platforms: ["hbo", "max"],
        genre: "Crime/Drama",
        rating: 9.2
    },
    {
        title: "Westworld",
        description: "Un parco a tema futuristico con robot senzienti",
        platforms: ["hbo", "max"],
        genre: "Sci-Fi/Drama",
        rating: 8.6
    },
    {
        title: "Barry",
        description: "Un sicario che sogna di diventare attore",
        platforms: ["hbo", "max"],
        genre: "Comedy/Drama",
        rating: 8.4
    },
    {
        title: "Euphoria",
        description: "Le difficoltà dell'adolescenza moderna",
        platforms: ["hbo", "max"],
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
        title: "Transformers: Prime",
        description: "Gli Autobot proteggono la Terra dai Decepticon in questa serie animata",
        platforms: ["netflix", "disney"],
        genre: "Animation/Action",
        rating: 8.5
    },
    {
        title: "Transformers: Robots in Disguise",
        description: "Bumblebee guida un nuovo team di Autobot per catturare i Decepticon fuggiti",
        platforms: ["netflix", "disney"],
        genre: "Animation/Action",
        rating: 7.8
    },
    {
        title: "Transformers: Cyberverse",
        description: "Le avventure di Bumblebee e Windblade nell'universo dei Transformers",
        platforms: ["netflix", "disney"],
        genre: "Animation/Action",
        rating: 7.6
    },
    {
        title: "Transformers: Rescue Bots",
        description: "Gli Autobot aiutano gli umani in situazioni di emergenza",
        platforms: ["netflix", "disney"],
        genre: "Animation/Action",
        rating: 7.4
    },
    {
        title: "Transformers: War for Cybertron",
        description: "La guerra civile tra Autobot e Decepticon sul loro pianeta natale",
        platforms: ["netflix"],
        genre: "Animation/Action",
        rating: 7.9
    },
    {
        title: "Transformers: EarthSpark",
        description: "Una nuova generazione di Transformers nati sulla Terra",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 7.7
    },
    {
        title: "Transformers: Beast Wars",
        description: "Gli eredi degli Autobot e Decepticon combattono in forma di animali",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 8.2
    },
    {
        title: "Transformers: Animated",
        description: "Gli Autobot proteggono Detroit dai Decepticon in uno stile animato unico",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 7.8
    },
    {
        title: "Transformers: Energon",
        description: "La guerra continua tra Autobot e Decepticon per il controllo dell'Energon",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 7.3
    },
    {
        title: "Transformers: Armada",
        description: "Gli Autobot e i Mini-Con combattono contro i Decepticon",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 7.5
    },
    {
        title: "Transformers: Cybertron",
        description: "Gli Autobot cercano le chiavi del Cyber Planet per salvare l'universo",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 7.4
    },
    {
        title: "Transformers: The Last Knight",
        description: "Film live-action che esplora la storia segreta dei Transformers sulla Terra",
        platforms: ["netflix", "paramount"],
        genre: "Action/Sci-Fi",
        rating: 5.2
    },
    {
        title: "Transformers: Bumblebee",
        description: "Le origini di Bumblebee e il suo legame con una giovane ragazza",
        platforms: ["netflix", "paramount"],
        genre: "Action/Sci-Fi",
        rating: 6.7
    },
    {
        title: "Transformers: Rise of the Beasts",
        description: "Gli Autobot si alleano con i Maximals per combattere una minaccia cosmica",
        platforms: ["paramount"],
        genre: "Action/Sci-Fi",
        rating: 6.1
    },
    {
        title: "Transformers: Age of Extinction",
        description: "Gli Autobot sono braccati da un'unità governativa segreta",
        platforms: ["netflix", "paramount"],
        genre: "Action/Sci-Fi",
        rating: 5.6
    },
    {
        title: "Transformers: Dark of the Moon",
        description: "Gli Autobot scoprono un segreto nascosto sulla Luna",
        platforms: ["netflix", "paramount"],
        genre: "Action/Sci-Fi",
        rating: 6.2
    },
    {
        title: "Transformers: Revenge of the Fallen",
        description: "Gli Autobot combattono contro un antico nemico risvegliato",
        platforms: ["netflix", "paramount"],
        genre: "Action/Sci-Fi",
        rating: 5.9
    },
    {
        title: "Transformers (2007)",
        description: "Il primo film live-action che introduce i Transformers al mondo",
        platforms: ["netflix", "paramount"],
        genre: "Action/Sci-Fi",
        rating: 7.0
    },
    {
        title: "Transformers: The Movie (1986)",
        description: "Film d'animazione classico che segna la morte di Optimus Prime",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 7.3
    },
    {
        title: "Transformers: Generation 1",
        description: "La serie animata originale che ha lanciato il franchise",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 7.8
    },
    {
        title: "Transformers: Headmasters",
        description: "Spin-off di Generation 1 che introduce i Transformers con teste umane",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 7.2
    },
    {
        title: "Transformers: Masterforce",
        description: "Serie che introduce i Pretenders, Transformers che si travestono da umani",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 7.1
    },
    {
        title: "Transformers: Victory",
        description: "L'ultima serie della Generation 1 giapponese",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 7.0
    },
    {
        title: "Transformers: Zone",
        description: "Serie OVA che conclude la saga della Generation 1 giapponese",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 6.9
    },
    {
        title: "Transformers: Beast Machines",
        description: "Sequel di Beast Wars che esplora il ritorno su Cybertron",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 7.5
    },
    {
        title: "Transformers: Robots in Disguise (2001)",
        description: "Serie che introduce i Vehicon e il concetto di Transformers che si trasformano in veicoli",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 7.2
    },
    {
        title: "Transformers: Universe",
        description: "Serie che unisce personaggi di diverse continuity dei Transformers",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 6.8
    },
    {
        title: "Transformers: Combiner Wars",
        description: "Serie che esplora i Combiner, Transformers che si uniscono per formare esseri più potenti",
        platforms: ["netflix"],
        genre: "Animation/Action",
        rating: 7.1
    },
    {
        title: "Transformers: Titans Return",
        description: "Sequel di Combiner Wars che introduce i Titan Masters",
        platforms: ["netflix"],
        genre: "Animation/Action",
        rating: 7.0
    },
    {
        title: "Transformers: Power of the Primes",
        description: "Conclusione della trilogia che introduce i Prime Masters",
        platforms: ["netflix"],
        genre: "Animation/Action",
        rating: 6.9
    },
    {
        title: "Transformers: Cyberverse Adventures",
        description: "Serie di cortometraggi che accompagna Transformers: Cyberverse",
        platforms: ["netflix", "disney"],
        genre: "Animation/Action",
        rating: 7.2
    },
    {
        title: "Transformers: BotBots",
        description: "Serie comica sui Transformers più piccoli e goffi",
        platforms: ["netflix"],
        genre: "Animation/Comedy",
        rating: 6.8
    },
    {
        title: "Transformers: Rescue Bots Academy",
        description: "Spin-off di Rescue Bots che segue i giovani Rescue Bots in addestramento",
        platforms: ["netflix", "disney"],
        genre: "Animation/Action",
        rating: 7.0
    },
    {
        title: "Transformers: War for Cybertron - Siege",
        description: "Prima parte della trilogia che esplora la guerra civile su Cybertron",
        platforms: ["netflix"],
        genre: "Animation/Action",
        rating: 7.8
    },
    {
        title: "Transformers: War for Cybertron - Earthrise",
        description: "Seconda parte della trilogia che segue gli Autobot sulla Terra",
        platforms: ["netflix"],
        genre: "Animation/Action",
        rating: 7.7
    },
    {
        title: "Transformers: War for Cybertron - Kingdom",
        description: "Conclusione della trilogia che unisce Autobot, Decepticon e Maximals",
        platforms: ["netflix"],
        genre: "Animation/Action",
        rating: 7.9
    },
    {
        title: "Transformers: BotBots - Mission to Earth",
        description: "Film speciale che segue i BotBots in una missione sulla Terra",
        platforms: ["netflix"],
        genre: "Animation/Comedy",
        rating: 6.5
    },
    {
        title: "Transformers: Cyberverse - The Movie",
        description: "Film speciale che conclude la serie Cyberverse",
        platforms: ["netflix", "disney"],
        genre: "Animation/Action",
        rating: 7.6
    },
    {
        title: "Transformers: Prime - Beast Hunters",
        description: "Terza stagione di Prime che introduce i Predacons",
        platforms: ["netflix", "disney"],
        genre: "Animation/Action",
        rating: 8.3
    },
    {
        title: "Transformers: Prime - The Game",
        description: "Adattamento videoludico della serie Prime",
        platforms: ["netflix", "disney"],
        genre: "Animation/Action",
        rating: 7.2
    },
    {
        title: "Transformers: Rescue Bots - The Movie",
        description: "Film speciale che unisce i Rescue Bots con i Transformers classici",
        platforms: ["netflix", "disney"],
        genre: "Animation/Action",
        rating: 7.1
    },
    {
        title: "Transformers: The Last Knight - Prequel",
        description: "Cortometraggi che precedono gli eventi di The Last Knight",
        platforms: ["netflix", "paramount"],
        genre: "Action/Sci-Fi",
        rating: 5.8
    },
    {
        title: "Transformers: Bumblebee - Prequel",
        description: "Cortometraggi che precedono gli eventi di Bumblebee",
        platforms: ["netflix", "paramount"],
        genre: "Action/Sci-Fi",
        rating: 6.5
    },
    {
        title: "Transformers: Rise of the Beasts - Prequel",
        description: "Cortometraggi che precedono gli eventi di Rise of the Beasts",
        platforms: ["paramount"],
        genre: "Action/Sci-Fi",
        rating: 6.0
    },
    {
        title: "Transformers: Age of Extinction - Prequel",
        description: "Cortometraggi che precedono gli eventi di Age of Extinction",
        platforms: ["netflix", "paramount"],
        genre: "Action/Sci-Fi",
        rating: 5.7
    },
    {
        title: "Transformers: Dark of the Moon - Prequel",
        description: "Cortometraggi che precedono gli eventi di Dark of the Moon",
        platforms: ["netflix", "paramount"],
        genre: "Action/Sci-Fi",
        rating: 6.0
    },
    {
        title: "Transformers: Revenge of the Fallen - Prequel",
        description: "Cortometraggi che precedono gli eventi di Revenge of the Fallen",
        platforms: ["netflix", "paramount"],
        genre: "Action/Sci-Fi",
        rating: 5.8
    },
    {
        title: "Transformers (2007) - Prequel",
        description: "Cortometraggi che precedono gli eventi del primo film",
        platforms: ["netflix", "paramount"],
        genre: "Action/Sci-Fi",
        rating: 6.8
    },
    {
        title: "Transformers: The Movie (1986) - Prequel",
        description: "Cortometraggi che precedono gli eventi del film d'animazione del 1986",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 7.0
    },
    {
        title: "Transformers: Generation 1 - The Movie Prequel",
        description: "Cortometraggi che collegano la serie TV al film del 1986",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 7.2
    },
    {
        title: "Transformers: Headmasters - Prequel",
        description: "Cortometraggi che introducono i concetti dei Headmasters",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 7.0
    },
    {
        title: "Transformers: Masterforce - Prequel",
        description: "Cortometraggi che introducono i concetti dei Pretenders",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 6.9
    },
    {
        title: "Transformers: Victory - Prequel",
        description: "Cortometraggi che introducono i personaggi di Victory",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 6.8
    },
    {
        title: "Transformers: Zone - Prequel",
        description: "Cortometraggi che introducono i concetti di Zone",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 6.7
    },
    {
        title: "Transformers: Beast Machines - Prequel",
        description: "Cortometraggi che collegano Beast Wars a Beast Machines",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 7.3
    },
    {
        title: "Transformers: Robots in Disguise (2001) - Prequel",
        description: "Cortometraggi che introducono i Vehicon",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 7.0
    },
    {
        title: "Transformers: Universe - Prequel",
        description: "Cortometraggi che introducono il concetto di multiverso dei Transformers",
        platforms: ["netflix", "paramount"],
        genre: "Animation/Action",
        rating: 6.7
    },
    {
        title: "Transformers: Combiner Wars - Prequel",
        description: "Cortometraggi che introducono i Combiner",
        platforms: ["netflix"],
        genre: "Animation/Action",
        rating: 7.0
    },
    {
        title: "Transformers: Titans Return - Prequel",
        description: "Cortometraggi che introducono i Titan Masters",
        platforms: ["netflix"],
        genre: "Animation/Action",
        rating: 6.9
    },
    {
        title: "Transformers: Power of the Primes - Prequel",
        description: "Cortometraggi che introducono i Prime Masters",
        platforms: ["netflix"],
        genre: "Animation/Action",
        rating: 6.8
    },
    {
        title: "Transformers: Cyberverse Adventures - Prequel",
        description: "Cortometraggi che introducono i personaggi di Cyberverse",
        platforms: ["netflix", "disney"],
        genre: "Animation/Action",
        rating: 7.0
    },
    {
        title: "Transformers: BotBots - Prequel",
        description: "Cortometraggi che introducono i BotBots",
        platforms: ["netflix"],
        genre: "Animation/Comedy",
        rating: 6.6
    },
    {
        title: "Transformers: Rescue Bots Academy - Prequel",
        description: "Cortometraggi che introducono i giovani Rescue Bots",
        platforms: ["netflix", "disney"],
        genre: "Animation/Action",
        rating: 6.9
    },
    {
        title: "Transformers: War for Cybertron - Siege - Prequel",
        description: "Cortometraggi che introducono la guerra civile su Cybertron",
        platforms: ["netflix"],
        genre: "Animation/Action",
        rating: 7.6
    },
    {
        title: "Transformers: War for Cybertron - Earthrise - Prequel",
        description: "Cortometraggi che introducono l'arrivo degli Autobot sulla Terra",
        platforms: ["netflix"],
        genre: "Animation/Action",
        rating: 7.5
    },
    {
        title: "Transformers: War for Cybertron - Kingdom - Prequel",
        description: "Cortometraggi che introducono l'incontro con i Maximals",
        platforms: ["netflix"],
        genre: "Animation/Action",
        rating: 7.7
    },
    {
        title: "Transformers: BotBots - Mission to Earth - Prequel",
        description: "Cortometraggi che introducono la missione dei BotBots sulla Terra",
        platforms: ["netflix"],
        genre: "Animation/Comedy",
        rating: 6.4
    },
    {
        title: "Transformers: Cyberverse - The Movie - Prequel",
        description: "Cortometraggi che introducono gli eventi del film Cyberverse",
        platforms: ["netflix", "disney"],
        genre: "Animation/Action",
        rating: 7.4
    },
    {
        title: "Transformers: Prime - Beast Hunters - Prequel",
        description: "Cortometraggi che introducono i Predacons",
        platforms: ["netflix", "disney"],
        genre: "Animation/Action",
        rating: 8.1
    },
    {
        title: "Transformers: Prime - The Game - Prequel",
        description: "Cortometraggi che introducono gli eventi del videogioco",
        platforms: ["netflix", "disney"],
        genre: "Animation/Action",
        rating: 7.0
    },
    {
        title: "Transformers: Rescue Bots - The Movie - Prequel",
        description: "Cortometraggi che introducono l'incontro con i Transformers classici",
        platforms: ["netflix", "disney"],
        genre: "Animation/Action",
        rating: 7.0
    },
    {
        title: "Yellowjackets",
        description: "Sopravvissute a un incidente aereo si confrontano con il loro passato",
        platforms: ["paramount", "showtime"],
        genre: "Drama/Mystery",
        rating: 8.1
    },
    {
        title: "Tulsa King",
        description: "Un mafioso di New York inizia una nuova vita a Tulsa",
        platforms: ["paramount"],
        genre: "Crime/Drama",
        rating: 7.8
    },
    {
        title: "1923",
        description: "Prequel di Yellowstone ambientato nel Montana del 1923",
        platforms: ["paramount"],
        genre: "Drama/Western",
        rating: 8.2
    },
    {
        title: "1883",
        description: "Prequel di Yellowstone sulla famiglia Dutton",
        platforms: ["paramount"],
        genre: "Drama/Western",
        rating: 8.3
    },
    {
        title: "Mayor of Kingstown",
        description: "Una famiglia gestisce il business delle carceri in Michigan",
        platforms: ["paramount"],
        genre: "Crime/Drama",
        rating: 7.9
    },
    {
        title: "Evil",
        description: "Un team investiga fenomeni soprannaturali",
        platforms: ["paramount", "netflix"],
        genre: "Horror/Mystery",
        rating: 7.8
    },
    {
        title: "Star Trek: Strange New Worlds",
        description: "Le avventure dell'Enterprise prima di Star Trek: The Original Series",
        platforms: ["paramount"],
        genre: "Sci-Fi/Adventure",
        rating: 8.4
    },
    {
        title: "Star Trek: Discovery",
        description: "Una nuova serie Star Trek ambientata nel futuro",
        platforms: ["paramount"],
        genre: "Sci-Fi/Adventure",
        rating: 7.8
    },
    {
        title: "Star Trek: Picard",
        description: "Jean-Luc Picard torna all'avventura",
        platforms: ["paramount"],
        genre: "Sci-Fi/Adventure",
        rating: 7.9
    },
    {
        title: "Halo",
        description: "Adattamento della serie di videogiochi",
        platforms: ["paramount"],
        genre: "Sci-Fi/Action",
        rating: 7.5
    },
    {
        title: "The Good Fight",
        description: "Spin-off di The Good Wife su una società legale",
        platforms: ["paramount"],
        genre: "Drama/Legal",
        rating: 8.2
    },
    {
        title: "The Offer",
        description: "La storia dietro la realizzazione de Il Padrino",
        platforms: ["paramount"],
        genre: "Drama/Biography",
        rating: 7.8
    },
    {
        title: "SEAL Team",
        description: "Le missioni di un team delle forze speciali",
        platforms: ["paramount", "netflix"],
        genre: "Action/Drama",
        rating: 7.9
    },
    {
        title: "NCIS",
        description: "Indagini della Naval Criminal Investigative Service",
        platforms: ["paramount", "netflix"],
        genre: "Crime/Drama",
        rating: 7.7
    },
    {
        title: "NCIS: Los Angeles",
        description: "Spin-off di NCIS ambientato a Los Angeles",
        platforms: ["paramount", "netflix"],
        genre: "Crime/Drama",
        rating: 7.5
    },
    {
        title: "NCIS: New Orleans",
        description: "Spin-off di NCIS ambientato a New Orleans",
        platforms: ["paramount", "netflix"],
        genre: "Crime/Drama",
        rating: 7.4
    },
    {
        title: "Criminal Minds",
        description: "Un team dell'FBI analizza la mente dei criminali",
        platforms: ["paramount", "netflix"],
        genre: "Crime/Drama",
        rating: 8.1
    },
    {
        title: "Criminal Minds: Evolution",
        description: "Continuazione di Criminal Minds",
        platforms: ["paramount"],
        genre: "Crime/Drama",
        rating: 7.8
    },
    {
        title: "FBI",
        description: "Le indagini dell'FBI a New York",
        platforms: ["paramount", "netflix"],
        genre: "Crime/Drama",
        rating: 7.6
    },
    {
        title: "FBI: Most Wanted",
        description: "Spin-off di FBI sulla caccia ai criminali più ricercati",
        platforms: ["paramount", "netflix"],
        genre: "Crime/Drama",
        rating: 7.5
    },
    {
        title: "FBI: International",
        description: "Spin-off di FBI ambientato in Europa",
        platforms: ["paramount", "netflix"],
        genre: "Crime/Drama",
        rating: 7.4
    },
    {
        title: "Blue Bloods",
        description: "Una famiglia di poliziotti a New York",
        platforms: ["paramount", "netflix"],
        genre: "Crime/Drama",
        rating: 7.8
    },
    {
        title: "The Equalizer",
        description: "Un ex agente della CIA aiuta persone in difficoltà",
        platforms: ["paramount", "netflix"],
        genre: "Action/Crime",
        rating: 7.3
    },
    {
        title: "Young Sheldon",
        description: "Spin-off prequel di The Big Bang Theory",
        platforms: ["paramount", "netflix", "max"],
        genre: "Comedy",
        rating: 7.9
    },
    {
        title: "Ghosts",
        description: "Una coppia eredita una casa infestata",
        platforms: ["paramount", "netflix"],
        genre: "Comedy/Fantasy",
        rating: 7.8
    },
    {
        title: "iCarly",
        description: "Reboot della serie originale",
        platforms: ["paramount", "netflix"],
        genre: "Comedy",
        rating: 7.2
    },
    {
        title: "The Game",
        description: "Reboot della serie originale",
        platforms: ["paramount"],
        genre: "Comedy/Drama",
        rating: 7.0
    },
    {
        title: "Dexter: New Blood",
        description: "Continuazione della serie Dexter",
        platforms: ["paramount", "showtime"],
        genre: "Crime/Drama",
        rating: 7.8
    },
    {
        title: "Billions",
        description: "Guerra di potere tra un procuratore e un miliardario",
        platforms: ["paramount", "showtime"],
        genre: "Drama",
        rating: 8.3
    },
    {
        title: "Shameless",
        description: "La vita disfunzionale della famiglia Gallagher",
        platforms: ["paramount", "showtime", "netflix"],
        genre: "Comedy/Drama",
        rating: 8.6
    },
    {
        title: "House of the Dragon",
        description: "Prequel di Game of Thrones sulla famiglia Targaryen",
        platforms: ["hbo", "max"],
        genre: "Fantasy/Drama",
        rating: 8.5
    },
    {
        title: "The Last of Us",
        description: "Un contrabbandiere e una ragazza attraversano un'America post-apocalittica",
        platforms: ["hbo", "max"],
        genre: "Drama/Horror",
        rating: 8.8
    },
    {
        title: "Succession",
        description: "Lotte di potere in una famiglia mediatica",
        platforms: ["hbo", "max"],
        genre: "Drama",
        rating: 9.0
    },
    {
        title: "The White Lotus",
        description: "Intrighi e drammi in un resort di lusso",
        platforms: ["hbo", "max"],
        genre: "Drama/Comedy",
        rating: 8.2
    },
    {
        title: "True Detective: Night Country",
        description: "Investigatrici indagano su misteriose sparizioni in Alaska",
        platforms: ["hbo", "max"],
        genre: "Crime/Mystery",
        rating: 8.2
    },
    {
        title: "The Gilded Age",
        description: "Drammi e intrighi nella New York di fine '800",
        platforms: ["hbo", "max"],
        genre: "Drama/History",
        rating: 8.0
    },
    {
        title: "The Sopranos",
        description: "Un boss mafioso in terapia",
        platforms: ["hbo", "max"],
        genre: "Crime/Drama",
        rating: 9.2
    },
    {
        title: "Westworld",
        description: "Un parco a tema futuristico con robot senzienti",
        platforms: ["hbo", "max"],
        genre: "Sci-Fi/Drama",
        rating: 8.6
    },
    {
        title: "Barry",
        description: "Un sicario che sogna di diventare attore",
        platforms: ["hbo", "max"],
        genre: "Comedy/Drama",
        rating: 8.4
    },
    {
        title: "Euphoria",
        description: "Le difficoltà dell'adolescenza moderna",
        platforms: ["hbo", "max"],
        genre: "Drama",
        rating: 8.4
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