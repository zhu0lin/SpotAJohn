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

// GET /api/locations/filter-options - Get available filter options for UI
router.get('/filter-options', async (req, res) => {
  try {
    const filterOptions = await locationService.getAvailableFilterOptions();
    res.json({
      success: true,
      data: filterOptions
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch filter options'
    });
  }
});

// Search locations by name
// GET /api/locations/search?q=searchTerm
// Returns locations whose names match the search term
// Handles case-insensitive search with space/punctuation normalization
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search term is required'
      });
    }

    const results = await locationService.searchLocationsByName(q);
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Error searching locations by name:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search locations by name'
    });
  }
});

// TODO: Implement filter locations route  
// GET /api/locations/filter?accessibility=true&minRating=4.0&babyChanging=true
// This route should:
// 1. Extract filter parameters from req.query
// 2. Validate that at least one filter is provided
// 3. Call locationService.filterLocations()
// 4. Return results with proper error handling
// 5. Consider adding pagination if needed
router.get('/filter', async (req, res) => {
  try {
    const filters = {};
    
    // Extract filter parameters from req.query
    if (req.query.accessibility !== undefined) {
      filters.accessibility = req.query.accessibility === 'true';
    }
    if (req.query.babyChanging !== undefined) {
      filters.babyChanging = req.query.babyChanging === 'true';
    }
    if (req.query.genderNeutral !== undefined) {
      filters.genderNeutral = req.query.genderNeutral === 'true';
    }
    if (req.query.minRating !== undefined) {
      const minRating = parseFloat(req.query.minRating);
      if (!isNaN(minRating) && minRating >= 0 && minRating <= 5) {
        filters.minRating = minRating;
      }
    }
    if (req.query.minCleanliness !== undefined) {
      const minCleanliness = parseFloat(req.query.minCleanliness);
      if (!isNaN(minCleanliness) && minCleanliness >= 0 && minCleanliness <= 5) {
        filters.minCleanliness = minCleanliness;
      }
    }
    if (req.query.locationType !== undefined) {
      filters.locationType = req.query.locationType;
    }
    if (req.query.operator !== undefined) {
      filters.operator = req.query.operator;
    }
    if (req.query.openStatus !== undefined) {
      filters.openStatus = req.query.openStatus;
    }
    if (req.query.restroomType !== undefined) {
      filters.restroomType = req.query.restroomType;
    }

    // Validate that at least one filter is provided
    if (Object.keys(filters).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one filter parameter is required'
      });
    }

    // Call locationService.filterLocations()
    const results = await locationService.filterLocations(filters);
    
    res.json({
      success: true,
      data: results,
      count: results.length,
      filters: filters
    });

  } catch (error) {
    console.error('Error filtering locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to filter locations'
    });
  }
});

// TODO: Implement combined search and filter route
// GET /api/locations/search-filter?q=searchTerm&accessibility=true&minRating=4.0
// This route should:
// 1. Extract both search term and filters from req.query
// 2. Validate that at least search term OR filters are provided
// 3. Call locationService.searchAndFilterLocations()
// 4. Return results with proper error handling
// 5. Consider adding pagination if needed
router.get('/search-filter', async (req, res) => {
  try {
    const { q: searchTerm, ...filterParams } = req.query;
    const filters = {};
    
    // Extract filter parameters from req.query
    if (filterParams.accessibility !== undefined) {
      filters.accessibility = filterParams.accessibility === 'true';
    }
    if (filterParams.babyChanging !== undefined) {
      filters.babyChanging = filterParams.babyChanging === 'true';
    }
    if (filterParams.genderNeutral !== undefined) {
      filters.genderNeutral = filterParams.genderNeutral === 'true';
    }
    if (filterParams.minRating !== undefined) {
      const minRating = parseFloat(filterParams.minRating);
      if (!isNaN(minRating) && minRating >= 0 && minRating <= 5) {
        filters.minRating = minRating;
      }
    }
    if (filterParams.minCleanliness !== undefined) {
      const minCleanliness = parseFloat(filterParams.minCleanliness);
      if (!isNaN(minCleanliness) && minCleanliness >= 0 && minCleanliness <= 5) {
        filters.minCleanliness = minCleanliness;
      }
    }
    if (filterParams.locationType !== undefined) {
      filters.locationType = filterParams.locationType;
    }
    if (filterParams.operator !== undefined) {
      filters.operator = filterParams.operator;
    }
    if (filterParams.openStatus !== undefined) {
      filters.openStatus = filterParams.openStatus;
    }
    if (filterParams.restroomType !== undefined) {
      filters.restroomType = filterParams.restroomType;
    }

    // Validate that at least search term OR filters are provided
    if ((!searchTerm || searchTerm.trim().length === 0) && Object.keys(filters).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Either search term (q) or filters are required'
      });
    }

    // Call locationService.searchAndFilterLocations()
    const results = await locationService.searchAndFilterLocations(
      searchTerm ? searchTerm.trim() : '',
      filters
    );
    
    res.json({
      success: true,
      data: results,
      count: results.length,
      searchTerm: searchTerm || null,
      filters: filters
    });

  } catch (error) {
    console.error('Error searching and filtering locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search and filter locations'
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


