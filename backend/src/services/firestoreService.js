import { db } from '../config/firebase.js';

class FirestoreService {
  constructor() {
    this.collectionName = 'locations';
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
      console.log(`Successfully stored ${locations.length} locations in Firestore`);
      return { success: true, count: locations.length };
    } catch (error) {
      console.error('Error storing locations in Firestore:', error);
      throw error;
    }
  }

  // Get all locations from Firestore
  async getAllLocations() {
    try {
      const snapshot = await db.collection(this.collectionName).get();
      const locations = [];
      
      snapshot.forEach(doc => {
        locations.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return locations;
    } catch (error) {
      console.error('Error fetching locations from Firestore:', error);
      throw error;
    }
  }

  // Get locations within a certain radius
  async getLocationsNearby(lat, lng, radiusKm = 10) {
    try {
      // Note: Firestore doesn't support native geospatial queries
      // This is a simplified approach - in production, you might want to use
      // a geospatial library or implement a more sophisticated query
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


