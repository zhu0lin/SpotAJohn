import dotenv from 'dotenv';
import nycLocationService from '../src/services/nycLocationService.js';
import firestoreService from '../src/services/firestoreService.js';

// Load environment variables
dotenv.config();

async function importNYCData() {
  try {
    console.log('Starting NYC public bathroom data import...');
    
    // Fetch NYC data
    const nycLocations = await nycLocationService.fetchNYCLocations();
    
    if (nycLocations.length === 0) {
      console.log('No NYC locations found or failed to fetch data');
      return;
    }

    console.log(`Found ${nycLocations.length} operational NYC locations`);
    
    // Store in Firestore
    const result = await firestoreService.storeLocations(nycLocations);
    
    // Get statistics
    const stats = nycLocationService.getNYCStats(nycLocations);
    
    console.log('Successfully imported NYC locations!');
    console.log('\n Import Statistics:');
    console.log(`   Total locations: ${stats.total}`);
    console.log(`   Accessible: ${stats.accessibleCount}`);
    console.log(`   Baby changing: ${stats.babyChangingCount}`);
    console.log(`   Gender neutral: ${stats.genderNeutralCount}`);
    console.log(`   Year round: ${stats.yearRoundCount}`);
    console.log(`   Seasonal: ${stats.seasonalCount}`);
    
    console.log('\n By Location Type:');
    Object.entries(stats.byLocationType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    
    console.log('\n By Operator:');
    Object.entries(stats.byOperator).forEach(([operator, count]) => {
      console.log(`   ${operator}: ${count}`);
    });
    
  } catch (error) {
    console.error(' Error importing NYC locations:', error);
  }
}

// Run the import
importNYCData();
