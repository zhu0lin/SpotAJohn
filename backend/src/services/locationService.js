import nycLocationService from './nycLocationService.js';

// Service to fetch location data from external APIs
class LocationService {
  constructor() {}

  // Main method to fetch all location data
  async fetchAllLocations() {
    try {
      console.log('Fetching location data from external sources...');
      
      // Currently using NYC data as the primary source
      const nycLocations = await nycLocationService.fetchNYCLocations();
      
      if (nycLocations.length === 0) {
        console.log('No NYC locations found, returning empty array');
        return [];
      }

      console.log(`Successfully fetched ${nycLocations.length} NYC locations`);
      return nycLocations;
      
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }

  // Get location statistics for cron service
  async getLocationStats() {
    try {
      const locations = await this.fetchAllLocations();
      
      const stats = {
        total: locations.length,
        bySource: {},
        averageRating: 0,
        averageCleanliness: 0,
        accessibleCount: 0,
        babyChangingCount: 0,
        genderNeutralCount: 0
      };

      if (locations.length > 0) {
        const totalRating = locations.reduce((sum, loc) => sum + (loc.rating || 0), 0);
        const totalCleanliness = locations.reduce((sum, loc) => sum + (loc.cleanliness || 0), 0);
        
        stats.averageRating = totalRating / locations.length;
        stats.averageCleanliness = totalCleanliness / locations.length;
        stats.accessibleCount = locations.filter(loc => loc.accessibility).length;
        stats.babyChangingCount = locations.filter(loc => loc.babyChanging).length;
        stats.genderNeutralCount = locations.filter(loc => loc.genderNeutral).length;

        // Count by source
        locations.forEach(location => {
          const source = location.source || 'unknown';
          stats.bySource[source] = (stats.bySource[source] || 0) + 1;
        });
      }

      return stats;
    } catch (error) {
      console.error('Error getting location stats:', error);
      return {
        total: 0,
        bySource: {},
        averageRating: 0,
        averageCleanliness: 0,
        accessibleCount: 0,
        babyChangingCount: 0,
        genderNeutralCount: 0
      };
    }
  }
}

export default new LocationService();


