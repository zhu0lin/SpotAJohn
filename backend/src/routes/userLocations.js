import express from 'express';
import { db, admin } from '../config/firebase.js';

const router = express.Router();

// Middleware to verify Firebase auth token
const authenticateUser = async (req, res, next) => {
    try {
        console.log('Authenticating user...');
        console.log('Headers:', JSON.stringify(req.headers, null, 2));
        
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No authorization header or invalid format');
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];
        console.log('Token received (first 20 chars):', token.substring(0, 20) + '...');
        
        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log('Token verified successfully');
        console.log('User ID from token:', decodedToken.uid);
        
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code
        });
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Add location to user's saved locations
router.post('/', authenticateUser, async (req, res) => {
    try {
        console.log('POST /api/user-locations - Request received');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('User ID:', req.user.uid);
        
        const { locationId, locationData } = req.body;
        const userId = req.user.uid;

        if (!locationId || !locationData) {
            console.log('Missing required fields');
            return res.status(400).json({ error: 'Location ID and data are required' });
        }

        console.log('Checking if location already exists...');
        
        // Check if location already exists in user's saved locations
        const existingDoc = await db
            .collection('userLocations')
            .doc(userId)
            .collection('locations')
            .doc(locationId)
            .get();

        if (existingDoc.exists) {
            console.log('Location already exists for user');
            return res.status(409).json({ error: 'Location already saved' });
        }

        console.log('Adding location to user collection...');
        
        // Add location to user's collection
        await db
            .collection('userLocations')
            .doc(userId)
            .collection('locations')
            .doc(locationId)
            .set({
                ...locationData,
                savedAt: new Date(),
                userId: userId
            });

        console.log('Location added successfully');
        
        res.json({ 
            success: true, 
            message: 'Location added successfully',
            locationId: locationId
        });

    } catch (error) {
        console.error('Error adding location to user profile:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ error: 'Failed to add location' });
    }
});

// Get user's saved locations
router.get('/', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.uid;

        const snapshot = await db
            .collection('userLocations')
            .doc(userId)
            .collection('locations')
            .get();

        const locations = [];
        snapshot.forEach(doc => {
            locations.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json({ 
            success: true, 
            data: locations 
        });

    } catch (error) {
        console.error('Error fetching user locations:', error);
        res.status(500).json({ error: 'Failed to fetch locations' });
    }
});

// Remove location from user's saved locations
router.delete('/:locationId', authenticateUser, async (req, res) => {
    try {
        const { locationId } = req.params;
        const userId = req.user.uid;

        await db
            .collection('userLocations')
            .doc(userId)
            .collection('locations')
            .doc(locationId)
            .delete();

        res.json({ 
            success: true, 
            message: 'Location removed successfully' 
        });

    } catch (error) {
        console.error('Error removing location from user profile:', error);
        res.status(500).json({ error: 'Failed to remove location' });
    }
});

export default router;
