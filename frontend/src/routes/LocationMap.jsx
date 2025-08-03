/* React imports */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* Component imports */
import Header from "../components/Header";
import Footer from "../components/Footer";

/* Style imports */
import '../styles/LocationMap.css';

export default function LocationMap() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Spot a John - Map';
    }, []);

    return (
        <div className="location-map-container">
            {/* Header */}
            <Header 
                userName="User" 
                showBackButton={true}
                backButtonText="Back to Dashboard"
                backButtonPath="/home"
            />

            {/* Main Content */}
            <main className="location-map-main">
                <div className="map-header">
                    <h1>🗺️ Location Map</h1>
                    <p>Find and explore bathroom locations near you</p>
                </div>

                <div className="map-content">
                    <div className="map-placeholder">
                        <div className="map-placeholder-content">
                            <h2>Map Coming Soon!</h2>
                            <p>This is where the interactive map will be displayed.</p>
                            <div className="map-features">
                                <div className="map-feature">
                                    <span className="feature-icon">📍</span>
                                    <span>Find nearby bathrooms</span>
                                </div>
                                <div className="map-feature">
                                    <span className="feature-icon">⭐</span>
                                    <span>View ratings and reviews</span>
                                </div>
                                <div className="map-feature">
                                    <span className="feature-icon">➕</span>
                                    <span>Add new locations</span>
                                </div>
                                <div className="map-feature">
                                    <span className="feature-icon">🔍</span>
                                    <span>Search by location</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="map-controls">
                        <button className="control-btn control-btn--primary">
                            📍 Use My Location
                        </button>
                        <button className="control-btn control-btn--secondary">
                            🔍 Search Area
                        </button>
                        <button className="control-btn control-btn--success">
                            ➕ Add New Location
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}