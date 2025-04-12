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

// Dati delle serie TV
const seriesData = [
    {
        title: "Breaking Bad",
        description: "Un professore di chimica diventa un signore della droga",
        platforms: ["netflix", "prime", "amc"],
        genre: "Drama",
        rating: 9.5,
        image: "https://example.com/breaking-bad.jpg"
    },
    {
        title: "Stranger Things", 
        description: "Misteriosi eventi soprannaturali in una piccola città",
        platforms: ["netflix"],
        genre: "Sci-Fi",
        rating: 8.7,
        image: "https://example.com/stranger-things.jpg"
    },
    {
        title: "Game of Thrones",
        description: "Lotte di potere in un mondo fantasy",
        platforms: ["hbo", "prime"],
        genre: "Fantasy",
        rating: 9.3,
        image: "https://example.com/got.jpg"
    },
    {
        title: "The Mandalorian",
        description: "Un cacciatore di taglie galattico protegge un bambino speciale",
        platforms: ["disney"],
        genre: "Sci-Fi",
        rating: 8.8,
        image: "https://example.com/mandalorian.jpg"
    },
    {
        title: "The Crown",
        description: "La storia della famiglia reale britannica",
        platforms: ["netflix"],
        genre: "Drama",
        rating: 8.7
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
        platforms: ["hbo", "netflix"],
        genre: "Comedy",
        rating: 8.9
    },
    {
        title: "The Witcher",
        description: "Le avventure di un cacciatore di mostri",
        platforms: ["netflix"],
        genre: "Fantasy",
        rating: 8.2
    },
    {
        title: "WandaVision",
        description: "Wanda e Visione vivono in una realtà alternativa di sitcom",
        platforms: ["disney"],
        genre: "MCU/Sci-Fi",
        rating: 8.0
    },
    {
        title: "The Falcon and the Winter Soldier",
        description: "Sam Wilson e Bucky Barnes affrontano nuove minacce",
        platforms: ["disney"],
        genre: "MCU/Action",
        rating: 7.8
    },
    {
        title: "Moon Knight",
        description: "Un vigilante con disturbo dissociativo dell'identità",
        platforms: ["disney"],
        genre: "MCU/Action",
        rating: 7.9
    },
    {
        title: "Ms. Marvel",
        description: "Le avventure della giovane supereroina Kamala Khan",
        platforms: ["disney"],
        genre: "MCU/Action",
        rating: 7.5
    },
    {
        title: "She-Hulk: Attorney at Law",
        description: "Un'avvocata diventa una supereroina verde",
        platforms: ["disney"],
        genre: "MCU/Comedy",
        rating: 6.8
    },
    {
        title: "Secret Invasion",
        description: "Nick Fury combatte un'invasione aliena segreta",
        platforms: ["disney"],
        genre: "MCU/Sci-Fi",
        rating: 7.0
    },
    {
        title: "Bridgerton",
        description: "Romance e scandali nell'alta società londinese",
        platforms: ["netflix"],
        genre: "Drama/Romance",
        rating: 8.3
    },
    {
        title: "The Crown",
        description: "La storia della famiglia reale britannica",
        platforms: ["netflix"],
        genre: "Drama/History",
        rating: 8.7
    },
    {
        title: "Squid Game",
        description: "Giochi mortali per un premio in denaro",
        platforms: ["netflix"],
        genre: "Drama/Thriller",
        rating: 8.7
    },
    {
        title: "The Rings of Power",
        description: "Prequel del Signore degli Anelli",
        platforms: ["prime"],
        genre: "Fantasy",
        rating: 7.8
    },
    {
        title: "Ted Lasso",
        description: "Un allenatore americano di football allena una squadra di calcio inglese",
        platforms: ["apple"],
        genre: "Comedy",
        rating: 8.9
    },
    {
        title: "The Morning Show",
        description: "Drama ambientato nel mondo del giornalismo televisivo",
        platforms: ["apple"],
        genre: "Drama",
        rating: 8.2
    },
    {
        title: "The Handmaid's Tale",
        description: "Distopia in cui le donne sono private dei diritti",
        platforms: ["hulu"],
        genre: "Drama",
        rating: 8.4
    },
    {
        title: "Only Murders in the Building",
        description: "Tre vicini indagano su un omicidio nel loro palazzo",
        platforms: ["hulu", "disney"],
        genre: "Comedy/Mystery",
        rating: 8.1
    },
    {
        title: "Andor",
        description: "Prequel di Rogue One nell'universo di Star Wars",
        platforms: ["disney"],
        genre: "Sci-Fi",
        rating: 8.7
    },
    {
        title: "The Bear",
        description: "Un chef torna a gestire il ristorante di famiglia",
        platforms: ["hulu", "disney"],
        genre: "Drama",
        rating: 8.7
    },
    {
        title: "Severance",
        description: "Impiegati con memoria divisa tra lavoro e vita privata",
        platforms: ["apple"],
        genre: "Sci-Fi/Thriller",
        rating: 8.7
    },
    {
        title: "What If...?",
        description: "Storie alternative dell'universo Marvel",
        platforms: ["disney"],
        genre: "MCU/Animation",
        rating: 7.4
    },
    {
        title: "Hawkeye",
        description: "Le avventure natalizie di Clint Barton",
        platforms: ["disney"],
        genre: "MCU/Action",
        rating: 7.6
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
        genre: "Fantasy",
        rating: 7.7
    },
    {
        title: "The Wheel of Time",
        description: "Fantasy epico basato sui romanzi di Robert Jordan",
        platforms: ["prime"],
        genre: "Fantasy",
        rating: 7.1
    },
    {
        title: "Money Heist",
        description: "Un gruppo di rapinatori pianifica colpi elaborati",
        platforms: ["netflix"],
        genre: "Drama/Thriller",
        rating: 8.3
    },
    {
        title: "Ozark",
        description: "Una famiglia coinvolta nel riciclaggio di denaro",
        platforms: ["netflix"],
        genre: "Drama/Crime",
        rating: 8.5
    },
    {
        title: "Narcos",
        description: "La storia dei cartelli della droga colombiani",
        platforms: ["netflix"],
        genre: "Drama/Crime",
        rating: 8.8
    },
    {
        title: "The Umbrella Academy",
        description: "Fratelli supereroi riuniti per salvare il mondo",
        platforms: ["netflix"],
        genre: "Sci-Fi/Action",
        rating: 7.9
    },
    {
        title: "Lucifer",
        description: "Il diavolo gestisce un night club a Los Angeles",
        platforms: ["netflix"],
        genre: "Fantasy/Crime",
        rating: 8.1
    },
    {
        title: "Emily in Paris",
        description: "Un'americana si trasferisce a Parigi per lavoro",
        platforms: ["netflix"],
        genre: "Comedy/Romance",
        rating: 7.0
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
        title: "Loki",
        description: "Le avventure del dio dell'inganno",
        platforms: ["disney"],
        genre: "MCU/Action",
        rating: 8.2
    },
    {
        title: "The Boys",
        description: "Supereroi corrotti contro vigilanti",
        platforms: ["prime"],
        genre: "Action/Drama",
        rating: 8.7
    },
    {
        title: "The Marvelous Mrs. Maisel",
        description: "Una casalinga diventa comica stand-up",
        platforms: ["prime"],
        genre: "Comedy/Drama",
        rating: 8.7
    },
    {
        title: "Jack Ryan",
        description: "Un analista CIA in missioni globali",
        platforms: ["prime"],
        genre: "Action/Thriller",
        rating: 8.0
    },
    {
        title: "Fleabag",
        description: "Una donna alle prese con la vita a Londra",
        platforms: ["prime"],
        genre: "Comedy/Drama",
        rating: 8.7
    },
    {
        title: "Sherlock",
        description: "Moderna interpretazione del detective",
        platforms: ["netflix", "prime"],
        genre: "Crime/Drama",
        rating: 9.1
    },
    {
        title: "The Walking Dead",
        description: "Sopravvivenza in un'apocalisse zombie",
        platforms: ["netflix", "amc"],
        genre: "Horror/Drama",
        rating: 8.2
    },
    {
        title: "The Sopranos",
        description: "Un boss mafioso in terapia",
        platforms: ["hbo"],
        genre: "Crime/Drama",
        rating: 9.2
    },
    {
        title: "Better Call Saul",
        description: "L'origine dell'avvocato Saul Goodman",
        platforms: ["netflix", "amc"],
        genre: "Crime/Drama",
        rating: 8.9
    },
    {
        title: "Lost",
        description: "Sopravvissuti di un incidente aereo su un'isola misteriosa",
        platforms: ["hulu"],
        genre: "Drama/Mystery",
        rating: 8.3
    },
    {
        title: "Westworld",
        description: "Un parco a tema futuristico con robot senzienti",
        platforms: ["hbo"],
        genre: "Sci-Fi/Drama",
        rating: 8.6
    },
    {
        title: "The OA",
        description: "Una donna ritorna dopo sette anni di scomparsa con abilità misteriose",
        platforms: ["netflix"],
        genre: "Mystery/Drama",
        rating: 7.8
    },
    {
        title: "Dark",
        description: "Misteri e viaggi nel tempo in una piccola città tedesca",
        platforms: ["netflix"],
        genre: "Sci-Fi/Mystery",
        rating: 8.8
    },
    {
        title: "Narcos: Mexico",
        description: "L'ascesa dei cartelli della droga messicani",
        platforms: ["netflix"],
        genre: "Crime/Drama",
        rating: 8.4
    },
    {
        title: "The Good Place",
        description: "Una donna si ritrova per errore nel paradiso",
        platforms: ["netflix"],
        genre: "Comedy/Fantasy",
        rating: 8.2
    },
    {
        title: "Russian Doll",
        description: "Una donna rivive ripetutamente il giorno della sua morte",
        platforms: ["netflix"],
        genre: "Comedy/Drama",
        rating: 7.8
    },
    {
        title: "Love, Death & Robots",
        description: "Antologia animata di storie sci-fi",
        platforms: ["netflix"],
        genre: "Animation/Sci-Fi",
        rating: 8.4
    },
    {
        title: "Dead to Me",
        description: "Due donne legate da un oscuro segreto",
        platforms: ["netflix"],
        genre: "Comedy/Drama",
        rating: 8.0
    },
    {
        title: "After Life",
        description: "Un uomo affronta la vita dopo la morte della moglie",
        platforms: ["netflix"],
        genre: "Comedy/Drama",
        rating: 8.4
    },
    {
        title: "The End of the F***ing World",
        description: "Due adolescenti problematici in fuga",
        platforms: ["netflix"],
        genre: "Comedy/Drama",
        rating: 8.1
    },
    {
        title: "Cobra Kai",
        description: "Continuazione della saga di Karate Kid",
        platforms: ["netflix"],
        genre: "Action/Drama",
        rating: 8.5
    },
    {
        title: "The Big Bang Theory",
        description: "Un gruppo di fisici nerd e la loro vicina aspirante attrice affrontano la vita, l'amore e la scienza",
        platforms: ["hbo", "netflix", "prime"],
        genre: "Comedy",
        rating: 8.2
    },
    {
        title: "The Book of Boba Fett",
        description: "Le avventure del cacciatore di taglie di Star Wars",
        platforms: ["disney"],
        genre: "Sci-Fi/Action",
        rating: 7.3
    },
    {
        title: "Mighty Ducks: Game Changers",
        description: "Una nuova generazione di giovani giocatori di hockey",
        platforms: ["disney"],
        genre: "Family/Sport",
        rating: 7.3
    },
    {
        title: "Big Shot",
        description: "Un allenatore di basket in una scuola femminile",
        platforms: ["disney"],
        genre: "Drama/Sport",
        rating: 7.3
    },
    {
        title: "The Santa Clauses",
        description: "Continuazione della saga di Santa Clause",
        platforms: ["disney"],
        genre: "Family/Comedy",
        rating: 7.0
    },
    {
        title: "The Night Manager",
        description: "Un ex soldato si infiltra in un'organizzazione criminale",
        platforms: ["prime"],
        genre: "Drama/Thriller",
        rating: 8.1
    },
    {
        title: "Goliath",
        description: "Un avvocato cerca redenzione",
        platforms: ["prime"],
        genre: "Drama/Legal",
        rating: 8.2
    },
    {
        title: "Tales from the Loop",
        description: "Storie interconnesse in una città con strani fenomeni",
        platforms: ["prime"],
        genre: "Sci-Fi/Drama",
        rating: 7.5
    },
    {
        title: "The West Wing",
        description: "Dietro le quinte della Casa Bianca",
        platforms: ["hbo"],
        genre: "Drama/Politics",
        rating: 8.9
    },
    {
        title: "Parks and Recreation",
        description: "Le avventure del dipartimento parchi di una città",
        platforms: ["netflix", "prime"],
        genre: "Comedy",
        rating: 8.6
    },
    {
        title: "Mad Men",
        description: "La vita in un'agenzia pubblicitaria negli anni '60",
        platforms: ["prime"],
        genre: "Drama",
        rating: 8.7
    },
    {
        title: "Brooklyn Nine-Nine",
        description: "Le avventure di un distretto di polizia di New York",
        platforms: ["netflix", "hulu"],
        genre: "Comedy",
        rating: 8.4
    },
    {
        title: "Sons of Anarchy",
        description: "Un club di motociclisti in California",
        platforms: ["hulu"],
        genre: "Drama/Crime",
        rating: 8.6
    },
    {
        title: "Daredevil",
        description: "Un avvocato cieco combatte il crimine",
        platforms: ["netflix", "disney"],
        genre: "Action/Crime",
        rating: 8.6
    },
    {
        title: "Arrow",
        description: "Un miliardario diventa un vigilante",
        platforms: ["netflix"],
        genre: "Action/Adventure",
        rating: 7.5
    },
    {
        title: "Supernatural",
        description: "Due fratelli cacciano creature soprannaturali",
        platforms: ["prime", "netflix"],
        genre: "Fantasy/Horror",
        rating: 8.4
    },
    {
        title: "Arcane",
        description: "Serie animata basata sul gioco League of Legends",
        platforms: ["netflix"],
        genre: "Animation/Fantasy",
        rating: 9.0
    },
    {
        title: "Rick and Morty",
        description: "Le avventure intergalattiche di uno scienziato e suo nipote",
        platforms: ["netflix", "hbo"],
        genre: "Animation/Sci-Fi",
        rating: 9.2
    },
    {
        title: "Alias",
        description: "Un'agente segreta combatte contro organizzazioni criminali",
        platforms: ["prime"],
        genre: "Action/Drama",
        rating: 7.6
    },
    {
        title: "24",
        description: "Un agente antiterrorismo affronta minacce in tempo reale",
        platforms: ["hulu"],
        genre: "Action/Thriller",
        rating: 8.3
    },
    {
        title: "Prison Break",
        description: "Un uomo cerca di far evadere il fratello dal carcere",
        platforms: ["hulu", "disney"],
        genre: "Action/Drama",
        rating: 8.3
    },
    {
        title: "Homeland",
        description: "Un'agente CIA indaga su minacce terroristiche",
        platforms: ["hulu"],
        genre: "Drama/Thriller",
        rating: 8.3
    },
    {
        title: "Fringe",
        description: "Indagini su fenomeni scientifici misteriosi",
        platforms: ["prime"],
        genre: "Sci-Fi/Mystery",
        rating: 8.4
    },
    {
        title: "Vikings",
        description: "Le avventure dei vichinghi nell'era medievale",
        platforms: ["netflix", "prime"],
        genre: "Action/Drama",
        rating: 8.5
    },
    {
        title: "The Blacklist",
        description: "Un criminale collabora con l'FBI",
        platforms: ["netflix"],
        genre: "Crime/Drama",
        rating: 8.0
    },
    {
        title: "Orphan Black",
        description: "Una donna scopre di essere un clone",
        platforms: ["prime"],
        genre: "Sci-Fi/Thriller",
        rating: 8.3
    },
    {
        title: "Succession",
        description: "Lotte di potere in una famiglia mediatica",
        platforms: ["hbo"],
        genre: "Drama",
        rating: 8.9
    },
    {
        title: "Euphoria",
        description: "Le difficoltà dell'adolescenza moderna",
        platforms: ["hbo"],
        genre: "Drama",
        rating: 8.4
    },
    {
        title: "Barry",
        description: "Un sicario che sogna di diventare attore",
        platforms: ["hbo"],
        genre: "Comedy/Drama",
        rating: 8.4
    },
    {
        title: "True Detective",
        description: "Indagini su crimini complessi",
        platforms: ["hbo"],
        genre: "Crime/Drama",
        rating: 8.9
    },
    {
        title: "Grey's Anatomy",
        description: "Le vite personali e professionali di medici",
        platforms: ["netflix", "hulu"],
        genre: "Drama/Medical",
        rating: 7.6
    },
    {
        title: "Suits",
        description: "Un avvocato fraudolento in uno studio legale d'elite",
        platforms: ["netflix"],
        genre: "Drama/Legal",
        rating: 8.4
    },
    {
        title: "White Collar",
        description: "Un truffatore aiuta l'FBI",
        platforms: ["hulu"],
        genre: "Crime/Drama",
        rating: 8.2
    },
    {
        title: "Burn Notice",
        description: "Una spia licenziata cerca di scoprire chi l'ha incastrata",
        platforms: ["hulu"],
        genre: "Action/Drama",
        rating: 8.0
    },
    {
        title: "Angel",
        description: "Spin-off di Buffy: un vampiro con un'anima combatte il male a Los Angeles",
        platforms: ["hulu"],
        genre: "Fantasy/Drama",
        rating: 8.0
    },
    {
        title: "Buffy the Vampire Slayer",
        description: "Una teenager combatte vampiri e forze soprannaturali",
        platforms: ["hulu"],
        genre: "Fantasy/Drama",
        rating: 8.2
    },
    {
        title: "Roswell",
        description: "Alieni adolescenti nascosti tra gli umani",
        platforms: ["hulu"],
        genre: "Sci-Fi/Drama",
        rating: 7.5
    },
    {
        title: "Alias Grace",
        description: "Adattamento del romanzo di Margaret Atwood",
        platforms: ["netflix"],
        genre: "Drama",
        rating: 7.8
    },
    {
        title: "A Series of Unfortunate Events",
        description: "Le disavventure degli orfani Baudelaire",
        platforms: ["netflix"],
        genre: "Drama/Comedy",
        rating: 7.8
    },
    {
        title: "Maniac",
        description: "Due estranei partecipano a un misterioso test farmaceutico",
        platforms: ["netflix"],
        genre: "Drama/Sci-Fi",
        rating: 7.7
    },
    {
        title: "Sense8",
        description: "Otto persone connesse mentalmente",
        platforms: ["netflix"],
        genre: "Sci-Fi/Drama",
        rating: 8.3
    },
    {
        title: "Black Mirror",
        description: "Antologia sulla tecnologia e le sue conseguenze",
        platforms: ["netflix"],
        genre: "Sci-Fi/Drama",
        rating: 8.8
    },
    {
        title: "The Twilight Zone (originale)",
        description: "Serie antologica di storie soprannaturali",
        platforms: ["hulu"],
        genre: "Sci-Fi/Horror",
        rating: 9.0
    },
    {
        title: "The Twilight Zone (2019)",
        description: "Reboot della classica serie antologica",
        platforms: ["hulu"],
        genre: "Sci-Fi/Horror",
        rating: 7.2
    },
    {
        title: "Galavant",
        description: "Musical comedy medievale",
        platforms: ["hulu"],
        genre: "Comedy/Musical",
        rating: 7.8
    },
    {
        title: "The Haunting of Bly Manor",
        description: "Una governante americana si prende cura di due bambini orfani in una tenuta inglese infestata",
        platforms: ["netflix"],
        genre: "Horror/Drama",
        rating: 7.4
    },
    {
        title: "Midnight Mass",
        description: "Misteriosi eventi soprannaturali in una piccola comunità isolata",
        platforms: ["netflix"],
        genre: "Horror/Drama",
        rating: 7.7
    },
    {
        title: "La Caduta della Casa degli Usher",
        description: "Adattamento moderno del racconto di Edgar Allan Poe",
        platforms: ["netflix"],
        genre: "Horror/Drama",
        rating: 7.8
    },
    {
        title: "Anthracite",
        description: "Un'investigazione su una setta misteriosa nelle Alpi francesi",
        platforms: ["netflix"],
        genre: "Mystery/Thriller",
        rating: 6.8
    },
    {
        title: "Ripley",
        description: "Un truffatore assume l'identità di un ricco ereditiere",
        platforms: ["netflix"],
        genre: "Drama/Thriller",
        rating: 7.9
    },
    {
        title: "Baby Reindeer",
        description: "Storia vera di uno stalking ossessivo",
        platforms: ["netflix"],
        genre: "Drama",
        rating: 8.1
    },
    {
        title: "Briganti",
        description: "Serie storica sul brigantaggio nell'Italia meridionale",
        platforms: ["netflix"],
        genre: "Drama/History",
        rating: 6.9
    },
    {
        title: "Transatlantic",
        description: "Storia vera del salvataggio di rifugiati durante la Seconda Guerra Mondiale",
        platforms: ["netflix"],
        genre: "Drama/History",
        rating: 7.4
    },
    {
        title: "Ossessione",
        description: "Un affair proibito che minaccia di distruggere due famiglie",
        platforms: ["netflix"],
        genre: "Drama/Thriller",
        rating: 6.5
    },
    {
        title: "The Night Agent",
        description: "Un agente FBI scopre una cospirazione che arriva fino alla Casa Bianca",
        platforms: ["netflix"],
        genre: "Action/Thriller",
        rating: 7.7
    },
    {
        title: "Lo scontro (Beef)",
        description: "Un incidente stradale porta a una faida crescente tra due estranei",
        platforms: ["netflix"],
        genre: "Drama/Comedy",
        rating: 8.2
    },
    {
        title: "La legge di Lidia Poët",
        description: "Storia della prima avvocatessa d'Italia",
        platforms: ["netflix"],
        genre: "Drama/History",
        rating: 7.3
    },
    {
        title: "Dead Boy Detectives",
        description: "Due fantasmi adolescenti risolvono misteri soprannaturali",
        platforms: ["netflix"],
        genre: "Mystery/Fantasy",
        rating: 7.5
    },
    {
        title: "Copycat Killer",
        description: "Un serial killer che ricrea famosi omicidi letterari",
        platforms: ["netflix"],
        genre: "Crime/Thriller",
        rating: 7.2
    },
    {
        title: "The Recruit",
        description: "Un giovane avvocato della CIA si trova coinvolto in pericolose missioni",
        platforms: ["netflix"],
        genre: "Action/Thriller",
        rating: 7.5
    },
    {
        title: "The Fabulous",
        description: "Quattro amici nel mondo della moda di Seoul",
        platforms: ["netflix"],
        genre: "Drama/Romance",
        rating: 7.0
    },
    {
        title: "The Glory",
        description: "Una donna cerca vendetta contro i suoi ex bulli",
        platforms: ["netflix"],
        genre: "Drama/Thriller",
        rating: 8.1
    },
    {
        title: "Black Knight",
        description: "In un futuro post-apocalittico, i corrieri sono essenziali per la sopravvivenza",
        platforms: ["netflix"],
        genre: "Sci-Fi/Action",
        rating: 7.2
    },
    {
        title: "XO, Kitty",
        description: "Spin-off di To All the Boys I've Loved Before",
        platforms: ["netflix"],
        genre: "Comedy/Romance",
        rating: 7.0
    },
    {
        title: "Love to Hate You",
        description: "Una avvocatessa e un attore superano i loro pregiudizi sull'amore",
        platforms: ["netflix"],
        genre: "Romance/Comedy",
        rating: 7.3
    },
    {
        title: "Dr. Cha",
        description: "Una casalinga torna a praticare medicina dopo 20 anni",
        platforms: ["netflix"],
        genre: "Drama/Medical",
        rating: 7.4
    },
    {
        title: "King the Land",
        description: "Romance nel mondo dell'hospitality di lusso",
        platforms: ["netflix"],
        genre: "Romance/Comedy",
        rating: 7.6
    },
    {
        title: "The Good Bad Mother",
        description: "Un procuratore rigido torna bambino dopo un incidente",
        platforms: ["netflix"],
        genre: "Drama/Comedy",
        rating: 7.5
    },
    {
        title: "Duty After School",
        description: "Studenti combattono una minaccia aliena",
        platforms: ["netflix"],
        genre: "Sci-Fi/Drama",
        rating: 7.1
    },
    {
        title: "A Time Called You",
        description: "Una donna viaggia nel tempo per ritrovare il suo amore perduto",
        platforms: ["netflix"],
        genre: "Romance/Fantasy",
        rating: 7.2
    },
    {
        title: "Fisk",
        description: "Una avvocatessa ricomincia in uno studio legale eccentrico",
        platforms: ["netflix"],
        genre: "Comedy/Drama",
        rating: 7.4
    },
    // ... inserisci qui tutti i dati delle serie TV che hai fornito ...
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
        option.textContent = platform.charAt(0).toUpperCase() + platform.slice(1);
        platformFilter.appendChild(option);
    });
}

