import axios from 'axios';

class NYCLocationService {
  constructor() {
    this.apiUrl = 'https://data.cityofnewyork.us/resource/i7jb-7jku.json';
  }

  // Fetch NYC public bathroom data
  async fetchNYCLocations() {
    try {
      console.log('Fetching NYC public bathroom data...');
      const response = await axios.get(this.apiUrl);
      return this.processNYCData(response.data);
    } catch (error) {
      console.error('Error fetching NYC locations:', error);
      return [];
    }
  }

  // Process NYC data into our format
  processNYCData(nycData) {
    return nycData
      .filter(location => {
        // Only include operational locations with valid coordinates
        return location.status === 'Operational' && 
               location.latitude && 
               location.longitude;
      })
      .map((location, index) => ({
        id: `nyc_${location.facility_name?.replace(/[^a-zA-Z0-9]/g, '_')}_${index}`,
        name: location.facility_name || 'NYC Public Bathroom',
        address: this.formatAddress(location),
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        rating: 3.5, // Default rating for NYC locations
        cleanliness: 3.0, // Default cleanliness
        accessibility: this.parseAccessibility(location.accessibility),
        babyChanging: this.parseBabyChanging(location.changing_stations),
        genderNeutral: this.parseGenderNeutral(location.restroom_type),
        source: 'nyc_open_data',
        locationType: location.location_type || null,
        operator: location.operator || null,
        status: location.status || null,
        hoursOfOperation: location.hours_of_operation || null,
        open: location.open || null,
        restroomType: location.restroom_type || null,
        website: location.website?.url || null,
        lastUpdated: new Date().toISOString(),
        tags: {
          locationType: location.location_type || null,
          operator: location.operator || null,
          open: location.open || null,
          restroomType: location.restroom_type || null
        }
      }));
  }

  // Format address from NYC data
  formatAddress(location) {
    if (location.facility_name) {
      return `${location.facility_name}, New York, NY`;
    }
    return 'New York, NY';
  }

  // Parse accessibility information
  parseAccessibility(accessibility) {
    if (!accessibility) return false;
    return accessibility.toLowerCase().includes('accessible');
  }

  // Parse baby changing station information
  parseBabyChanging(changingStations) {
    if (!changingStations) return false;
    const changing = changingStations.toLowerCase();
    return changing.includes('yes') && !changing.includes('n/a');
  }

  // Parse gender neutral information
  parseGenderNeutral(restroomType) {
    if (!restroomType) return false;
    const type = restroomType.toLowerCase();
    return type.includes('all gender') || type.includes('unisex');
  }

  // Get location statistics for NYC data
  getNYCStats(locations) {
    const stats = {
      total: locations.length,
      byLocationType: {},
      byOperator: {},
      accessibleCount: 0,
      babyChangingCount: 0,
      genderNeutralCount: 0,
      yearRoundCount: 0,
      seasonalCount: 0
    };

    locations.forEach(location => {
      // Count by location type
      const locationType = location.locationType || 'Unknown';
      stats.byLocationType[locationType] = (stats.byLocationType[locationType] || 0) + 1;

      // Count by operator
      const operator = location.operator || 'Unknown';
      stats.byOperator[operator] = (stats.byOperator[operator] || 0) + 1;

      // Count features
      if (location.accessibility) stats.accessibleCount++;
      if (location.babyChanging) stats.babyChangingCount++;
      if (location.genderNeutral) stats.genderNeutralCount++;

      // Count by open status
      if (location.open === 'Year Round') stats.yearRoundCount++;
      if (location.open === 'Seasonal') stats.seasonalCount++;
    });

    return stats;
  }
}

export default new NYCLocationService();
