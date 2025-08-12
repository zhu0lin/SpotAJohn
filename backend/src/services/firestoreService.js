import { db } from '../config/firebase.js';

class FirestoreService {
  constructor() {
    this.collectionName = 'locations';
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  // Get cache key for locations
  getCacheKey() {
    return `all_locations_${this.collectionName}`;
  }

  // Check if cache is valid
  isCacheValid(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < this.cacheExpiry;
  }

  // Store locations in Firestore
  async storeLocations(locations) {
    try {
      const batch = db.batch();
      const collectionRef = db.collection(this.collectionName);

      // Clear existing data first
      const existingDocs = await collectionRef.get();
      existingDocs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new locations
      locations.forEach(location => {
        const docRef = collectionRef.doc(location.id);
        batch.set(docRef, {
          ...location,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });

      await batch.commit();
      
      // Clear cache after storing new data
      this.clearCache();
      
      console.log(`Successfully stored ${locations.length} locations in Firestore`);
      return { success: true, count: locations.length };
    } catch (error) {
      console.error('Error storing locations in Firestore:', error);
      throw error;
    }
  }

  // Clear the cache
  clearCache() {
    this.cache.clear();
    console.log('Cache cleared');
  }

  // Get cache statistics
  getCacheStats() {
    const cacheKey = this.getCacheKey();
    const cached = this.cache.get(cacheKey);
    
    if (!cached) {
      return { hasCache: false, age: null, count: 0 };
    }
    
    const age = Date.now() - cached.timestamp;
    const isValid = age < this.cacheExpiry;
    
    return {
      hasCache: true,
      age: age,
      isValid: isValid,
      count: cached.data.length,
      expiresIn: Math.max(0, this.cacheExpiry - age)
    };
  }

  // Get all locations from Firestore with caching
  async getAllLocations() {
    try {
      const cacheKey = this.getCacheKey();
      
      // Check cache first
      if (this.isCacheValid(cacheKey)) {
        console.log('Returning locations from cache');
        return this.cache.get(cacheKey).data;
      }

      console.log('Fetching locations from Firestore...');
      const snapshot = await db.collection(this.collectionName).get();
      const locations = [];
      
      snapshot.forEach(doc => {
        locations.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Store in cache
      this.cache.set(cacheKey, {
        data: locations,
        timestamp: Date.now()
      });

      console.log(`Successfully fetched ${locations.length} locations from Firestore`);
      return locations;
    } catch (error) {
      console.error('Error fetching locations from Firestore:', error);
      
      // Try to return cached data if available (even if expired)
      const cacheKey = this.getCacheKey();
      const cached = this.cache.get(cacheKey);
      if (cached && cached.data.length > 0) {
        console.log('Returning stale cached data due to Firestore error');
        return cached.data;
      }
      
      throw error;
    }
  }

  // Get locations within a certain radius
  async getLocationsNearby(lat, lng, radiusKm = 10) {
    try {
      // Note: Firestore doesn't support native geospatial queries

      const allLocations = await this.getAllLocations();
      
      return allLocations.filter(location => {
        const distance = this.calculateDistance(lat, lng, location.latitude, location.longitude);
        return distance <= radiusKm;
      });
    } catch (error) {
      console.error('Error fetching nearby locations:', error);
      throw error;
    }
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Update a single location
  async updateLocation(locationId, updates) {
    try {
      await db.collection(this.collectionName).doc(locationId).update({
        ...updates,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  // Delete a location
  async deleteLocation(locationId) {
    try {
      await db.collection(this.collectionName).doc(locationId).delete();
      return { success: true };
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }

  // Get location statistics
  async getLocationStats() {
    try {
      const locations = await this.getAllLocations();
      
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
      throw error;
    }
  }
}

export default new FirestoreService();


