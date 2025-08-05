/* React imports */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from "@googlemaps/js-api-loader";

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

    // Initialize Google Maps
    const initMap = async () => {
        try {
            const loader = new Loader({
                apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
                version: "weekly",
                libraries: ["places"]
            });

            const { Map } = await loader.importLibrary("maps");
            
            // Default to New York City coordinates
            const mapInstance = new Map(mapRef.current, {
                center: { lat: 40.7128, lng: -74.0060 }, // New York City
                zoom: 12,
                mapId: "DEMO_MAP_ID", // Optional: for custom styling
            });

            setMap(mapInstance);
        } catch (error) {
            console.error('Error initializing map:', error);
            setError('Failed to load map');
        }
    };

    // Fetch locations from backend
    const fetchLocations = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/locations');
            const data = await response.json();
            
            if (data.success) {
                setLocations(data.data);
                addMarkersToMap(data.data);
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

    // Add markers to the map
    const addMarkersToMap = (locationData) => {
        if (!map) return;

        locationData.forEach(location => {
            const marker = new google.maps.Marker({
                position: { lat: location.latitude, lng: location.longitude },
                map: map,
                title: location.name,
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" fill="#28A745" stroke="white" stroke-width="2"/>
                            <path d="M8 8h8v8H8z" fill="white"/>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(24, 24),
                    anchor: new google.maps.Point(12, 12)
                }
            });

            // Create info window for marker
            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div class="map-info-window">
                        <h3>${location.name}</h3>
                        <p>${location.address}</p>
                        <p>Rating: ${location.rating}/5</p>
                        <p>Cleanliness: ${location.cleanliness}/5</p>
                        ${location.accessibility ? '<p class="feature">♿ Accessible</p>' : ''}
                        ${location.babyChanging ? '<p class="feature">👶 Baby Changing</p>' : ''}
                        ${location.genderNeutral ? '<p class="feature">🌈 Gender Neutral</p>' : ''}
                    </div>
                `
            });

            // Add click listener to marker
            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });
        });
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
                    <h1>🗺️ Location Map</h1>
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
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}