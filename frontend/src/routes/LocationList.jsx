/* React imports */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* Component imports */
import Header from "../components/Header";
import Footer from "../components/Footer";

/* Configuration */
import { config } from '../config.js';

/* Style imports */
import '../styles/LocationList.css';

export default function LocationList() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [locations, setLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        openNow: false,
        wheelchairAccess: false,
        babyChanging: false,
        genderNeutral: false,
        clean: false
    });

    // Fetch locations from backend API
    useEffect(() => {
        fetchLocations();
    }, []);

    // Filter locations when search query or filters change
    useEffect(() => {
        filterLocations();
    }, [searchQuery, filters, locations]);

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery.trim()) {
                performSearch();
            } else {
                setFilteredLocations(locations);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch from your backend API
            const response = await fetch(`${config.backend.baseURL}${config.backend.endpoints.locations}`);
            if (!response.ok) {
                throw new Error('Failed to fetch locations');
            }
            
            const data = await response.json();
            if (data.success) {
                setLocations(data.data || []);
            } else {
                throw new Error(data.error || 'Failed to fetch locations');
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const performSearch = async () => {
        if (!searchQuery.trim()) {
            setFilteredLocations(locations);
            return;
        }

        try {
            const response = await fetch(`${config.backend.baseURL}${config.backend.endpoints.search}?q=${encodeURIComponent(searchQuery.trim())}`);
            if (!response.ok) {
                throw new Error('Search failed');
            }
            
            const data = await response.json();
            if (data.success) {
                setFilteredLocations(data.data || []);
            } else {
                throw new Error(data.error || 'Search failed');
            }
        } catch (error) {
            console.error('Search error:', error);
            // Fallback to client-side search
            filterLocations();
        }
    };

    const filterLocations = () => {
        let filtered = [...locations];

        // Apply search filter (only if not using backend search)
        if (searchQuery.trim() && !filteredLocations.length) {
            filtered = filtered.filter(location => 
                location.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                location.address?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply checkbox filters
        if (filters.wheelchairAccess) {
            filtered = filtered.filter(location => location.accessibility);
        }
        if (filters.babyChanging) {
            filtered = filtered.filter(location => location.babyChanging);
        }
        if (filters.genderNeutral) {
            filtered = filtered.filter(location => location.genderNeutral);
        }
        if (filters.clean) {
            filtered = filtered.filter(location => (location.cleanliness || 0) >= 4.0);
        }

        setFilteredLocations(filtered);
    };

    const handleFilterChange = (filterName) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: !prev[filterName]
        }));
    };

    const handleLocationClick = (locationId) => {
        // Navigate to location details or open modal
        console.log('Location clicked:', locationId);
        // navigate(`/location/${locationId}`);
    };

    useEffect(() => {
        document.title = 'Spot a John - List';
    }, []);

    if (loading) {
        return (
            <div className="location-list-container">
                <Header 
                    userName="User" 
                    showBackButton={true}
                    backButtonText="Back to Dashboard"
                    backButtonPath="/home"
                />
                <main className="location-list-main">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading locations...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="location-list-container">
                <Header 
                    userName="User" 
                    showBackButton={true}
                    backButtonText="Back to Dashboard"
                    backButtonPath="/home"
                />
                <main className="location-list-main">
                    <div className="error-container">
                        <h2>Error Loading Locations</h2>
                        <p>{error}</p>
                        <button onClick={fetchLocations} className="retry-btn">
                            Try Again
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="location-list-container">
            {/* Header */}
            <Header 
                userName="User" 
                showBackButton={true}
                backButtonText="Back to Dashboard"
                backButtonPath="/home"
            />

            {/* Main Content */}
            <main className="location-list-main">
                <div className="list-header">
                    <h1>Location List</h1>
                    <p>Browse all bathroom locations in a grid format</p>
                </div>

                <div className="list-content">
                    <div className="filter-section">
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search locations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <div className="filter-checkboxes">
                            <label className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={filters.wheelchairAccess}
                                    onChange={() => handleFilterChange('wheelchairAccess')}
                                />
                                <span className="checkmark"></span>
                                Wheelchair Access
                            </label>
                            <label className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={filters.babyChanging}
                                    onChange={() => handleFilterChange('babyChanging')}
                                />
                                <span className="checkmark"></span>
                                Baby Changing
                            </label>
                            <label className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={filters.genderNeutral}
                                    onChange={() => handleFilterChange('genderNeutral')}
                                />
                                <span className="checkmark"></span>
                                Gender Neutral
                            </label>
                            <label className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={filters.clean}
                                    onChange={() => handleFilterChange('clean')}
                                />
                                <span className="checkmark"></span>
                                Clean (4+ stars)
                            </label>
                        </div>
                    </div>

                    {/* Results Summary */}
                    <div className="results-summary">
                        <p>
                            Showing {filteredLocations.length} of {locations.length} locations
                            {searchQuery && ` matching "${searchQuery}"`}
                        </p>
                    </div>

                    {/* Locations Grid */}
                    {filteredLocations.length > 0 ? (
                        <div className="locations-grid">
                            {filteredLocations.map((location) => (
                                <div 
                                    key={location.id} 
                                    className="location-card"
                                    onClick={() => handleLocationClick(location.id)}
                                >
                                    <div className="location-header">
                                        <h3 className="location-name">{location.name}</h3>
                                        <div className="location-rating">
                                            <span className="rating-stars">
                                                {'★'.repeat(Math.floor(location.rating || 0))}
                                                {'☆'.repeat(5 - Math.floor(location.rating || 0))}
                                            </span>
                                            <span className="rating-number">({location.rating?.toFixed(1) || 'N/A'})</span>
                                        </div>
                                    </div>
                                    
                                    <p className="location-address">{location.address}</p>
                                    
                                    <div className="location-features">
                                        {location.accessibility && (
                                            <span className="feature-tag accessibility">♿ Accessible</span>
                                        )}
                                        {location.babyChanging && (
                                            <span className="feature-tag baby-changing">👶 Baby Changing</span>
                                        )}
                                        {location.genderNeutral && (
                                            <span className="feature-tag gender-neutral">🌈 Gender Neutral</span>
                                        )}
                                        {location.cleanliness && (
                                            <span className="feature-tag cleanliness">
                                                🧹 Clean: {location.cleanliness.toFixed(1)}/5
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="location-source">
                                        <span className="source-tag">{location.source || 'Unknown'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-results">
                            <h3>No locations found</h3>
                            <p>
                                {searchQuery 
                                    ? `No locations match "${searchQuery}"` 
                                    : 'No locations available'
                                }
                            </p>
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')} 
                                    className="clear-search-btn"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
