/* React imports */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

/* Component imports */
import Header from "../components/Header";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";

/* Style imports */
import '../styles/SavedLocations.css';
import { config } from '../config.js';

export default function SavedLocations() {
    const navigate = useNavigate();
    const [savedLocations, setSavedLocations] = useState([]);
    const [locationsLoading, setLocationsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        document.title = 'Spot a John - Saved Locations';
        fetchSavedLocations();
    }, []);

    const fetchSavedLocations = async () => {
        try {
            setLocationsLoading(true);
            const user = auth.currentUser;
            if (!user) return;
            
            const token = await user.getIdToken();
            const apiBaseUrl = config.backend.baseURL;
            
            const response = await fetch(`${apiBaseUrl}${config.backend.endpoints.userLocations}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSavedLocations(data.data || []);
            } else {
                setError('Failed to fetch saved locations');
            }
        } catch (error) {
            console.error('Error fetching saved locations:', error);
            setError('Error loading saved locations');
        } finally {
            setLocationsLoading(false);
        }
    };

    const handleRemoveLocation = async (locationId) => {
        try {
            const user = auth.currentUser;
            if (!user) return;
            
            const token = await user.getIdToken();
            const apiBaseUrl = config.backend.baseURL;
            
            const response = await fetch(`${apiBaseUrl}${config.backend.endpoints.userLocations}/${locationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Remove from local state
                setSavedLocations(prev => 
                    prev.filter(loc => loc.id !== locationId)
                );
            } else {
                setError('Failed to remove location');
            }
        } catch (error) {
            console.error('Error removing location:', error);
            setError('Error removing location');
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="saved-locations-container">
            {/* Header */}
            <Header
                userName={auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'User'}
            />

            {/* Main Content */}
            <main className="saved-locations-main">
                <div className="page-header">
                    <h1>My Saved Locations</h1>
                    <p>Your favorite restroom locations</p>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                        <button onClick={() => setError('')} className="error-close">×</button>
                    </div>
                )}

                <div className="saved-locations-content">
                    {locationsLoading ? (
                        <div className="loading-container">
                            <LoadingSpinner size="large" color="#28A745" />
                            <p>Loading saved locations...</p>
                        </div>
                    ) : savedLocations.length > 0 ? (
                        <div className="saved-locations-grid">
                            {savedLocations.map((location) => (
                                <div key={location.id} className="saved-location-card">
                                    <div className="location-header">
                                        <h3>{location.name}</h3>
                                        <button
                                            className="remove-location-btn"
                                            onClick={() => handleRemoveLocation(location.id)}
                                            aria-label="Remove location"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <p className="location-address">{location.address}</p>
                                    <div className="location-features">
                                        {location.accessibility && <span className="feature-tag" title="Wheelchair accessible">♿</span>}
                                        {location.babyChanging && <span className="feature-tag" title="Baby changing station">👶</span>}
                                        {location.genderNeutral && <span className="feature-tag" title="Gender neutral">👤</span>}
                                    </div>
                                    <p className="saved-date">
                                        Saved on {formatDate(location.savedAt)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-saved-locations">
                            <div className="empty-state">
                                <svg className="empty-state-icon" viewBox="0 0 24 24">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <h3>No saved locations yet</h3>
                                <p>You haven't saved any locations yet.</p>
                                <p>Browse locations and click "Add to My Locations" to save your favorites!</p>
                                <button
                                    onClick={() => navigate('/location-list')}
                                    className="browse-locations-btn"
                                >
                                    Browse Locations
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="navigation-section">
                    <div className="back-dashboard-wrapper">
                        <button
                            onClick={() => navigate('/home')}
                            className="back-dashboard-btn"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
