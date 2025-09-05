// Frontend configuration
export const config = {
    // Backend API configuration
    backend: {
        baseURL: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD)
            ? (import.meta.env.VITE_API_URL || 'https://spot-a-john-backend-415448404687.us-east1.run.app')
            : 'http://localhost:3000',

        endpoints: {
            locations: '/api/locations',
            search: '/api/locations/search',
            filter: '/api/locations/filter',
            userLocations: '/api/user-locations'
        }
    },
    
    // App configuration
    app: {
        name: 'Spot a John',
        version: '1.0.0'
    }
};
