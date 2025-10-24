const axios = require('axios');

async function getPlaceDetails(businessName, city, state) {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
        throw new Error('Google Places API key not configured');
    }

    try {
        // Search for the place
        const searchQuery = `${businessName} ${city}${state ? ' ' + state : ''}`;
        const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery&fields=place_id,name&key=${apiKey}`;
        
        const searchResponse = await axios.get(searchUrl);
        
        if (!searchResponse.data.candidates || searchResponse.data.candidates.length === 0) {
            throw new Error('Business not found');
        }

        const placeId = searchResponse.data.candidates[0].place_id;

        // Get detailed information
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,formatted_address,formatted_phone_number,opening_hours,website,photos,reviews&key=${apiKey}`;
        
        const detailsResponse = await axios.get(detailsUrl);
        
        return detailsResponse.data.result;
    } catch (error) {
        console.error('Google Places API error:', error.message);
        throw error;
    }
}

module.exports = { getPlaceDetails };
