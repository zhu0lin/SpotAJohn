/* React imports */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* Component imports */
import Header from "../components/Header";
import Footer from "../components/Footer";

/* Style imports */
import '../styles/LocationList.css';

export default function LocationList() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        openNow: false,
        wheelchairAccess: false,
        babyChanging: false,
        genderNeutral: false,
        clean: false
    });

    const handleFilterChange = (filterName) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: !prev[filterName]
        }));
    };

    useEffect(() => {
        document.title = 'Spot a John - List';
    }, []);

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
                    <p>Browse all bathroom locations in a list format</p>
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
                                    checked={filters.openNow}
                                    onChange={() => handleFilterChange('openNow')}
                                />
                                <span className="checkmark"></span>
                                Open Now
                            </label>
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
                                Clean
                            </label>
                        </div>
                    </div>

                    <div className="list-placeholder">
                        <div className="list-placeholder-content">
                            <h2>Location List</h2>
                            {searchQuery && <p>Searching for: <strong>"{searchQuery}"</strong></p>}
                            {Object.entries(filters).some(([_, value]) => value) && (
                                <p>Active filters: <strong>
                                    {Object.entries(filters)
                                        .filter(([_, value]) => value)
                                        .map(([key, _]) => {
                                            switch(key) {
                                                case 'openNow': return 'Open Now';
                                                case 'wheelchairAccess': return 'Wheelchair Access';
                                                case 'babyChanging': return 'Baby Changing';
                                                case 'genderNeutral': return 'Gender Neutral';
                                                case 'clean': return 'Clean';
                                                default: return key;
                                            }
                                        })
                                        .join(', ')
                                    }
                                </strong></p>
                            )}
                            <div className="list-features">
                                <div className="list-feature">
                                    <span className="feature-icon">📋</span>
                                    <span>Browse all locations</span>
                                </div>
                                <div className="list-feature">
                                    <span className="feature-icon">🔍</span>
                                    <span>Search and filter</span>
                                </div>
                                <div className="list-feature">
                                    <span className="feature-icon">⭐</span>
                                    <span>Sort by ratings</span>
                                </div>
                                <div className="list-feature">
                                    <span className="feature-icon">📍</span>
                                    <span>View details</span>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </main>

            <Footer />
        </div>
    );
}
