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

  // Search locations by name with robust matching
  // This method:
  // 1. Accepts a searchTerm parameter
  // 2. Optionally accepts a locations array (if not provided, fetch all locations)
  // 3. Performs case-insensitive search in location names only
  // 4. Handles spaces, punctuation, and capitalization variations
  // 5. Returns filtered locations that match the search term
  async searchLocationsByName(searchTerm, locations = null) {
    try {
      // Handle edge cases
      if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
        return [];
      }

      // Normalize search term: lowercase, remove spaces, remove punctuation
      const normalizedSearch = searchTerm
        .toLowerCase()
        .replace(/\s+/g, '')        
        .replace(/[^\w]/g, '')     
        .trim();

      // If search term is too short after normalization, return empty
      if (normalizedSearch.length < 2) {
        return [];
      }

      // Get locations to search (either provided or fetch all)
      const locationsToSearch = locations || await this.fetchAllLocations();
      
      if (!locationsToSearch || locationsToSearch.length === 0) {
        return [];
      }

      // Filter locations by normalized name matching
      return locationsToSearch.filter(location => {
        // Skip locations without names
        if (!location.name || typeof location.name !== 'string') {
          return false;
        }

        // Normalize location name the same way
        const normalizedName = location.name
          .toLowerCase()
          .replace(/\s+/g, '')       
          .replace(/[^\w]/g, '')     
          .trim();

        // Check if normalized search term is contained in normalized name
        return normalizedName.includes(normalizedSearch);
      });

    } catch (error) {
      console.error('Error searching locations by name:', error);
      return [];
    }
  }

  // TODO: Implement filter locations by criteria functionality
  // This method should:
  // 1. Accept a filters object with various criteria
  // 2. Optionally accept a locations array (if not provided, fetch all locations)
  // 3. Apply multiple filters: accessibility, babyChanging, genderNeutral, minRating, minCleanliness, etc.
  // 4. Use Array.filter() with multiple conditions
  // 5. Handle undefined/null filter values gracefully
  async filterLocations(filters = {}, locations = null) {
    try {
      // Get locations to filter (either provided or fetch all)
      const locationsToFilter = locations || await this.fetchAllLocations();
      
      if (!locationsToFilter || locationsToFilter.length === 0) {
        return [];
      }

      // If no filters provided, return all locations
      if (!filters || Object.keys(filters).length === 0) {
        return locationsToFilter;
      }

      // Apply filters using Array.filter with multiple conditions
      return locationsToFilter.filter(location => {
        // Filter by accessibility
        if (filters.accessibility !== undefined && filters.accessibility !== null) {
          if (location.accessibility !== filters.accessibility) {
            return false;
          }
        }

        // Filter by baby changing
        if (filters.babyChanging !== undefined && filters.babyChanging !== null) {
          if (location.babyChanging !== filters.babyChanging) {
            return false;
          }
        }

        // Filter by gender neutral
        if (filters.genderNeutral !== undefined && filters.genderNeutral !== null) {
          if (location.genderNeutral !== filters.genderNeutral) {
            return false;
          }
        }

        // Filter by minimum rating
        if (filters.minRating !== undefined && filters.minRating !== null) {
          const locationRating = location.rating || 0;
          if (locationRating < filters.minRating) {
            return false;
          }
        }

        // Filter by minimum cleanliness
        if (filters.minCleanliness !== undefined && filters.minCleanliness !== null) {
          const locationCleanliness = location.cleanliness || 0;
          if (locationCleanliness < filters.minCleanliness) {
            return false;
          }
        }

        // Filter by location type
        if (filters.locationType !== undefined && filters.locationType !== null) {
          if (location.locationType !== filters.locationType) {
            return false;
          }
        }

        // Filter by operator
        if (filters.operator !== undefined && filters.operator !== null) {
          if (location.operator !== filters.operator) {
            return false;
          }
        }

        // Filter by open status
        if (filters.openStatus !== undefined && filters.openStatus !== null) {
          if (location.openStatus !== filters.openStatus) {
            return false;
          }
        }

        // Filter by restroom type
        if (filters.restroomType !== undefined && filters.restroomType !== null) {
          if (location.restroomType !== filters.restroomType) {
            return false;
          }
        }

        // If all filters pass, include this location
        return true;
      });

    } catch (error) {
      console.error('Error filtering locations:', error);
      return [];
    }
  }

  // TODO: Implement combined search and filter functionality
  // This method should:
  // 1. Accept both searchTerm and filters parameters
  // 2. Optionally accept a locations array (if not provided, fetch all locations)
  // 3. First apply search, then apply filters to the search results
  // 4. Return the final filtered results
  // 5. Be efficient by not fetching locations multiple times
  async searchAndFilterLocations(searchTerm = '', filters = {}, locations = null) {
    try {
      // Get locations to work with (either provided or fetch all)
      const locationsToProcess = locations || await this.fetchAllLocations();
      
      if (!locationsToProcess || locationsToProcess.length === 0) {
        return [];
      }

      let results = [...locationsToProcess];

      // Step 1: Apply search first (if searchTerm provided)
      if (searchTerm && searchTerm.trim().length > 0) {
        const searchResults = await this.searchLocationsByName(searchTerm, results);
        results = searchResults;
        
        // If search returns no results, no need to apply filters
        if (results.length === 0) {
          return [];
        }
      }

      // Step 2: Apply filters to search results (if filters provided)
      if (filters && Object.keys(filters).length > 0) {
        const filteredResults = await this.filterLocations(filters, results);
        results = filteredResults;
      }

      return results;

    } catch (error) {
      console.error('Error searching and filtering locations:', error);
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

  // Get available filter options for UI
  async getAvailableFilterOptions() {
    try {
      const locations = await this.fetchAllLocations();
      
      if (!locations || locations.length === 0) {
        return {
          locationTypes: [],
          operators: [],
          restroomTypes: [],
          openStatuses: [],
          ratingRanges: { min: 0, max: 5 },
          cleanlinessRanges: { min: 0, max: 5 }
        };
      }

      // Extract unique values for each filter type
      const locationTypes = [...new Set(locations.map(loc => loc.locationType).filter(Boolean))];
      const operators = [...new Set(locations.map(loc => loc.operator).filter(Boolean))];
      const restroomTypes = [...new Set(locations.map(loc => loc.restroomType).filter(Boolean))];
      const openStatuses = [...new Set(locations.map(loc => loc.openStatus).filter(Boolean))];

      // Calculate rating and cleanliness ranges
      const ratings = locations.map(loc => loc.rating).filter(rating => rating !== undefined && rating !== null);
      const cleanlinessScores = locations.map(loc => loc.cleanliness).filter(clean => clean !== undefined && clean !== null);

      const ratingRanges = {
        min: ratings.length > 0 ? Math.min(...ratings) : 0,
        max: ratings.length > 0 ? Math.max(...ratings) : 5
      };

      const cleanlinessRanges = {
        min: cleanlinessScores.length > 0 ? Math.min(...cleanlinessScores) : 0,
        max: cleanlinessScores.length > 0 ? Math.max(...cleanlinessScores) : 5
      };

      return {
        locationTypes,
        operators,
        restroomTypes,
        openStatuses,
        ratingRanges,
        cleanlinessRanges
      };

    } catch (error) {
      console.error('Error getting available filter options:', error);
      return {
        locationTypes: [],
        operators: [],
        restroomTypes: [],
        openStatuses: [],
        ratingRanges: { min: 0, max: 5 },
        cleanlinessRanges: { min: 0, max: 5 }
      };
    }
  }

  // Get locations with pagination support
  async getLocationsWithPagination(page = 1, limit = 20, searchTerm = '', filters = {}) {
    try {
      // Get filtered results
      let results = [];
      
      if (searchTerm || Object.keys(filters).length > 0) {
        results = await this.searchAndFilterLocations(searchTerm, filters);
      } else {
        results = await this.fetchAllLocations();
      }

      // Calculate pagination
      const total = results.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      // Get paginated results
      const paginatedResults = results.slice(startIndex, endIndex);

      return {
        data: paginatedResults,
        pagination: {
          currentPage: page,
          totalPages,
          total,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };

    } catch (error) {
      console.error('Error getting locations with pagination:', error);
      return {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          total: 0,
          limit: 20,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
    }
  }
}

export default new LocationService();


