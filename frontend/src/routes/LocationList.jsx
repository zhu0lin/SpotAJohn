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
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const [isScrollingToTop, setIsScrollingToTop] = useState(false);

    // Test backend connectivity
    const testBackendConnection = async () => {
        try {
            const response = await fetch(`${config.backend.baseURL}/`);
            return response.ok;
        } catch (error) {
            console.error('Backend connection test failed:', error);
            return false;
        }
    };

    // Fetch locations from backend API
    useEffect(() => {
        fetchLocations();
    }, []);

    // Filter locations when search query or filters change
    useEffect(() => {
        // Only apply filters if there's no active search
        if (!searchQuery.trim()) {
            filterLocations();
        }
    }, [filters, locations]);

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery.trim()) {
                performSearch();
            } else {
                // Clear search results and show all locations with filters applied
                setFilteredLocations(locations);
                filterLocations();
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Scroll to top button effect
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
            const shouldShow = scrollTop > 50;
            
            setShowScrollToTop(shouldShow);
        };

        // Method 1: Try scroll events on multiple elements
        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('scroll', handleScroll, { passive: true });
        document.documentElement.addEventListener('scroll', handleScroll, { passive: true });
        
        // Method 2: Timer-based check as backup
        const scrollCheckInterval = setInterval(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
            const shouldShow = scrollTop > 50;
            if (shouldShow !== showScrollToTop) {
                setShowScrollToTop(shouldShow);
            }
        }, 100);
        
        // Check on mount
        handleScroll();
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('scroll', handleScroll);
            document.documentElement.removeEventListener('scroll', handleScroll);
            clearInterval(scrollCheckInterval);
        };
    }, [showScrollToTop]);

    const scrollToTop = () => {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        
        // Start blur animation
        setIsScrollingToTop(true);
        
        // Try multiple scrolling methods
        try {
            // Method 1: Smooth scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Method 2: Also try scrolling the document element
            document.documentElement.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Method 3: Fallback to instant scroll
            setTimeout(() => {
                window.scrollTo(0, 0);
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
            }, 100);
            
        } catch (error) {
            console.error('Error scrolling to top:', error);
            // Fallback: instant scroll
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }
        
        // End blur animation after scroll completes
        setTimeout(() => {
            setIsScrollingToTop(false);
        }, 800); // Match the typical smooth scroll duration
    };

    const fetchLocations = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // First test if backend is reachable
            const isBackendReachable = await testBackendConnection();
            if (!isBackendReachable) {
                throw new Error('Backend server is not reachable. Please check if the backend is running.');
            }
            
            const apiUrl = `${config.backend.baseURL}${config.backend.endpoints.locations}`;
            
            // Fetch from your backend API
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response not ok. Status:', response.status, 'Text:', errorText);
                throw new Error(`Failed to fetch locations: ${response.status} ${response.statusText}`);
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
                // Set search results directly without applying filters
                setFilteredLocations(data.data || []);
            } else {
                throw new Error(data.error || 'Search failed');
            }
        } catch (error) {
            console.error('Search error:', error);
            // Fallback to client-side search
            const filtered = locations.filter(location => 
                location.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                location.address?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredLocations(filtered);
        }
    };

    const filterLocations = () => {
        let filtered = [...locations];

        // Don't apply search filter if we have search results from backend
        // Only apply search filter if we're doing client-side fallback
        if (searchQuery.trim() && filteredLocations.length === locations.length) {
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
                        
                        {error.includes('Backend server is not reachable') && (
                            <div className="troubleshooting">
                                <h3>Troubleshooting Steps:</h3>
                                <ul>
                                    <li>Make sure your backend server is running</li>
                                    <li>Check if the backend URL is correct: {config.backend.baseURL}</li>
                                    <li>Verify your backend is accessible at: {config.backend.baseURL}/</li>
                                    <li>Check the browser console for more details</li>
                                </ul>
                            </div>
                        )}
                        
                        {error.includes('quota exceeded') && (
                            <div className="troubleshooting quota-error">
                                <h3>Firebase Quota Exceeded</h3>
                                <p>Your Firebase project has reached its free tier limits.</p>
                                <ul>
                                    <li><strong>Immediate Solution:</strong> Wait for quota reset (usually daily)</li>
                                    <li><strong>Long-term Solution:</strong> Upgrade to Firebase Blaze plan</li>
                                    <li><strong>Current Status:</strong> Using cached data if available</li>
                                </ul>
                                <div className="quota-actions">
                                    <a 
                                        href="https://console.firebase.google.com/project/_/usage" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="quota-link"
                                    >
                                        Check Firebase Usage
                                    </a>
                                    <a 
                                        href="https://firebase.google.com/pricing" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="quota-link"
                                    >
                                        View Pricing Plans
                                    </a>
                                </div>
                            </div>
                        )}
                        
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
                        <div className={`locations-grid ${isScrollingToTop ? 'scrolling-to-top' : ''}`}>
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
                                    
                                    <p className="location-address">
                                        <a 
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="address-link"
                                        >
                                            {location.address}
                                        </a>
                                    </p>
                                    
                                    <div className="location-features">
                                        {location.accessibility && (
                                            <span className="feature-tag accessibility">
                                                <svg className="feature-icon" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M7 4A2 2 0 0 1 9 6A2 2 0 0 1 7 8A2 2 0 0 1 5 6A2 2 0 0 1 7 4M12 15C10.9 15 10 15.9 10 17C10 18.1 10.9 19 12 19C13.1 19 14 18.1 14 17C14 15.9 13.1 15 12 15M7 10C5.9 10 5 10.9 5 12C5 13.1 5.9 14 7 14C8.1 14 9 13.1 9 12C9 10.9 8.1 10 7 10M7 16C5.9 16 5 16.9 5 18C5 19.1 5.9 20 7 20C8.1 20 9 19.1 9 18C9 16.9 8.1 16 7 16M12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10M12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16M17 4A2 2 0 0 1 19 6A2 2 0 0 1 17 8A2 2 0 0 1 15 6A2 2 0 0 1 17 4M17 10C15.9 10 15 10.9 15 12C15 13.1 15.9 14 17 14C18.1 14 19 13.1 19 12C19 10.9 18.1 10 17 10M17 16C15.9 16 15 16.9 15 18C15 19.1 15.9 20 17 20C18.1 20 19 19.1 19 18C19 16.9 18.1 16 17 16Z"/>
                                                </svg>
                                                Accessible
                                            </span>
                                        )}
                                        {location.babyChanging && (
                                            <span className="feature-tag baby-changing">
                                                <svg className="feature-icon" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M18.5 4A2.5 2.5 0 0 1 21 6.5A2.5 2.5 0 0 1 18.5 9A2.5 2.5 0 0 1 16 6.5A2.5 2.5 0 0 1 18.5 4M4.5 20A1.5 1.5 0 0 1 3 18.5A1.5 1.5 0 0 1 4.5 17H11.5A1.5 1.5 0 0 1 13 18.5A1.5 1.5 0 0 1 11.5 20H4.5M16.09 19L14.69 15H11L6 16V7H8V14H10.25L11.5 12.5L12.75 14H15L16.09 19M20 2H4A2 2 0 0 0 2 4V22L6 18H20A2 2 0 0 0 22 16V4A2 2 0 0 0 20 2M20 16H5.17L4 17.17V4H20V16Z"/>
                                                </svg>
                                                Baby Changing
                                            </span>
                                        )}
                                        {location.genderNeutral && (
                                            <span className="feature-tag gender-neutral">
                                                <svg className="feature-icon" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2M12 4A8 8 0 0 1 20 12A8 8 0 0 1 12 20A8 8 0 0 1 4 12A8 8 0 0 1 12 4M12 6A6 6 0 0 0 6 12A6 6 0 0 0 12 18A6 6 0 0 0 18 12A6 6 0 0 0 12 6M12 8A4 4 0 0 1 16 12A4 4 0 0 1 12 16A4 4 0 0 1 8 12A4 4 0 0 1 12 8Z"/>
                                                </svg>
                                                Gender Neutral
                                            </span>
                                        )}
                                        {location.cleanliness && (
                                            <span className="feature-tag cleanliness">
                                                <svg className="feature-icon" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2M12 4.5L11.5 7.5L9 8L11.5 8.5L12 11.5L12.5 8.5L15 8L12.5 7.5L12 4.5Z"/>
                                                </svg>
                                                Clean: {location.cleanliness.toFixed(1)}/5
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

            {/* Scroll to Top Button */}
            {showScrollToTop && (
                <button 
                    className="scroll-to-top-btn"
                    onClick={scrollToTop}
                    aria-label="Scroll to top"
                >
                    <svg className="scroll-to-top-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z"/>
                    </svg>
                </button>
            )}

            <Footer />
        </div>
    );
}
