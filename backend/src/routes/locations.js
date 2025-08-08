import express from 'express';
import firestoreService from '../services/firestoreService.js';
import locationService from '../services/locationService.js';
import cronService from '../services/cronService.js';

const router = express.Router();

// GET /api/locations - Get all locations
router.get('/', async (req, res) => {
  try {
    const locations = await firestoreService.getAllLocations();
    res.json({
      success: true,
      data: locations,
      count: locations.length
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch locations'
    });
  }
});

// GET /api/locations/nearby - Get locations within a radius
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const locations = await firestoreService.getLocationsNearby(
      parseFloat(lat), 
      parseFloat(lng), 
      parseFloat(radius)
    );

    res.json({
      success: true,
      data: locations,
      count: locations.length,
      query: { lat, lng, radius }
    });
  } catch (error) {
    console.error('Error fetching nearby locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nearby locations'
    });
  }
});

// GET /api/locations/stats - Get location statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await firestoreService.getLocationStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching location stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch location statistics'
    });
  }
});

// POST /api/locations/update - Manually trigger location update
router.post('/update', async (req, res) => {
  try {
    await cronService.triggerLocationUpdate();
    res.json({
      success: true,
      message: 'Location update triggered successfully'
    });
  } catch (error) {
    console.error('Error triggering location update:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger location update'
    });
  }
});

// POST /api/locations/cleanup - Manually trigger data cleanup
router.post('/cleanup', async (req, res) => {
  try {
    await cronService.triggerDataCleanup();
    res.json({
      success: true,
      message: 'Data cleanup triggered successfully'
    });
  } catch (error) {
    console.error('Error triggering data cleanup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger data cleanup'
    });
  }
});

// GET /api/locations/cron/status - Get cron job status
router.get('/cron/status', async (req, res) => {
  try {
    const status = cronService.getJobStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error fetching cron status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cron status'
    });
  }
});

// GET /api/locations/:id - Get a specific location
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const locations = await firestoreService.getAllLocations();
    const location = locations.find(loc => loc.id === id);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    res.json({
      success: true,
      data: location
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch location'
    });
  }
});

// PUT /api/locations/:id - Update a specific location
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    await firestoreService.updateLocation(id, updates);
    
    res.json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update location'
    });
  }
});

// DELETE /api/locations/:id - Delete a specific location
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await firestoreService.deleteLocation(id);
    
    res.json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete location'
    });
  }
});

export default router;


