/* React imports */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from '@googlemaps/markerclusterer';

/* Component imports */
import Header from "../components/Header";
import Footer from "../components/Footer";

/* Style imports */
import '../styles/LocationMap.css';

export default function LocationMap() {
    const navigate = useNavigate();
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.title = 'Spot a John - Map';
        initMap();
        fetchLocations();
    }, []);

    // Add markers when map is ready and locations are loaded
    useEffect(() => {
        if (map && locations.length > 0) {
            addMarkersToMap(locations);
        }
    }, [map, locations]);

    // Initialize Google Maps
    const initMap = async () => {
        try {
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

            const loader = new Loader({
                apiKey: apiKey,
                version: "weekly",
                libraries: ["places", "marker"]
            });

            const { Map, InfoWindow } = await loader.importLibrary("maps");
            const { AdvancedMarkerElement } = await loader.importLibrary("marker");
            
            // Get user's current location or default to New York City
            let center = { lat: 40.7128, lng: -74.0060 }; // Default to New York City
            
            try {
                const position = await getCurrentPosition();
                center = { lat: position.coords.latitude, lng: position.coords.longitude };
                console.log('Using user location:', center);
            } catch (locationError) {
                console.log('Using default location (NYC):', locationError.message);
            }
            
            const mapInstance = new Map(mapRef.current, {
                center: center,
                zoom: 13,
                mapId: "DEMO_MAP_ID", // Optional: for custom styling
            });

            setMap(mapInstance);
        } catch (error) {
            console.error('Error initializing map:', error);
            setError('Failed to load map: ' + error.message);
        }
    };

    // Helper function to get user's current position
    const getCurrentPosition = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => resolve(position),
                (error) => reject(error),
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    };

    // Fetch locations from backend
    const fetchLocations = async () => {
        try {
            setLoading(true);
            console.log('Fetching locations from backend...');
            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiBaseUrl}/api/locations`);
            const data = await response.json();
            
            console.log('Received locations data:', data.success ? data.data.length : 'failed');
            
            if (data.success) {
                setLocations(data.data);
                // Don't call addMarkersToMap here anymore - it will be called by useEffect
            } else {
                setError('Failed to fetch locations');
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
            setError('Failed to fetch locations');
        } finally {
            setLoading(false);
        }
    };

    // Add markers to the map with clustering
    const addMarkersToMap = async (locationData) => {
        console.log('Adding markers to map:', locationData.length, 'locations');
        if (!map) {
            console.log('Map not ready yet');
            return;
        }

        try {
            const { InfoWindow } = await google.maps.importLibrary("maps");
            const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

            // Create info window for markers
            const infoWindow = new InfoWindow({
                content: "",
                disableAutoPan: true,
            });

            // Close info window when clicking on the map
            map.addListener('click', () => {
                infoWindow.close();
            });

            // Create markers array
            const markers = locationData.map((location, i) => {
                // Create custom icon element using the icon.png
                const iconElement = document.createElement('img');
                iconElement.src = '/src/assets/icon.png';
                iconElement.style.width = '32px';
                iconElement.style.height = '32px';
                iconElement.style.cursor = 'pointer';
                iconElement.alt = location.name;

                const marker = new AdvancedMarkerElement({
                    position: { lat: location.latitude, lng: location.longitude },
                    content: iconElement,
                    title: location.name,
                });

                // Add click listener to marker
                marker.addListener('click', () => {
                    const content = `
                        <div class="map-info-window">
                            <h3>${location.name}</h3>
                            <p><strong>Address:</strong> ${location.address}</p>
                            ${location.source === 'nyc_open_data' ? `
                                <p><strong>Type:</strong> ${location.locationType || 'Unknown'}</p>
                                <p><strong>Operator:</strong> ${location.operator || 'Unknown'}</p>
                                ${location.hoursOfOperation ? `<p><strong>Hours:</strong> ${location.hoursOfOperation}</p>` : ''}
                                ${location.open ? `<p><strong>Open:</strong> ${location.open}</p>` : ''}
                            ` : `
                                <p><strong>Rating:</strong> ${location.rating}/5</p>
                                <p><strong>Cleanliness:</strong> ${location.cleanliness}/5</p>
                            `}
                            <div class="features">
                                ${location.accessibility ? '<span class="feature">♿ Accessible</span>' : ''}
                                ${location.babyChanging ? '<span class="feature">👶 Baby Changing</span>' : ''}
                                ${location.genderNeutral ? '<span class="feature">🌈 Gender Neutral</span>' : ''}
                            </div>
                            ${location.source === 'nyc_open_data' ? '<p class="source">Source: NYC Open Data</p>' : ''}
                        </div>
                    `;
                    infoWindow.setContent(content);
                    infoWindow.open(map, marker);
                });

                return marker;
            });

            // Add marker clusterer to manage the markers
            new MarkerClusterer({ markers, map });
            console.log('Successfully added', markers.length, 'markers to map');

        } catch (error) {
            console.error('Error adding markers to map:', error);
            setError('Failed to add markers to map');
        }
    };

    return (
        <div className="location-map-container">
            {/* Header */}
            <Header 
                userName="User" 
                showBackButton={true}
                backButtonText="Back to Dashboard"
                backButtonPath="/user-home"
            />

            {/* Main Content */}
            <main className="location-map-main">
                <div className="map-header">
                    <h1>Location Map</h1>
                    <p>Find and explore bathroom locations near you</p>
                </div>

                {/* Map Container */}
                <div className="map-container">
                    {loading && <div className="map-loading">Loading map...</div>}
                    {error && <div className="map-error">Error: {error}</div>}
                    <div 
                        ref={mapRef} 
                        className="map-element"
                    />
                </div>

                {/* Location Count */}
                {locations.length > 0 && (
                    <div className="location-count">
                        Found {locations.length} location{locations.length !== 1 ? 's' : ''} nearby
                        <div className="back-dashboard-wrapper">
                            <button
                                className="back-dashboard-btn"
                                onClick={() => navigate('/home')}
                            >
                                 Back to Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}