import express from 'express';
import nycLocationService from '../services/nycLocationService.js';
import firestoreService from '../services/firestoreService.js';

const router = express.Router();

// Get all NYC locations (root endpoint)
router.get('/', async (req, res) => {
  try {
    const locations = await firestoreService.getAllLocations();
    const nycLocations = locations.filter(loc => loc.source === 'nyc_open_data');
    
    res.json({
      success: true,
      data: nycLocations
    });
  } catch (error) {
    console.error('Error getting NYC locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get NYC locations',
      error: error.message
    });
  }
});

// Import NYC locations into Firestore
router.post('/import', async (req, res) => {
  try {
    console.log('Starting NYC locations import...');
    
    // Fetch NYC data
    const nycLocations = await nycLocationService.fetchNYCLocations();
    
    if (nycLocations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No NYC locations found or failed to fetch data'
      });
    }

    // Store in Firestore
    const result = await firestoreService.storeLocations(nycLocations);
    
    // Get statistics
    const stats = nycLocationService.getNYCStats(nycLocations);
    
    console.log(`Successfully imported ${nycLocations.length} NYC locations`);
    
    res.json({
      success: true,
      message: `Successfully imported ${nycLocations.length} NYC locations`,
      data: {
        importedCount: nycLocations.length,
        stats: stats
      }
    });
    
  } catch (error) {
    console.error('Error importing NYC locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import NYC locations',
      error: error.message
    });
  }
});

// Get NYC locations statistics
router.get('/stats', async (req, res) => {
  try {
    const locations = await firestoreService.getAllLocations();
    const nycLocations = locations.filter(loc => loc.source === 'nyc_open_data');
    const stats = nycLocationService.getNYCStats(nycLocations);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting NYC stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get NYC statistics',
      error: error.message
    });
  }
});

// Get NYC locations only
router.get('/locations', async (req, res) => {
  try {
    const locations = await firestoreService.getAllLocations();
    const nycLocations = locations.filter(loc => loc.source === 'nyc_open_data');
    
    res.json({
      success: true,
      data: nycLocations
    });
  } catch (error) {
    console.error('Error getting NYC locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get NYC locations',
      error: error.message
    });
  }
});

export default router;
