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

    // Initialize Google Maps
    const initMap = async () => {
        try {
            const loader = new Loader({
                apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
                version: "weekly",
                libraries: ["places", "marker"]
            });

            const { Map, InfoWindow } = await loader.importLibrary("maps");
            const { AdvancedMarkerElement, PinElement } = await loader.importLibrary("marker");
            
            // Default to New York City coordinates
            const mapInstance = new Map(mapRef.current, {
                center: { lat: 40.7128, lng: -74.0060 }, // New York City
                zoom: 13,
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

    // Add markers to the map with clustering
    const addMarkersToMap = async (locationData) => {
        if (!map) return;

        try {
            const { InfoWindow } = await google.maps.importLibrary("maps");
            const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

            // Create info window for markers
            const infoWindow = new InfoWindow({
                content: "",
                disableAutoPan: true,
            });

            // Create markers array
            const markers = locationData.map((location, i) => {
                // Create custom pin element
                const pinElement = new PinElement({
                    glyph: `${i + 1}`,
                    glyphColor: "white",
                    background: "#28A745",
                    borderColor: "#1e7e34",
                });

                const marker = new AdvancedMarkerElement({
                    position: { lat: location.latitude, lng: location.longitude },
                    content: pinElement.element,
                    title: location.name,
                });

                // Add click listener to marker
                marker.addListener('click', () => {
                    const content = `
                        <div class="map-info-window">
                            <h3>${location.name}</h3>
                            <p>${location.address}</p>
                            <p>Rating: ${location.rating}/5</p>
                            <p>Cleanliness: ${location.cleanliness}/5</p>
                            ${location.accessibility ? '<p class="feature">♿ Accessible</p>' : ''}
                            ${location.babyChanging ? '<p class="feature">👶 Baby Changing</p>' : ''}
                            ${location.genderNeutral ? '<p class="feature">🌈 Gender Neutral</p>' : ''}
                        </div>
                    `;
                    infoWindow.setContent(content);
                    infoWindow.open(map, marker);
                });

                return marker;
            });

            // Add marker clusterer to manage the markers
            new MarkerClusterer({ markers, map });

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