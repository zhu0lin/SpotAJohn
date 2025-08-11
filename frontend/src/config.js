// Frontend configuration
export const config = {
    // Backend API configuration
    backend: {
        baseURL: process.env.NODE_ENV === 'production' 
            ? 'https://spot-a-john-backend-415448404687.us-east1.run.app' 
            : 'http://localhost:3000',
        endpoints: {
            locations: '/api/locations',
            search: '/api/locations/search',
            filter: '/api/locations/filter'
        }
    },
    
    // App configuration
    app: {
        name: 'Spot a John',
        version: '1.0.0'
    }
};
