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

  // Search locations by name with robust matching and typo tolerance
  // This method:
  // 1. Accepts a searchTerm parameter
  // 2. Optionally accepts a locations array (if not provided, fetch all locations)
  // 3. Performs multiple search strategies: exact, fuzzy, and partial matching
  // 4. Handles typos using Levenshtein distance and similarity scoring
  // 5. Returns locations ranked by relevance
  async searchLocationsByName(searchTerm, locations = null) {
    try {
      // Handle edge cases
      if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
        return [];
      }

      const normalizedSearch = searchTerm.toLowerCase().trim();

      // If search term is too short, return empty
      if (normalizedSearch.length < 2) {
        return [];
      }

      // Get locations to search (either provided or fetch all)
      const locationsToSearch = locations || await this.fetchAllLocations();
      
      if (!locationsToSearch || locationsToSearch.length === 0) {
        return [];
      }

      // Score and rank locations based on multiple matching strategies
      const scoredLocations = locationsToSearch.map(location => {
        if (!location.name || typeof location.name !== 'string') {
          return { location, score: 0 };
        }

        const locationName = location.name.toLowerCase();
        let score = 0;
        let matchType = 'none';

        // Strategy 1: Exact match (highest priority)
        if (locationName === normalizedSearch) {
          score = 100;
          matchType = 'exact';
        }
        // Strategy 2: Starts with search term
        else if (locationName.startsWith(normalizedSearch)) {
          score = 90;
          matchType = 'starts_with';
        }
        // Strategy 3: Ends with search term
        else if (locationName.endsWith(normalizedSearch)) {
          score = 85;
          matchType = 'ends_with';
        }
        // Strategy 4: Contains search term as whole word
        else if (locationName.includes(normalizedSearch)) {
          score = 80;
          matchType = 'contains';
        }
        // Strategy 5: Contains all search words (in any order)
        else if (this.containsAllWords(locationName, normalizedSearch)) {
          score = 70;
          matchType = 'all_words';
        }
        // Strategy 6: Fuzzy matching with typo tolerance
        else {
          const fuzzyScore = this.calculateFuzzyScore(locationName, normalizedSearch);
          // Much lower threshold for better typo tolerance
          if (fuzzyScore > 0.2) { // Lowered from 0.4 to 0.2 for much better typo handling
            score = Math.floor(fuzzyScore * 60);
            matchType = 'fuzzy';
          }
        }

        // Additional typo tolerance for common cases
        if (score === 0) {
          // Check for transposed characters (like "playgrond" vs "playground")
          const transposedScore = this.calculateTransposedSimilarity(locationName, normalizedSearch);
          if (transposedScore > 0.3) { // Lowered threshold
            score = Math.floor(transposedScore * 50);
            matchType = 'transposed';
          }
        }

        // Even more lenient fallback for single character differences
        if (score === 0) {
          const singleCharDiff = this.calculateSingleCharDifference(locationName, normalizedSearch);
          if (singleCharDiff > 0.3) {
            score = Math.floor(singleCharDiff * 40);
            matchType = 'single_char_diff';
          }
        }

        // Bonus points for shorter search terms matching longer location names
        if (score > 0 && normalizedSearch.length < locationName.length) {
          score += Math.min(10, (locationName.length - normalizedSearch.length) * 0.5);
        }

        // Debug logging for development - show ALL attempts, not just successful ones
        if (process.env.NODE_ENV === 'development') {
          const fuzzyScore = this.calculateFuzzyScore(locationName, normalizedSearch);
          const transposedScore = this.calculateTransposedSimilarity(locationName, normalizedSearch);
          const singleCharDiff = this.calculateSingleCharDifference(locationName, normalizedSearch);
          
          console.log(`Location: "${location.name}" | Search: "${normalizedSearch}" | Score: ${score} | Type: ${matchType}`);
          console.log(`  Fuzzy: ${fuzzyScore.toFixed(3)} | Transposed: ${transposedScore.toFixed(3)} | SingleChar: ${singleCharDiff.toFixed(3)}`);
        }

        return { location, score, matchType };
      }).filter(item => item.score > 0);

      // Sort by score (highest first) and then by name length (shorter names first for same score)
      scoredLocations.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.location.name.length - b.location.name.length;
      });

      // Return only the locations (without scores) but in ranked order
      return scoredLocations.map(item => item.location);

    } catch (error) {
      console.error('Error searching locations by name:', error);
      return [];
    }
  }

  // Helper method to check if location name contains all search words
  containsAllWords(locationName, searchTerm) {
    const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
    return searchWords.every(word => locationName.includes(word));
  }

  // Calculate subsequence matching score
  calculateSubsequenceScore(locationName, searchTerm) {
    let searchIndex = 0;
    let consecutiveMatches = 0;
    let totalMatches = 0;
    
    for (let i = 0; i < locationName.length && searchIndex < searchTerm.length; i++) {
      if (locationName[i] === searchTerm[searchIndex]) {
        totalMatches++;
        consecutiveMatches++;
        searchIndex++;
      } else {
        consecutiveMatches = 0;
      }
    }
    
    if (searchIndex === searchTerm.length) {
      // All search characters found in order
      const orderBonus = consecutiveMatches / searchTerm.length;
      return (totalMatches / searchTerm.length) * 0.7 + orderBonus * 0.3;
    }
    
    return totalMatches / searchTerm.length;
  }

  // Calculate similarity for transposed characters (like "playgrond" vs "playground")
  calculateTransposedSimilarity(locationName, searchTerm) {
    if (Math.abs(locationName.length - searchTerm.length) > 1) {
      return 0; // Only consider if lengths are similar
    }
    
    let matches = 0;
    let transpositions = 0;
    const maxLength = Math.max(locationName.length, searchTerm.length);
    
    // Check for exact character matches
    for (let i = 0; i < Math.min(locationName.length, searchTerm.length); i++) {
      if (locationName[i] === searchTerm[i]) {
        matches++;
      }
    }
    
    // Check for transposed characters (adjacent swaps)
    for (let i = 0; i < Math.min(locationName.length - 1, searchTerm.length - 1); i++) {
      if (locationName[i] === searchTerm[i + 1] && locationName[i + 1] === searchTerm[i]) {
        transpositions++;
        matches++; // Count transposed characters as matches
      }
    }
    
    // Calculate base similarity
    let similarity = matches / maxLength;
    
    // Bonus for transpositions (common typo)
    if (transpositions > 0) {
      similarity += 0.2;
    }
    
    // Bonus for length similarity
    const lengthBonus = 1 - (Math.abs(locationName.length - searchTerm.length) / maxLength);
    similarity += lengthBonus * 0.1;
    
    return Math.min(1.0, similarity);
  }

  // Calculate similarity for single character differences (like "playgroun" vs "playground")
  calculateSingleCharDifference(locationName, searchTerm) {
    const lenDiff = Math.abs(locationName.length - searchTerm.length);
    
    // If lengths differ by more than 2, it's probably not a simple typo
    if (lenDiff > 2) {
      return 0;
    }
    
    let differences = 0;
    const maxLength = Math.max(locationName.length, searchTerm.length);
    
    // Count character differences
    for (let i = 0; i < Math.min(locationName.length, searchTerm.length); i++) {
      if (locationName[i] !== searchTerm[i]) {
        differences++;
      }
    }
    
    // Add length difference to total differences
    differences += lenDiff;
    
    // Calculate similarity: fewer differences = higher similarity
    const similarity = 1 - (differences / maxLength);
    
    // Bonus for very similar strings (1-2 character differences)
    if (differences <= 2) {
      return similarity + 0.1;
    }
    
    return similarity;
  }

  // Enhanced fuzzy similarity score using multiple algorithms
  calculateFuzzyScore(locationName, searchTerm) {
    // Method 1: Simple character overlap
    const charOverlap = this.calculateCharacterOverlap(locationName, searchTerm);
    
    // Method 2: Word-based similarity
    const wordSimilarity = this.calculateWordSimilarity(locationName, searchTerm);
    
    // Method 3: Subsequence matching
    const subsequenceScore = this.calculateSubsequenceScore(locationName, searchTerm);
    
    // Method 4: Transposed character similarity
    const transposedSimilarity = this.calculateTransposedSimilarity(locationName, searchTerm);
    
    // Combine scores with weights (giving more weight to transposed similarity)
    const combinedScore = (charOverlap * 0.3) + (wordSimilarity * 0.3) + (subsequenceScore * 0.2) + (transposedSimilarity * 0.2);
    
    return Math.min(1.0, combinedScore);
  }

  // Calculate character overlap similarity
  calculateCharacterOverlap(locationName, searchTerm) {
    const locationChars = new Set(locationName.split(''));
    const searchChars = new Set(searchTerm.split(''));
    
    const intersection = new Set([...locationChars].filter(char => searchChars.has(char)));
    const union = new Set([...locationChars, ...searchChars]);
    
    return intersection.size / union.size;
  }

  // Calculate word-based similarity
  calculateWordSimilarity(locationName, searchTerm) {
    const locationWords = locationName.split(/\s+/).filter(word => word.length > 0);
    const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
    
    if (searchWords.length === 0) return 0;
    
    let totalWordScore = 0;
    
    for (const searchWord of searchWords) {
      let bestWordScore = 0;
      
      for (const locationWord of locationWords) {
        if (locationWord === searchWord) {
          bestWordScore = 1.0;
          break;
        } else if (locationWord.startsWith(searchWord) || locationWord.endsWith(searchWord)) {
          bestWordScore = Math.max(bestWordScore, 0.8);
        } else if (locationWord.includes(searchWord)) {
          bestWordScore = Math.max(bestWordScore, 0.6);
        } else if (searchWord.length > 2) {
          // Check for similar words (basic typo tolerance)
          const similarity = this.calculateWordSimilarityBasic(locationWord, searchWord);
          bestWordScore = Math.max(bestWordScore, similarity);
        }
      }
      
      totalWordScore += bestWordScore;
    }
    
    return totalWordScore / searchWords.length;
  }

  // Basic word similarity for typo tolerance
  calculateWordSimilarityBasic(word1, word2) {
    if (word1 === word2) return 1.0;
    if (Math.abs(word1.length - word2.length) > 2) return 0.0;
    
    // Simple character-based similarity
    let matches = 0;
    const maxLength = Math.max(word1.length, word2.length);
    
    for (let i = 0; i < Math.min(word1.length, word2.length); i++) {
      if (word1[i] === word2[i]) matches++;
    }
    
    // Bonus for length similarity
    const lengthBonus = 1 - (Math.abs(word1.length - word2.length) / maxLength);
    
    return (matches / maxLength) * 0.8 + lengthBonus * 0.2;
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


