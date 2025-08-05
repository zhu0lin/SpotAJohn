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

                
            </main>

            <Footer />
        </div>
    );
}