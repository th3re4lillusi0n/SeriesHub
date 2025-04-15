// Configurazione JustWatch
const JUSTWATCH_CONFIG = {
    baseUrl: 'https://apis.justwatch.com/content/titles/it_IT/popular',
    locale: 'it_IT'
};

class StreamingAPI {
    static async searchShow(title) {
        try {
            const query = encodeURIComponent(title.trim());
            const url = JUSTWATCH_CONFIG.baseUrl;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "query": query,
                    "content_types": ["show"],
                    "page": 1,
                    "page_size": 5
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const shows = data.items || [];

            // Trova la corrispondenza migliore
            const exactMatch = shows.find(show => 
                show.title.toLowerCase() === title.toLowerCase()
            );

            const closeMatch = shows.find(show => 
                show.title.toLowerCase().includes(title.toLowerCase()) ||
                title.toLowerCase().includes(show.title.toLowerCase())
            );

            const bestMatch = exactMatch || closeMatch || shows[0];

            if (!bestMatch) return null;

            // Ottieni i dettagli completi dello show
            return await this.getStreamingInfo(bestMatch.id);
        } catch (error) {
            console.error('Error searching show:', error);
            return null;
        }
    }

    static async getStreamingInfo(showId) {
        try {
            const url = `https://apis.justwatch.com/content/titles/show/${showId}/locale/${JUSTWATCH_CONFIG.locale}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            return this.formatStreamingInfo(data);
        } catch (error) {
            console.error('Error getting streaming info:', error);
            return null;
        }
    }

    static formatStreamingInfo(data) {
        if (!data || !data.offers) return null;

        const result = {
            streaming: [],
            rent: [],
            buy: []
        };

        // Raggruppa le offerte per provider per evitare duplicati
        const groupedOffers = {
            flatrate: new Map(),
            rent: new Map(),
            buy: new Map()
        };

        // Raggruppa le offerte per tipo e provider
        data.offers.forEach(offer => {
            const type = offer.monetization_type;
            if (groupedOffers[type]) {
                if (!groupedOffers[type].has(offer.provider_id)) {
                    groupedOffers[type].set(offer.provider_id, offer);
                }
            }
        });

        // Converti le offerte raggruppate nel formato finale
        if (groupedOffers.flatrate.size > 0) {
            result.streaming = Array.from(groupedOffers.flatrate.values()).map(offer => ({
                name: this.getProviderName(offer.provider_id),
                logo: this.getProviderLogo(offer.provider_id)
            }));
        }

        if (groupedOffers.rent.size > 0) {
            result.rent = Array.from(groupedOffers.rent.values()).map(offer => ({
                name: this.getProviderName(offer.provider_id),
                logo: this.getProviderLogo(offer.provider_id)
            }));
        }

        if (groupedOffers.buy.size > 0) {
            result.buy = Array.from(groupedOffers.buy.values()).map(offer => ({
                name: this.getProviderName(offer.provider_id),
                logo: this.getProviderLogo(offer.provider_id)
            }));
        }

        return result;
    }

    static getProviderLogo(providerId) {
        const providerLogos = {
            8: 'netflix.png',
            9: 'prime.png',
            337: 'disney.png',
            350: 'appletv.png',
            119: 'prime.png',    // Amazon Prime
            384: 'hbomax.png',   // HBO Max
            371: 'appletv.png',  // Apple TV+
            372: 'disney.png',   // Disney+
            373: 'paramount.png', // Paramount+
            389: 'peacock.png',  // Peacock
            391: 'crunchyroll.png', // Crunchyroll
            392: 'discovery.png',   // Discovery+
            393: 'starz.png',      // Starz
            394: 'showtime.png',   // Showtime
            395: 'rakuten.png',    // Rakuten TV
            396: 'youtube.png',    // YouTube Premium
            397: 'nowtvit.png',    // NOW TV
            398: 'infinity.png',   // Infinity
            399: 'timvision.png',  // TIMVISION
            400: 'skygo.png',      // Sky Go
        };

        return providerLogos[providerId] ? `assets/images/providers/${providerLogos[providerId]}` : null;
    }

    static getProviderName(providerId) {
        const providerNames = {
            8: 'Netflix',
            9: 'Amazon Prime Video',
            337: 'Disney+',
            350: 'Apple TV+',
            119: 'Amazon Prime Video',
            384: 'HBO Max',
            371: 'Apple TV+',
            372: 'Disney+',
            373: 'Paramount+',
            389: 'Peacock',
            391: 'Crunchyroll',
            392: 'Discovery+',
            393: 'Starz',
            394: 'Showtime',
            395: 'Rakuten TV',
            396: 'YouTube Premium',
            397: 'NOW TV',
            398: 'Infinity',
            399: 'TIMVISION',
            400: 'Sky Go',
        };

        return providerNames[providerId] || 'Unknown Provider';
    }
}

// Esporta la classe per l'uso in altri file
window.StreamingAPI = StreamingAPI; 