// Clear all filters
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('genreFilter').value = '';
    document.getElementById('platformFilter').value = '';
    document.getElementById('ratingFilter').value = '';
    
    cache.filters = {
        search: '',
        genre: '',
        platform: '',
        rating: 0
    };
    
    renderSeries(sortSeriesAlphabetically(seriesData));
    updatePagination();
}

// Filter series based on all criteria
function filterSeries() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const selectedGenre = document.getElementById('genreFilter').value;
    const selectedPlatform = document.getElementById('platformFilter').value;
    const selectedRating = parseFloat(document.getElementById('ratingFilter').value) || 0;

    cache.filters = {
        search: searchTerm,
        genre: selectedGenre,
        platform: selectedPlatform,
        rating: selectedRating
    };
    
    cache.currentPage = 1; // Reset to first page when filtering
    
    const filteredSeries = seriesData.filter(show => {
        const showGenres = show.genre.split(/[\/\s]+/); // Split su slash e spazi
        const matchesSearch = !searchTerm || 
            show.title.toLowerCase().includes(searchTerm) ||
            show.description.toLowerCase().includes(searchTerm);
        
        const matchesGenre = !selectedGenre || showGenres.includes(selectedGenre);
        const matchesPlatform = !selectedPlatform || show.platforms.includes(selectedPlatform);
        const matchesRating = !selectedRating || show.rating >= selectedRating;
        
        return matchesSearch && matchesGenre && matchesPlatform && matchesRating;
    });
    
    renderSeries(sortSeriesAlphabetically(filteredSeries));
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
        'hulu': 'Hulu'
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
    
    const filteredSeries = seriesData.filter(show => {
        const showGenres = show.genre.split(/[\/\s]+/); // Split su slash e spazi
        const searchTerm = cache.filters.search.toLowerCase();
        const matchesSearch = !searchTerm || 
            show.title.toLowerCase().includes(searchTerm) ||
            show.description.toLowerCase().includes(searchTerm);
        
        const matchesGenre = !cache.filters.genre || showGenres.includes(cache.filters.genre);
        const matchesPlatform = !cache.filters.platform || show.platforms.includes(cache.filters.platform);
        const matchesRating = !cache.filters.rating || show.rating >= cache.filters.rating;
        
        return matchesSearch && matchesGenre && matchesPlatform && matchesRating;
    });
    
    const totalPages = Math.ceil(filteredSeries.length / config.itemsPerPage);
    
    if (page >= 1 && page <= totalPages) {
        cache.currentPage = page;
        renderSeries(sortSeriesAlphabetically(filteredSeries));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Debounce utility
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
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;
    
    themeToggle.innerHTML = theme === 'dark' ? `
        <svg viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        </svg>
    ` : `
        <svg viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
    `;
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Populate filters
    populateFilters();
    
    // Set up event listeners
    const debouncedFilter = debounce(filterSeries, config.debounceDelay);
    document.getElementById('searchInput').addEventListener('input', debouncedFilter);
    document.getElementById('genreFilter').addEventListener('change', filterSeries);
    document.getElementById('platformFilter').addEventListener('change', filterSeries);
    document.getElementById('ratingFilter').addEventListener('change', filterSeries);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    
    // Set up scroll handlers
    window.addEventListener('scroll', () => {
        handleHeaderScroll();
        updateScrollButton();
    });
    
    // Initialize theme
    initializeTheme();
    
    // Add theme toggle event listener
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Initial render with all series
    const sortedSeries = sortSeriesAlphabetically([...seriesData]);
    renderSeries(sortedSeries);
    updatePagination(sortedSeries.length);
}); 