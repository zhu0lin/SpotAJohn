import { db } from '../src/config/firebase.js';

async function testFirebaseConnection() {
    try {
        console.log('Testing Firebase connection...');
        
        // Test basic connection by trying to read from a known collection
        const locationsSnapshot = await db.collection('locations').limit(1).get();
        console.log('Successfully connected to Firestore');
        console.log(`Found ${locationsSnapshot.size} documents in locations collection`);
        
        // Test creating a test document in userLocations collection
        const testUserId = 'test-user-123';
        const testLocationId = 'test-location-123';
        
        console.log('\nTesting userLocations collection creation...');
        
        // Try to create a test document
        await db
            .collection('userLocations')
            .doc(testUserId)
            .collection('locations')
            .doc(testLocationId)
            .set({
                name: 'Test Location',
                address: '123 Test St, Test City, NY',
                test: true,
                createdAt: new Date()
            });
        
        console.log('Successfully created test document in userLocations collection');
        
        // Clean up test data
        await db
            .collection('userLocations')
            .doc(testUserId)
            .collection('locations')
            .doc(testLocationId)
            .delete();
        
        console.log('Successfully cleaned up test data');
        console.log('Firebase connection and userLocations collection are working!');
        
    } catch (error) {
        console.error('Firebase connection failed:', error.message);
        console.error('\nThis usually means:');
        console.error('1. Firebase credentials are not set up');
        console.error('2. Firebase project ID is incorrect');
        console.error('3. Service account key is invalid');
        console.error('\nTo fix this:');
        console.error('1. Go to Firebase Console > Project Settings > Service Accounts');
        console.error('2. Click "Generate New Private Key"');
        console.error('3. Copy the values to a .env file in the backend directory');
        console.error('4. Make sure FIREBASE_PROJECT_ID matches your project ID');
    }
}

testFirebaseConnection();

