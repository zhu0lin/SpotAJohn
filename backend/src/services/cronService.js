import cron from 'cron';
import locationService from './locationService.js';
import firestoreService from './firestoreService.js';

class CronService {
  constructor() {
    this.jobs = new Map();
  }

  // Initialize all cron jobs
  init() {
    this.startLocationUpdateJob();
    this.startDataCleanupJob();
    console.log('Cron jobs initialized');
  }

  // Job to update location data every 6 hours
  startLocationUpdateJob() {
    const job = new cron.CronJob(
      '0 */6 * * *', // Every 6 hours at minute 0
      async () => {
        console.log('Starting scheduled location data update...');
        try {
          await this.updateLocationData();
          console.log('Scheduled location data update completed successfully');
        } catch (error) {
          console.error('Error in scheduled location data update:', error);
        }
      },
      null,
      false, // Don't start immediately
      'America/New_York' // Timezone
    );

    this.jobs.set('locationUpdate', job);
    job.start();
    console.log('Location update cron job started (every 6 hours)');
  }

  // Job to clean up old data every day at 2 AM
  startDataCleanupJob() {
    const job = new cron.CronJob(
      '0 2 * * *', // Every day at 2 AM
      async () => {
        console.log('Starting scheduled data cleanup...');
        try {
          await this.cleanupOldData();
          console.log('Scheduled data cleanup completed successfully');
        } catch (error) {
          console.error('Error in scheduled data cleanup:', error);
        }
      },
      null,
      false,
      'America/New_York'
    );

    this.jobs.set('dataCleanup', job);
    job.start();
    console.log('Data cleanup cron job started (daily at 2 AM)');
  }

  // Update location data from external sources
  async updateLocationData() {
    try {
      console.log('Fetching location data from external sources...');
      
      // Fetch new location data
      const locations = await locationService.fetchAllLocations();
      
      if (locations.length === 0) {
        console.log('No locations fetched, skipping update');
        return;
      }

      console.log(`Fetched ${locations.length} locations from external sources`);

      // Store in Firestore
      const result = await firestoreService.storeLocations(locations);
      
      console.log(`Successfully updated ${result.count} locations in database`);
      
      // Log statistics
      const stats = await firestoreService.getLocationStats();
      console.log('Current database statistics:', stats);
      
    } catch (error) {
      console.error('Error updating location data:', error);
      throw error;
    }
  }

  // Clean up old or invalid data
  async cleanupOldData() {
    try {
      console.log('Starting data cleanup...');
      
      const locations = await firestoreService.getAllLocations();
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      
      let cleanedCount = 0;
      
      for (const location of locations) {
        // Remove locations that haven't been updated in 30 days
        if (location.lastUpdated && new Date(location.lastUpdated) < thirtyDaysAgo) {
          await firestoreService.deleteLocation(location.id);
          cleanedCount++;
        }
        
        // Remove locations with invalid coordinates
        if (!location.latitude || !location.longitude || 
            location.latitude === 0 || location.longitude === 0) {
          await firestoreService.deleteLocation(location.id);
          cleanedCount++;
        }
      }
      
      console.log(`Cleaned up ${cleanedCount} old/invalid locations`);
      
    } catch (error) {
      console.error('Error during data cleanup:', error);
      throw error;
    }
  }

  // Manually trigger location update
  async triggerLocationUpdate() {
    console.log('Manually triggering location update...');
    await this.updateLocationData();
  }

  // Manually trigger data cleanup
  async triggerDataCleanup() {
    console.log('Manually triggering data cleanup...');
    await this.cleanupOldData();
  }

  // Stop all cron jobs
  stopAll() {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`Stopped cron job: ${name}`);
    });
    this.jobs.clear();
  }

  // Get status of all cron jobs
  getJobStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running,
        nextDate: job.nextDate().toISOString()
      };
    });
    return status;
  }
}

export default new CronService();


